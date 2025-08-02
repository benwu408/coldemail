# ColdEmail AI - AI-Powered Cold Email Generator

An intelligent cold email generator that uses AI to research prospects, find commonalities, and create personalized outreach emails that actually get responses.

## ✨ Features

- **🤖 AI-Powered Research** - Automatically researches prospects on LinkedIn, company websites, and news
- **🔗 Smart Connections** - Finds alumni, industry, and location-based commonalities
- **✍️ Human-like Writing** - Generates natural, conversational emails that don't sound robotic
- **👤 Profile Integration** - Uses your background to find genuine connections
- **⚡ Fast Generation** - Creates personalized emails in 30 seconds
- **🔒 Privacy First** - Your data stays secure and is never shared

## 🚀 Live Demo

Visit [your-deployed-url] to see the application in action.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide React
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-4o-mini
- **Research**: SearchAPI.io
- **Deployment**: Vercel

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cold-email-ai.git
   cd cold-email-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   OPENAI_API_KEY=your_openai_api_key
   SEARCHAPI_KEY=your_searchapi_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL from `supabase-schema.sql` in your Supabase SQL editor
   - Update your environment variables with Supabase credentials

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Setup Guides

- [OpenAI API Setup](QUICK_SETUP_GUIDE.md)
- [Supabase Authentication Setup](SUPABASE_AUTH_SETUP_GUIDE.md)
- [User Profile Setup](PROFILE_SETUP_GUIDE.md)

## 📁 Project Structure

```
cold-email-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── generate/          # Email generator page
│   ├── profile/           # User profile page
│   ├── faq/              # FAQ page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Header.tsx        # Navigation header
│   ├── HeroPage.tsx      # Landing page
│   └── ColdEmailGenerator.tsx # Main email generator
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## 🎯 Key Features

### AI Research Integration
- Automatically researches prospects online
- Finds recent posts, articles, and company updates
- Discovers education, work history, and interests

### Smart Personalization
- Uses your profile to find genuine connections
- Mentions shared alma mater, industry, or location
- Creates authentic rapport-building opportunities

### Professional Email Generation
- Human-like writing style
- Proper email formatting
- Multiple tone options
- Subject line generation

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for email generation | Yes |
| `SEARCHAPI_KEY` | SearchAPI.io key for web research | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your GitHub repository to Vercel**
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

### Manual Deployment

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o-mini
- Supabase for authentication and database
- SearchAPI.io for web research capabilities
- Vercel for hosting and deployment

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact us at [your-email].

---

Built with ❤️ for better networking 