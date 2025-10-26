# ColdEmail.AI Deployment Guide

Complete step-by-step guide to deploy ColdEmail.AI to production.

## Prerequisites

- Vercel account
- Supabase account
- Clerk account
- Google Cloud account (for Gmail OAuth)
- SendGrid account (optional)
- OpenAI or Anthropic API key

---

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for project to be provisioned
4. Note your project URL and keys

### 1.2 Run Migrations

1. Go to SQL Editor in Supabase Dashboard
2. Run `migrations/001_initial_schema.sql`
3. Run `migrations/002_storage_buckets.sql`
4. Verify tables are created in Table Editor

### 1.3 Configure Storage

1. Go to Storage section
2. Verify `lead_uploads` and `assets` buckets exist
3. Check bucket policies are in place

---

## Step 2: Clerk Setup

### 2.1 Create Application

1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Choose "Email & Password" authentication
4. Note your publishable and secret keys

### 2.2 Configure Redirects

```
Sign-in URL: /sign-in
Sign-up URL: /sign-up
After sign-in: /dashboard
After sign-up: /onboarding
```

### 2.3 Set Up Billing

1. Go to Billing section
2. Create pricing plans:
   - **Free Plan**: Custom metadata `{ "plan": "free" }`
   - **Pro Plan**: $12/month, metadata `{ "plan": "pro" }`
3. Configure Stripe if needed

### 2.4 Webhooks

1. Add webhook endpoint: `https://your-domain.com/api/webhooks/clerk`
2. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `subscription.created`
   - `subscription.updated`
3. Copy webhook signing secret

---

## Step 3: Google Cloud Setup (Gmail OAuth)

### 3.1 Create Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable Gmail API

### 3.2 Configure OAuth

1. Go to APIs & Services > Credentials
2. Create OAuth 2.0 Client ID
3. Application type: Web application
4. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/gmail/callback (for dev)
   https://your-domain.com/api/auth/gmail/callback (for prod)
   ```
5. Download credentials
6. Note Client ID and Client Secret

### 3.3 OAuth Consent Screen

1. Configure consent screen
2. Add scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/gmail.readonly`
3. Add test users if in development

---

## Step 4: SendGrid Setup (Optional)

### 4.1 Create Account

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender email/domain
3. Create API key with Send Mail permissions

### 4.2 Event Webhook

1. Go to Settings > Mail Settings > Event Webhook
2. Enable webhook
3. HTTP Post URL: `https://your-domain.com/api/webhooks/sendgrid`
4. Select events:
   - Delivered
   - Opened
   - Clicked
   - Bounced
   - Spam Reports

---

## Step 5: Environment Variables

Create `.env.local` for local development and add these to Vercel:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***
CLERK_SECRET_KEY=sk_***
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://***.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ***
SUPABASE_SERVICE_ROLE_KEY=eyJ***

# AI Provider
OPENAI_API_KEY=sk-***
# or
ANTHROPIC_API_KEY=sk-ant-***
AI_PROVIDER=openai

# Gmail OAuth
GMAIL_CLIENT_ID=***.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=GOCSPX-***
GMAIL_REDIRECT_URI=https://your-domain.com/api/auth/gmail/callback

# SendGrid
SENDGRID_API_KEY=SG.***
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=ColdEmail.AI

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Security
ENCRYPTION_KEY=*** (generate with: openssl rand -base64 32)
```

---

## Step 6: Deploy to Vercel

### 6.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 6.2 Link Project

```bash
vercel link
```

### 6.3 Add Environment Variables

```bash
# Add each env var
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# ... repeat for all vars
```

Or use Vercel Dashboard:
1. Go to project settings
2. Environment Variables
3. Add all variables from Step 5

### 6.4 Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Step 7: Post-Deployment

### 7.1 Update URLs

1. **Clerk**: Update redirect URLs to production domain
2. **Google OAuth**: Add production redirect URI
3. **SendGrid**: Update webhook URL
4. **Supabase**: Update CORS settings if needed

### 7.2 Test Critical Flows

1. Sign up new user
2. Connect Gmail
3. Create campaign
4. Upload CSV
5. Generate preview
6. Send test email
7. Check tracking

### 7.3 Monitor

1. Check Vercel logs
2. Monitor Supabase database
3. Review Clerk dashboard
4. Check SendGrid events

---

## Step 8: Domain Setup (Optional)

### 8.1 Add Custom Domain

1. Go to Vercel project settings
2. Add domain
3. Configure DNS records
4. Wait for SSL certificate

### 8.2 Update All Services

Update your domain in:
- Clerk redirects
- Google OAuth URIs
- SendGrid webhooks
- Environment variables

---

## Troubleshooting

### Build Fails

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Issues

- Check Supabase service role key
- Verify RLS policies
- Check network/CORS settings

### OAuth Errors

- Verify redirect URIs exactly match
- Check scopes are correct
- Ensure OAuth consent screen is configured

### Email Not Sending

- Verify Gmail connection
- Check SendGrid API key
- Review rate limits
- Check error logs

---

## Security Checklist

- [ ] All secrets are in environment variables (not in code)
- [ ] Gmail tokens are encrypted
- [ ] Supabase RLS is enabled
- [ ] Clerk authentication is required on all protected routes
- [ ] Webhooks have signature verification
- [ ] Rate limiting is in place
- [ ] HTTPS is enforced
- [ ] CORS is properly configured

---

## Performance Optimization

- [ ] Enable caching in Vercel
- [ ] Optimize images
- [ ] Use CDN for static assets
- [ ] Monitor API response times
- [ ] Set up error tracking (Sentry)
- [ ] Configure database indices

---

## Monitoring & Analytics

Recommended tools:
- **Vercel Analytics**: Built-in
- **Sentry**: Error tracking
- **PostHog**: Product analytics
- **Uptime Robot**: Uptime monitoring

---

## Backup Strategy

- Supabase automatic backups (Pro plan)
- Export user data regularly
- Keep migration files in version control
- Document recovery procedures

---

## Support

For issues:
1. Check logs in Vercel dashboard
2. Review Supabase logs
3. Check Clerk logs
4. Review GitHub Issues
5. Contact support@coldemail.ai
