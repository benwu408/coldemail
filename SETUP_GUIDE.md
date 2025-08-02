# Quick Setup Guide - AI Cold Email Generator

## 🚀 Get Started in 5 Minutes

### 1. **Get Your OpenAI API Key**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the API key (it starts with `sk-`)

### 2. **Set Up Environment Variables**
Create a `.env.local` file in the project root:
```bash
echo "OPENAI_API_KEY=your_api_key_here" > .env.local
```
Replace `your_api_key_here` with your actual OpenAI API key.

### 3. **Install Dependencies & Run**
```bash
npm install
npm run dev
```

### 4. **Test the AI**
1. Open [http://localhost:3000](http://localhost:3000)
2. Fill in the form with test data:
   - **Recipient Name**: John Doe
   - **Recipient Role**: Product Manager at Google
   - **Outreach Purpose**: Networking
   - **Context**: We both went to UIUC
   - **Additional Notes**: Interested in your work on AI features
3. Click "Generate Email"
4. Watch GPT-4o-mini create a personalized email!

## 💰 Cost Information
- **GPT-4o-mini**: ~$0.00015 per 1K input tokens
- **Typical email**: ~$0.001-0.002 per generation
- **100 emails**: ~$0.10-0.20 total

## 🔧 Troubleshooting

### "OpenAI API key not configured"
- Make sure you created `.env.local` file
- Check that the API key is correct
- Restart the development server

### "Failed to generate email"
- Check your internet connection
- Verify your OpenAI account has credits
- Check OpenAI's status page for any outages

### API Rate Limits
- The app includes error handling for rate limits
- If you hit limits, wait a moment and try again

## 🎯 What You'll Get

With GPT-4o-mini, you'll get:
- **Personalized emails** based on your input
- **Natural language** that sounds human-written
- **Context-aware** responses (UIUC, LinkedIn, etc.)
- **Tone variations** (Casual, Formal, Confident)
- **Professional quality** emails ready to send

## 🚀 Ready to Deploy?

1. Push to GitHub
2. Connect to Vercel
3. Add `OPENAI_API_KEY` environment variable in Vercel dashboard
4. Deploy!

Your AI-powered cold email generator is ready! 🎉 