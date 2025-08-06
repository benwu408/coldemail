# 🔄 Recurring Billing Setup Guide

## Overview
This guide will help you set up proper monthly recurring billing with Stripe. Your system will automatically:
- ✅ Charge users $10/month
- ✅ Verify payments each month  
- ✅ Downgrade users if payments fail
- ✅ Handle subscription cancellations
- ✅ Provide subscription management UI

---

## 🚀 Quick Setup Checklist

### 1. **Database Setup**
Run this SQL in your Supabase SQL editor:
```sql
-- Run the add-stripe-columns.sql file
-- This adds stripe_customer_id and stripe_subscription_id columns
-- Plus indexes for fast webhook processing
```

### 2. **Stripe Dashboard Configuration**

#### A. Switch to Test Mode (for testing)
- Go to [Stripe Dashboard](https://dashboard.stripe.com)
- Toggle to "Test mode" (top left)

#### B. Create a Recurring Product
1. **Products** → **Add product**
2. **Name**: "Reachful Pro"
3. **Pricing model**: "Recurring"
4. **Price**: $10.00 USD
5. **Billing period**: Monthly
6. **Save product**

#### C. Create Payment Link
1. **Payment links** → **Create payment link**
2. **Select your Pro product** ($10/month)
3. **Collect customer information**: Email ✅
4. **After payment**: Redirect to `https://yoursite.com/upgrade-success`
5. **Copy the payment link** (starts with `https://buy.stripe.com/...`)

### 3. **Update Environment Variables**

Update your `.env.local`:
```bash
# Use TEST keys for testing
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_test_YOUR_TEST_WEBHOOK_SECRET

# For production, use LIVE keys
# STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY  
# STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
```

### 4. **Update Payment Links in Code**

Replace all instances of the old payment link with your new recurring one:

```bash
# Find all payment links
grep -r "buy.stripe.com" components/ app/

# Files to update:
# - components/HeroPage.tsx
# - components/ColdEmailGenerator.tsx  
# - app/pricing/page.tsx
# - components/SubscriptionDashboard.tsx
```

### 5. **Configure Webhooks**

#### A. In Stripe Dashboard:
1. **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL**: `https://yoursite.com/api/stripe-webhook`
3. **Events to send**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **Add endpoint**
5. **Copy the webhook secret** (starts with `whsec_`)

#### B. For Local Testing:
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

---

## 🧪 Testing the System

### Test Payment Flow:
1. **Create test user account**
2. **Try to access Pro features** → Should show upgrade prompt  
3. **Click upgrade** → Redirects to Stripe payment page
4. **Use test card**: `4242 4242 4242 4242` (exp: any future date)
5. **Complete payment** → Should redirect to success page
6. **Verify upgrade**: Header shows "👑 Pro", no usage limits

### Test Monthly Billing:
```bash
# Simulate successful monthly payment
stripe trigger invoice.payment_succeeded

# Simulate failed payment  
stripe trigger invoice.payment_failed

# Check logs in your terminal to see webhook processing
```

### Test Subscription Management:
1. **Go to Profile page** → Should see Subscription Dashboard
2. **View current plan status** and features
3. **Test "Manage Billing" button** → Opens Stripe customer portal

---

## 🔍 How It Works

### **Monthly Payment Verification**
```
Month 1: User pays $10 → webhook: checkout.session.completed → User upgraded to Pro
Month 2: Stripe charges $10 → webhook: invoice.payment_succeeded → User stays Pro  
Month 3: Payment fails → webhook: invoice.payment_failed → User marked past_due
Final retry fails → webhook: customer.subscription.updated → User downgraded to Free
```

### **Database Flow**
```sql
-- When user upgrades
UPDATE profiles 
SET subscription_plan = 'pro', 
    subscription_status = 'active',
    stripe_customer_id = 'cus_123',
    stripe_subscription_id = 'sub_456'
WHERE id = user_id;

-- When monthly payment succeeds  
-- (Webhook ensures user stays Pro)

-- When payment fails
UPDATE profiles 
SET subscription_status = 'past_due'
WHERE stripe_customer_id = 'cus_123';

-- When subscription cancelled
UPDATE profiles 
SET subscription_plan = 'free',
    subscription_status = 'cancelled',
    stripe_customer_id = NULL,
    stripe_subscription_id = NULL
WHERE stripe_customer_id = 'cus_123';
```

### **Webhook Events Handled**
- ✅ `checkout.session.completed` - Initial subscription
- ✅ `invoice.payment_succeeded` - Monthly renewals
- ✅ `invoice.payment_failed` - Failed payments
- ✅ `customer.subscription.updated` - Status changes
- ✅ `customer.subscription.deleted` - Cancellations

---

## 🎯 Key Features Added

### **For Users:**
- 📊 **Subscription Dashboard** on profile page
- 🔔 **Payment status indicators** in header
- ⚠️ **Past due warnings** with payment update prompts
- 💳 **Stripe Customer Portal** for self-service billing
- 📈 **Real-time status updates**

### **For You (Admin):**
- 🔄 **Automatic monthly billing**
- 📉 **Auto-downgrades** on payment failure  
- 📊 **Comprehensive webhook logging**
- 🛠️ **Debug tools** in development mode
- 🏪 **Stripe Portal integration** for customer support

### **Revenue Protection:**
- 💰 **Retry logic** for failed payments
- 🔒 **Grace period** for past due accounts
- 📧 **Stripe emails** for payment issues
- 🔄 **Automatic recovery** when payments resume

---

## 🚨 Important Notes

### **Before Going Live:**
1. ✅ Test all webhook events thoroughly
2. ✅ Switch to Stripe LIVE keys
3. ✅ Update payment links to LIVE versions
4. ✅ Configure LIVE webhook endpoints
5. ✅ Test customer portal in LIVE mode

### **Customer Portal Setup:**
You'll need to configure Stripe's customer portal:
1. **Settings** → **Billing** → **Customer portal**
2. **Enable** subscription cancellation
3. **Enable** payment method updates
4. **Customize** branding and messaging

---

## 📞 Support & Troubleshooting

### **Common Issues:**
- **Webhook not firing**: Check endpoint URL and event selection
- **User not upgrading**: Verify webhook secret and user lookup logic
- **Payment failing**: Check test card numbers and Stripe dashboard

### **Monitoring:**
- Check **Stripe Dashboard** → **Events** for webhook delivery
- Monitor **application logs** for webhook processing
- Use **Supabase dashboard** to verify database updates

### **Debug Mode:**
The subscription dashboard shows debug info in development:
```json
{
  "subscription": { "plan_name": "pro", "status": "active" },
  "profile": { "stripe_customer_id": "cus_123" }
}
```

---

🎉 **Your recurring billing system is now ready!** Users will be automatically charged monthly and downgraded if payments fail. 