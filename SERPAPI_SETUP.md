# SerpAPI Setup Guide

## 🚀 Get Your SerpAPI Key

### 1. **Sign Up for SerpAPI**
1. Go to [SerpAPI](https://serpapi.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. **Get Your API Key**
1. After signing in, go to your dashboard
2. Copy your API key (it starts with `sk-` or similar)
3. Add it to your `.env.local` file:
   ```bash
   echo "SERPAPI_KEY=your_serpapi_key_here" >> .env.local
   ```

### 3. **Free Tier Information**
- **100 searches per month** (free)
- **Additional searches**: $0.05 each
- **Perfect for testing** and small-scale use

## 🔧 How Research Works

### **What Gets Searched**
When you enable "Use AI to Research Recipient", the app searches for:
1. **Basic Info**: `[Name] [Company] [Role]`
2. **LinkedIn**: `[Name] LinkedIn`
3. **Education**: `[Name] education background`
4. **Recent Work**: `[Name] recent projects deals`
5. **Achievements**: `[Name] awards achievements`

### **What Gets Found**
- **Education**: University, degree, graduation year
- **Experience**: Career history, companies, roles
- **Achievements**: Awards, recognitions, publications
- **Recent Work**: Current projects, deals, launches
- **Personal Info**: Location, interests, specializations

### **How It's Used**
- Research findings are displayed in a dedicated section
- GPT-4o-mini incorporates findings naturally into emails
- Shows you've done your homework and are genuinely interested

## 💰 Cost Breakdown

### **Without Research**
- OpenAI GPT-4o-mini: ~$0.001-0.002 per email
- **100 emails**: ~$0.10-0.20

### **With Research**
- OpenAI GPT-4o-mini: ~$0.001-0.002 per email
- SerpAPI searches: ~$0.05 per email (5 searches)
- **Total per email**: ~$0.06-0.08
- **100 emails**: ~$6-8

## 🎯 Example Research Results

### **Input**
- Name: "Sarah Chen"
- Role: "Product Manager"
- Company: "Google"

### **Research Findings**
- "Sarah Chen is a Senior Product Manager at Google, leading AI initiatives..."
- "Sarah graduated from Stanford University with a Master's in Computer Science..."
- "Sarah was recognized in Forbes 30 Under 30 for her work on Google's AI features..."
- "Sarah is based in San Francisco and passionate about AI ethics..."

### **Generated Email**
```
Hi Sarah,

I hope you're doing well! I came across your work at Google, particularly your leadership in AI initiatives, and was impressed by your recognition in Forbes 30 Under 30. As a fellow Stanford alum passionate about AI ethics, I'd love to connect...

[Rest of personalized email]
```

## 🚀 Ready to Use!

1. **Add your SerpAPI key** to `.env.local`
2. **Restart the development server**
3. **Enable "Use AI to Research Recipient"** in the form
4. **Generate emails** with real research!

Your emails will now be **significantly more personalized** and **much more likely to get responses**! 🎉 