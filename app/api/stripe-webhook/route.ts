import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Stripe webhook handler for processing subscription changes
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  console.log('=== Stripe Webhook Handler Started ===')
  
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  
  if (!signature) {
    console.error('No Stripe signature found')
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    console.log('Webhook event constructed successfully:', event.type)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Processing checkout.session.completed event')
        const session = event.data.object as Stripe.Checkout.Session
        
        // Get customer details
        const customerEmail = session.customer_details?.email
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string
        console.log('Customer email from session:', customerEmail)
        console.log('Customer ID:', customerId)
        console.log('Subscription ID:', subscriptionId)
        
        if (!customerEmail) {
          console.error('No customer email found in session')
          return NextResponse.json({ error: 'No customer email' }, { status: 400 })
        }

        // Find the user by email
        const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
        
        if (userError) {
          console.error('Error fetching users:', userError)
          return NextResponse.json({ error: 'User lookup failed' }, { status: 500 })
        }

        const user = userData.users.find(u => u.email === customerEmail)
        
        if (!user) {
          console.error('User not found for email:', customerEmail)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        console.log('Found user:', user.id, user.email)

        // Upgrade user to pro and store Stripe IDs
        const { error: upgradeError } = await supabase.rpc('assign_user_subscription', {
          user_uuid: user.id,
          plan_name: 'pro',
          subscription_status: 'active',
          billing_cycle_param: 'monthly'
        })

        if (upgradeError) {
          console.error('Error upgrading user to pro:', upgradeError)
          return NextResponse.json({ error: 'Upgrade failed' }, { status: 500 })
        }

        // Update the profiles table with Stripe IDs
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_plan: 'pro',
            subscription_status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId
          })
          .eq('id', user.id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          // Don't fail the webhook for this, just log it
        }

        console.log('Successfully upgraded user to Pro:', user.email)
        break

      case 'invoice.payment_succeeded':
        console.log('Processing invoice.payment_succeeded event')
        const successfulInvoice = event.data.object as Stripe.Invoice
        
        // This happens every month when subscription renews
        const successCustomerId = successfulInvoice.customer as string
        const successSubscriptionId = successfulInvoice.subscription as string
        
        console.log('Payment succeeded for customer:', successCustomerId)
        console.log('Subscription:', successSubscriptionId)
        
        // Find user by Stripe customer ID
        const { data: successUserData, error: successUserError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('stripe_customer_id', successCustomerId)
          .single()
        
        if (successUserError || !successUserData) {
          console.error('User not found for customer ID:', successCustomerId)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        
        // Ensure user is active (in case they were suspended for failed payment)
        const { error: renewError } = await supabase.rpc('assign_user_subscription', {
          user_uuid: successUserData.id,
          plan_name: 'pro',
          subscription_status: 'active',
          billing_cycle_param: 'monthly'
        })
        
        if (renewError) {
          console.error('Error renewing user subscription:', renewError)
        }
        
        // Update profiles table
        await supabase
          .from('profiles')
          .update({
            subscription_plan: 'pro',
            subscription_status: 'active'
          })
          .eq('id', successUserData.id)
        
        console.log('Successfully renewed subscription for user:', successUserData.email)
        break

      case 'invoice.payment_failed':
        console.log('Processing invoice.payment_failed event')
        const failedInvoice = event.data.object as Stripe.Invoice
        
        // This happens when monthly payment fails
        const failedCustomerId = failedInvoice.customer as string
        const failedSubscriptionId = failedInvoice.subscription as string
        
        console.log('Payment failed for customer:', failedCustomerId)
        console.log('Subscription:', failedSubscriptionId)
        
        // Find user by Stripe customer ID
        const { data: failedUserData, error: failedUserError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('stripe_customer_id', failedCustomerId)
          .single()
        
        if (failedUserError || !failedUserData) {
          console.error('User not found for customer ID:', failedCustomerId)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        
        // Get the subscription to check retry attempts
        const subscription = await stripe.subscriptions.retrieve(failedSubscriptionId)
        
        // If this is the final attempt, downgrade to free
        if (subscription.status === 'unpaid' || subscription.status === 'canceled') {
          console.log('Final payment attempt failed, downgrading user to free')
          
          const { error: downgradeError } = await supabase.rpc('assign_user_subscription', {
            user_uuid: failedUserData.id,
            plan_name: 'free',
            subscription_status: 'cancelled',
            billing_cycle_param: 'monthly'
          })
          
          if (downgradeError) {
            console.error('Error downgrading user:', downgradeError)
          }
          
          // Update profiles table
          await supabase
            .from('profiles')
            .update({
              subscription_plan: 'free',
              subscription_status: 'cancelled'
            })
            .eq('id', failedUserData.id)
          
          console.log('Downgraded user to free due to failed payments:', failedUserData.email)
        } else {
          // Just mark as past due, but keep pro access for now
          await supabase
            .from('profiles')
            .update({
              subscription_status: 'past_due'
            })
            .eq('id', failedUserData.id)
          
          console.log('Marked user as past due:', failedUserData.email)
        }
        break

      case 'customer.subscription.updated':
        console.log('Processing customer.subscription.updated event')
        const updatedSubscription = event.data.object as Stripe.Subscription
        
        const updatedCustomerId = updatedSubscription.customer as string
        const updatedStatus = updatedSubscription.status
        
        console.log('Subscription updated for customer:', updatedCustomerId)
        console.log('New status:', updatedStatus)
        
        // Find user by Stripe customer ID
        const { data: updatedUserData, error: updatedUserError } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('stripe_customer_id', updatedCustomerId)
          .single()
        
        if (updatedUserError || !updatedUserData) {
          console.error('User not found for customer ID:', updatedCustomerId)
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        
        // Update user based on subscription status
        let newPlan = 'free'
        let newStatus = 'cancelled'
        
        if (updatedStatus === 'active' || updatedStatus === 'trialing') {
          newPlan = 'pro'
          newStatus = 'active'
        } else if (updatedStatus === 'past_due') {
          newPlan = 'pro' // Keep pro for now
          newStatus = 'past_due'
        } else if (updatedStatus === 'canceled' || updatedStatus === 'unpaid') {
          newPlan = 'free'
          newStatus = 'cancelled'
        }
        
        const { error: updateError } = await supabase.rpc('assign_user_subscription', {
          user_uuid: updatedUserData.id,
          plan_name: newPlan,
          subscription_status: newStatus,
          billing_cycle_param: 'monthly'
        })
        
        if (updateError) {
          console.error('Error updating user subscription:', updateError)
        }
        
        // Update profiles table
        await supabase
          .from('profiles')
          .update({
            subscription_plan: newPlan,
            subscription_status: newStatus
          })
          .eq('id', updatedUserData.id)
        
        console.log('Updated user subscription status:', updatedUserData.email, 'to', newPlan, newStatus)
        break

      case 'customer.subscription.deleted':
        console.log('Processing customer.subscription.deleted event')
        const deletedSubscription = event.data.object as Stripe.Subscription
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(deletedSubscription.customer as string)
        const email = (customer as Stripe.Customer).email
        
        if (!email) {
          console.error('No customer email found for cancelled subscription')
          return NextResponse.json({ error: 'No customer email' }, { status: 400 })
        }

        // Find and downgrade user
        const { data: cancelUserData, error: cancelUserError } = await supabase.auth.admin.listUsers()
        
        if (cancelUserError) {
          console.error('Error fetching users for cancellation:', cancelUserError)
          return NextResponse.json({ error: 'User lookup failed' }, { status: 500 })
        }

        const cancelUser = cancelUserData.users.find(u => u.email === email)
        
        if (cancelUser) {
          // Downgrade to free
          const { error: downgradeError } = await supabase.rpc('assign_user_subscription', {
            user_uuid: cancelUser.id,
            plan_name: 'free',
            subscription_status: 'cancelled',
            billing_cycle_param: 'monthly'
          })
          
          if (downgradeError) {
            console.error('Error downgrading user:', downgradeError)
          }
          
          // Update profiles table and clear Stripe IDs
          await supabase
            .from('profiles')
            .update({
              subscription_plan: 'free',
              subscription_status: 'cancelled',
              stripe_customer_id: null,
              stripe_subscription_id: null
            })
            .eq('id', cancelUser.id)
          
          console.log('Successfully downgraded user to free:', email)
        }
        break

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
} 