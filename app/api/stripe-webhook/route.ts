import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia',
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
        console.log('Customer email from session:', customerEmail)
        
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

        // Upgrade user to pro
        const { error: upgradeError } = await supabase.rpc('assign_user_subscription', {
          user_uuid: user.id,
          plan_name: 'pro',
          subscription_status: 'active',
          billing_cycle: 'monthly'
        })

        if (upgradeError) {
          console.error('Error upgrading user to pro:', upgradeError)
          return NextResponse.json({ error: 'Upgrade failed' }, { status: 500 })
        }

        // Also update the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            subscription_plan: 'pro',
            subscription_status: 'active'
          })
          .eq('id', user.id)

        if (profileError) {
          console.error('Error updating profile:', profileError)
          // Don't fail the webhook for this, just log it
        }

        console.log('Successfully upgraded user to Pro:', user.email)
        break

      case 'customer.subscription.deleted':
        console.log('Processing customer.subscription.deleted event')
        const subscription = event.data.object as Stripe.Subscription
        
        // Get customer email from Stripe
        const customer = await stripe.customers.retrieve(subscription.customer as string)
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
            subscription_status: 'cancelled'
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