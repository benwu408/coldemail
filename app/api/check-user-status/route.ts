import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const email = url.searchParams.get('email')
  
  if (!email) {
    return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
  }
  
  try {
    // Find user in auth
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
    
    if (userError) {
      return NextResponse.json({ error: 'Failed to fetch users', details: userError }, { status: 500 })
    }
    
    const user = userData.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ 
        found: false, 
        error: 'User not found',
        availableEmails: userData.users.map(u => u.email).slice(0, 5) // Show first 5 for privacy
      })
    }
    
    // Get user's profile with subscription info
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_plan, subscription_status, stripe_customer_id, stripe_subscription_id, updated_at')
      .eq('user_id', user.id)
      .single()
    
    if (profileError) {
      return NextResponse.json({ 
        found: true,
        userId: user.id,
        userEmail: user.email,
        profileError: profileError.message
      })
    }
    
    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      profile: profileData,
      subscription: {
        plan_name: profileData.subscription_plan,
        status: profileData.subscription_status
      }
    })
    
  } catch (error) {
    return NextResponse.json({ error: 'Check failed', details: error }, { status: 500 })
  }
} 