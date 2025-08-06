import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  console.log('Testing database schema...')
  
  try {
    // Check if Stripe columns exist in profiles table
    const { data: columnCheck, error: columnError } = await supabase
      .rpc('sql', {
        query: `
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'profiles' 
          AND column_name IN ('stripe_customer_id', 'stripe_subscription_id', 'subscription_plan', 'subscription_status')
          ORDER BY column_name;
        `
      })
    
    // Check if RPC function exists
    let rpcFunctionExists = false
    try {
      const { error: rpcError } = await supabase.rpc('assign_user_subscription', {
        user_uuid: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        plan_name: 'test',
        subscription_status: 'test',
        billing_cycle_param: 'test'
      })
      
      // If we get a specific error about the user not existing, the function exists
      rpcFunctionExists = rpcError?.message?.includes('not found') || rpcError?.message?.includes('does not exist')
    } catch (rpcErr) {
      rpcFunctionExists = false
    }
    
    // Check subscription_plans table
    const { data: plansData, error: plansError } = await supabase
      .from('subscription_plans')
      .select('name, display_name')
      .limit(5)
    
    return NextResponse.json({ 
      success: true,
      database: {
        profilesColumns: columnCheck || [],
        columnError: columnError?.message,
        rpcFunctionExists,
        subscriptionPlans: plansData || [],
        plansError: plansError?.message
      }
    })
    
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Database test failed',
      details: error
    }, { status: 500 })
  }
} 