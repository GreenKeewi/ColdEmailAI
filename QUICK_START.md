# ColdEmail.AI Quick Reference

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd ColdEmailAI
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local with your keys

# 3. Run migrations
# Copy SQL from migrations/ to Supabase SQL Editor

# 4. Start development
npm run dev
```

## 📁 Project Structure

```
ColdEmailAI/
├── src/
│   ├── app/              # Next.js pages & API routes
│   │   ├── api/          # Backend API endpoints
│   │   ├── dashboard/    # Dashboard pages
│   │   └── page.tsx      # Landing page
│   ├── lib/              # Utilities & helpers
│   │   ├── ai.ts         # AI generation
│   │   ├── gmail.ts      # Gmail integration
│   │   ├── sendgrid.ts   # SendGrid integration
│   │   ├── supabase.ts   # Database client
│   │   └── usage.ts      # Quota management
│   └── middleware.ts     # Auth middleware
├── migrations/           # Database migrations
├── docs/                 # Documentation
└── seed/                 # Sample data
```

## 🔑 Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk auth |
| `CLERK_SECRET_KEY` | Yes | Clerk server |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase admin |
| `OPENAI_API_KEY` | Yes* | OpenAI API |
| `ANTHROPIC_API_KEY` | Yes* | Anthropic API |
| `GMAIL_CLIENT_ID` | Yes | Gmail OAuth |
| `GMAIL_CLIENT_SECRET` | Yes | Gmail OAuth |
| `SENDGRID_API_KEY` | No | SendGrid (optional) |
| `ENCRYPTION_KEY` | Yes | Token encryption |

*Choose one AI provider

## 📚 API Routes

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/auth/gmail` - Initiate Gmail OAuth
- `GET /api/auth/gmail/callback` - OAuth callback
- `POST /api/auth/gmail/disconnect` - Disconnect Gmail

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/:id` - Get campaign
- `POST /api/campaigns/:id/preview` - Generate AI preview

### Settings & Billing
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings
- `GET /api/billing` - Get billing info
- `GET /api/usage` - Get usage stats

### Webhooks
- `POST /api/webhooks/sendgrid` - SendGrid events

### Tracking
- `GET /api/track/open/:id` - Track email open

## 🛠️ Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm test            # Run tests

# Migrations
npm run migrate      # Show migration info

# Deployment
vercel              # Deploy to preview
vercel --prod       # Deploy to production
```

## 🧪 Testing Flow

1. Sign up → `/sign-up`
2. Onboarding → `/onboarding`
3. Create campaign → Dashboard → "Create Campaign"
4. Add leads → Campaign detail → Upload CSV
5. Generate preview → Select lead → "Generate Preview"
6. Schedule → "Schedule Campaign"

## 🐛 Troubleshooting

### Build fails
```bash
rm -rf .next node_modules
npm install
npm run build
```

### OAuth redirect mismatch
- Check `GMAIL_REDIRECT_URI` matches Google Console exactly
- Ensure http/https protocol matches

### Database connection
- Verify Supabase keys
- Check RLS policies
- Ensure migrations ran

### AI generation fails
- Check API key validity
- Verify API credits/quota
- Check provider status

## 📊 Database Schema

**Tables:**
- `users` - User accounts (synced with Clerk)
- `campaigns` - Email campaigns
- `leads` - Campaign recipients
- `messages` - Individual emails sent
- `events` - Email events (opens, clicks)
- `usage_logs` - Quota tracking
- `settings` - User preferences

**Storage:**
- `lead_uploads` - CSV files
- `assets` - General assets

## 🔒 Security Checklist

- [ ] All secrets in environment variables
- [ ] OAuth tokens encrypted (AES-256-GCM)
- [ ] HTTPS enforced
- [ ] Clerk auth on protected routes
- [ ] Rate limiting enabled
- [ ] RLS enabled in Supabase
- [ ] Webhook signature verification
- [ ] Input validation on all forms

## 🚦 Deployment Checklist

- [ ] Set up Clerk account
- [ ] Set up Supabase project
- [ ] Run database migrations
- [ ] Configure Google OAuth
- [ ] Set up SendGrid (optional)
- [ ] Add env vars to Vercel
- [ ] Deploy to Vercel
- [ ] Update OAuth redirect URLs
- [ ] Test critical flows
- [ ] Monitor logs

## 📖 Resources

- [Full Documentation](docs/)
- [API Reference](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Demo Script](docs/demo-script.md)
- [AI Prompts](docs/ai-prompts.md)

## 🆘 Support

- GitHub Issues
- Email: support@coldemail.ai
- Documentation: `docs/`

## 📝 License

MIT License - See [LICENSE](LICENSE)
