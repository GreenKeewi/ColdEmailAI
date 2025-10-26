# ColdEmail.AI

> AI-Powered Cold Email Outreach Platform

ColdEmail.AI is a production-ready web application that helps you write, schedule, send, and track personalized cold emails using AI. Built with Next.js, Clerk, Supabase, and OpenAI/Anthropic.

## Features

- ✨ **AI-Generated Content**: Use GPT-4 or Claude to generate personalized subject lines, email bodies, and follow-up sequences
- 📊 **Advanced Analytics**: Track opens, clicks, and replies in real-time
- ✉️ **Multi-Provider Email**: Send via Gmail (OAuth) or SendGrid
- 🔐 **Secure Authentication**: Clerk-powered auth with subscription billing
- 💳 **Flexible Billing**: Free plan (25 emails/month) and Pro plan ($12/month unlimited)
- 📈 **Campaign Management**: Create, schedule, and manage multiple campaigns
- 🎯 **Lead Tracking**: Upload CSV, map fields, and track individual lead engagement
- 🔄 **Automated Follow-ups**: Smart 3-stage follow-up sequences

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Authentication & Billing**: Clerk
- **Database & Storage**: Supabase (PostgreSQL + Storage)
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Email**: Gmail API + SendGrid
- **Deployment**: Vercel

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Clerk account (for auth & billing)
- A Supabase project
- An OpenAI API key or Anthropic API key
- A Google Cloud project (for Gmail OAuth)
- A SendGrid account (optional, for fallback sending)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ColdEmailAI
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx

# AI Provider (choose one or both)
OPENAI_API_KEY=sk-xxx
# or
ANTHROPIC_API_KEY=sk-ant-xxx
AI_PROVIDER=openai

# Gmail OAuth
GMAIL_CLIENT_ID=xxx.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-xxx
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/gmail/callback

# SendGrid (optional)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Security
ENCRYPTION_KEY=<generate-with-openssl-rand-base64-32>
```

### 3. Database Setup

Run the Supabase migrations:

```bash
# In your Supabase SQL Editor, run:
# migrations/001_initial_schema.sql
# migrations/002_storage_buckets.sql
```

Or use the Supabase CLI:

```bash
npx supabase db push
```

### 4. Clerk Setup

1. Go to [clerk.com](https://clerk.com) and create a new application
2. Enable email/password authentication
3. Configure billing in Clerk Dashboard:
   - Create a "Free" plan (custom metadata: `plan: "free"`)
   - Create a "Pro" plan at $12/month (custom metadata: `plan: "pro"`)
4. Set up webhooks to sync user data with Supabase
5. Copy your publishable and secret keys to `.env.local`

### 5. Google OAuth Setup (Gmail Integration)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Gmail API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/gmail/callback`
   - For production: `https://your-domain.com/api/auth/gmail/callback`
5. Copy Client ID and Client Secret to `.env.local`

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables from `.env.local`
4. Deploy

```bash
# Or use Vercel CLI
npx vercel
```

### Configure Production Services

**Clerk:**
- Update redirect URLs to production domain
- Configure production billing webhook

**Google OAuth:**
- Add production redirect URI in Google Cloud Console
- Verify domain ownership

**SendGrid:**
- Configure Event Webhook: `https://your-domain.com/api/webhooks/sendgrid`
- Verify sender identity

**Supabase:**
- Update CORS settings to allow your production domain

## Usage Guide

### Creating Your First Campaign

1. **Sign Up**: Create an account at `/sign-up`
2. **Onboarding**: Connect your Gmail account (or skip to use SendGrid)
3. **Upload Leads**: 
   - Go to Dashboard
   - Click "Create Campaign"
   - Upload CSV with columns: email, first_name, last_name, company, title
4. **Generate Preview**:
   - Select a lead
   - Click "Generate & Preview"
   - Review AI-generated subject and body
   - Edit if needed
5. **Schedule Campaign**:
   - Set daily send limit
   - Choose start time
   - Click "Schedule Campaign"
6. **Track Results**:
   - View opens, clicks, and replies in real-time
   - Respond to engaged leads

### Demo Script

For a quick demo of the app:

```bash
# 1. Create account
#    - Go to /sign-up
#    - Use test email: demo@example.com

# 2. Connect Gmail (optional)
#    - Go to Settings
#    - Click "Connect Gmail"
#    - Authorize with Google

# 3. Upload sample leads
#    - Use seed/sample-leads.csv
#    - Upload in campaign builder

# 4. Generate preview
#    - Select first lead
#    - Click "Generate & Preview"
#    - See AI-generated content

# 5. Test send
#    - Send to your own email
#    - Check inbox
#    - Click tracking link
#    - View analytics update
```

## Project Structure

```
ColdEmailAI/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── sign-in/      # Auth pages
│   │   └── sign-up/
│   ├── components/       # React components
│   └── lib/              # Utilities & helpers
│       ├── ai.ts         # AI generation logic
│       ├── supabase.ts   # Database client
│       ├── gmail.ts      # Gmail API
│       ├── sendgrid.ts   # SendGrid API
│       ├── usage.ts      # Quota management
│       └── encryption.ts # Token encryption
├── migrations/           # Database migrations
├── docs/                 # Documentation
│   ├── ai-prompts.md    # AI prompt templates
│   └── api.md           # API documentation
├── seed/                 # Sample data
└── scripts/              # Utility scripts
```

## API Documentation

See [docs/api.md](docs/api.md) for complete API reference.

### Key Endpoints

- `POST /api/campaigns` - Create campaign
- `POST /api/campaigns/:id/preview` - Generate AI preview
- `POST /api/campaigns/:id/schedule` - Schedule campaign
- `GET /api/usage` - Check quota
- `POST /api/webhooks/sendgrid` - Email tracking events

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Security & Compliance

- **Token Encryption**: Gmail refresh tokens are encrypted using AES-256-GCM
- **Rate Limiting**: Per-user send limits enforced (Free: 25/month, Pro: 10,000/month)
- **Data Privacy**: Users can delete all their data via Settings
- **CAN-SPAM Compliance**: All emails include unsubscribe mechanism
- **OAuth Security**: Secure token storage and refresh

## Troubleshooting

### Build Errors

**Issue**: Module not found errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database Connection

**Issue**: Supabase connection failed
```bash
# Check:
# 1. Environment variables are correct
# 2. Supabase project is active
# 3. RLS policies are configured
```

### Gmail OAuth

**Issue**: Redirect URI mismatch
```bash
# Solution:
# 1. Check GMAIL_REDIRECT_URI in .env matches Google Console
# 2. Ensure exact match including http/https and trailing slash
```

### AI Generation

**Issue**: OpenAI API errors
```bash
# Check:
# 1. API key is valid and has credits
# 2. Rate limits not exceeded
# 3. Model name is correct (gpt-4, gpt-3.5-turbo)
```

## Roadmap

- [ ] A/B testing for subject lines
- [ ] Email templates library
- [ ] Bulk actions for campaigns
- [ ] Advanced scheduling (timezone-aware)
- [ ] Reply detection and auto-pause
- [ ] Integrations (Slack, Zapier)
- [ ] Team collaboration features

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- **Documentation**: [docs/](docs/)
- **Issues**: GitHub Issues
- **Email**: support@coldemail.ai

## Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org)
- [Clerk](https://clerk.com)
- [Supabase](https://supabase.com)
- [OpenAI](https://openai.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)

---

**Note**: This is a production-ready application. Always test thoroughly before deploying to production and ensure compliance with email marketing regulations in your jurisdiction.
