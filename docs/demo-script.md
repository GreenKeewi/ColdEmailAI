# ColdEmail.AI Demo Script

Complete walkthrough to demonstrate all features of ColdEmail.AI.

## Prerequisites

- Application deployed and running
- Test Gmail account (optional)
- Test email address for receiving demos

---

## Demo Flow

### 1. Landing Page (2 minutes)

**What to show:**
- Modern, professional landing page
- Clear value proposition
- Pricing comparison (Free vs Pro)
- Benefits sections
- CTAs throughout

**Script:**
"Welcome to ColdEmail.AI! This is an AI-powered cold email outreach platform that helps you write, schedule, send, and track personalized emails at scale. Notice how the landing page clearly explains the value - you can generate 25 AI emails per month for free, or upgrade to Pro for unlimited emails at just $12/month."

---

### 2. Sign Up (1 minute)

**Steps:**
1. Click "Start for Free" or "Sign Up"
2. Enter email: `demo@example.com`
3. Set password
4. Click "Sign Up"

**Script:**
"Signing up is simple - we use Clerk for authentication, which provides enterprise-grade security. Just enter your email and password, and you're in."

---

### 3. Onboarding Flow (3 minutes)

**Step 1: Connect Gmail**

**What to show:**
- Privacy-first messaging
- Option to connect Gmail or skip
- Clear explanation of OAuth

**Script:**
"The first step is connecting your email account. We emphasize privacy - emails are sent from YOUR account, not ours. We never send without your explicit approval. Your Gmail tokens are encrypted using AES-256-GCM encryption."

**Actions:**
- Click "Connect Gmail"
- Authorize with Google (or click "Skip for now")

**Step 2: Set Preferences**

**What to show:**
- Tone selection (Professional, Casual, Friendly, Formal)
- Daily send limit
- Follow-up cadence

**Script:**
"Now you can set your preferences. Choose your default email tone - the AI will use this when generating emails. Set a daily send limit to avoid hitting rate limits, and configure how many days between follow-ups."

**Actions:**
- Select "Professional" tone
- Set daily limit: 50
- Set follow-up cadence: 3 days
- Click "Complete Setup"

---

### 4. Dashboard (2 minutes)

**What to show:**
- Clean, modern dashboard
- Campaign statistics (Total, Sent, Opens, Replies)
- Campaign list
- "Create Campaign" button

**Script:**
"Welcome to your dashboard! This is your command center. You can see all your campaigns, track performance metrics, and create new campaigns. Right now we don't have any campaigns yet, so let's create one."

---

### 5. Create Campaign (5 minutes)

**Step 1: Create Campaign**

**Actions:**
1. Click "+ Create Campaign"
2. Enter name: "Q4 Outreach Demo"
3. Click "Create"

**Step 2: View Campaign**

**Script:**
"Great! We've created a campaign. Now let's add some leads. In a real scenario, you'd upload a CSV with hundreds of leads. For this demo, we'll use a sample CSV."

**What to show:**
- Campaign detail page
- Stats showing 0 leads
- Empty leads table

---

### 6. Upload Leads (2 minutes)

**Using Sample CSV:**

**Script:**
"Let me show you our sample CSV. It has three demo leads with all the required fields: email, first name, last name, company, and title. You can upload a CSV with thousands of leads if needed."

**Sample leads from seed/sample-leads.csv:**
```csv
email,first_name,last_name,company,title
john.doe@acmecorp.com,John,Doe,Acme Corp,Marketing Director
jane.smith@techstartup.io,Jane,Smith,Tech Startup,CEO
bob.wilson@enterprise.com,Bob,Wilson,Enterprise Solutions,VP of Sales
```

**Note:** In the current implementation, CSV upload would need to be implemented via the campaign creation API or a separate upload endpoint.

---

### 7. Generate AI Preview (5 minutes)

**Actions:**
1. From campaign detail page, click "Generate Preview" on first lead
2. Wait for AI generation (shows loading)
3. Review generated content

**What to show:**
- 3 subject line options
- Full email body
- 3 follow-up emails (Follow-up 1, 2, 3)

**Script:**
"This is where the AI magic happens! Watch as GPT-4 generates three personalized subject lines, a complete email body, and three follow-up emails - all tailored to John Doe, Marketing Director at Acme Corp. 

Notice how:
- Subject lines are under 60 characters
- The email is personalized with John's name and company
- The tone is professional as we selected
- Follow-ups get progressively shorter and less pushy
- No spam trigger words
- Each follow-up offers value"

**Example Output:**
```
Subject 1: "Quick thought on Acme Corp's marketing strategy, John"
Subject 2: "Helping Acme Corp scale marketing efforts"
Subject 3: "Marketing automation insights for Acme Corp"

Body:
Hi John,

I noticed Acme Corp has been growing rapidly, and I wanted to reach out with a solution that might help your marketing team scale more efficiently.

[AI-generated value proposition...]

Would you be open to a quick 15-minute call this week?

Best regards,
[Your name]

---

Follow-up 1 (3 days later):
Hi John,

Just wanted to follow up on my previous email about marketing automation. I came across an interesting case study that reminded me of Acme Corp's situation...

---

Follow-up 2 (6 days after initial):
Hi John,

I know you're busy, so I'll keep this brief. Here's a resource I thought might be valuable...

---

Follow-up 3 (9 days after initial):
Hi John,

This is my last follow-up. I appreciate your time. If you'd ever like to discuss marketing automation, I'm here...
```

---

### 8. Edit and Customize (2 minutes)

**What to show:**
- Editable preview
- Ability to regenerate
- Option to send test email

**Script:**
"You're not locked into the AI's first draft. You can edit any part of the email, regenerate if you want different options, or send a test email to yourself to see exactly how it looks."

**Actions:**
- Edit a subject line
- Edit email body
- Click "Send Test Email"

---

### 9. Settings (3 minutes)

**Navigate to Settings**

**What to show:**

**Email Connections:**
- Gmail connected status
- SendGrid fallback
- Ability to disconnect

**AI Settings:**
- Default tone selector

**Campaign Settings:**
- Daily send limit
- Follow-up cadence

**Data & Privacy:**
- Delete account option

**Script:**
"In settings, you can manage your email connections, adjust AI preferences, and configure campaign defaults. Notice the Data & Privacy section - users have full control and can delete all their data at any time."

---

### 10. Billing & Usage (3 minutes)

**Navigate to Billing**

**What to show:**

**Current Plan:**
- Free plan badge
- Upgrade CTA

**Usage This Month:**
- Emails generated: 1/25 (from preview)
- Progress bars
- Remaining credits

**Plan Comparison:**
- Free: $0, 25 emails/month
- Pro: $12/month, unlimited (fair use)

**Script:**
"Here's the billing page. As a free user, you can see you've used 1 of your 25 email credits this month. The progress bar shows your usage, and you'll see a warning when you're running low. Pro users get unlimited emails with a fair use policy of 10,000 per month - plenty for most use cases."

**Actions:**
- Click "Upgrade to Pro" to show upgrade flow (Clerk billing)

---

### 11. Schedule Campaign (2 minutes)

**Back to Campaign Detail**

**Actions:**
1. Click "Schedule Campaign"
2. Set start date/time
3. Confirm

**Script:**
"When you're ready to launch, you can schedule your campaign. Set a start time, confirm the daily send limit, and the system will automatically send emails and follow-ups according to your cadence settings."

---

### 12. Analytics & Tracking (2 minutes)

**What to show:**
- Real-time open tracking
- Click tracking
- Reply detection
- Lead status updates

**Script:**
"Once emails start sending, you'll see real-time analytics. The system tracks:
- When emails are sent
- When they're opened (via tracking pixel)
- When links are clicked
- When leads reply

All of this updates automatically, so you know exactly which leads are engaging and when to follow up."

---

### 13. Privacy & Compliance (1 minute)

**Navigate to Privacy Policy and Terms**

**What to show:**
- Comprehensive privacy policy
- Terms of Service
- CAN-SPAM compliance
- GDPR considerations

**Script:**
"We take privacy and compliance seriously. We have comprehensive Terms of Service and Privacy Policy. The platform is designed to be CAN-SPAM compliant, and we emphasize user consent and data ownership throughout."

---

## Key Talking Points

### Security
- ✅ AES-256-GCM encryption for OAuth tokens
- ✅ Clerk enterprise-grade authentication
- ✅ HTTPS everywhere
- ✅ No sensitive data in logs
- ✅ User-controlled data deletion

### AI Features
- ✅ GPT-4 or Claude for generation
- ✅ Parametric prompts with guardrails
- ✅ Multiple tone options
- ✅ Context-aware personalization
- ✅ No spam trigger words

### Email Sending
- ✅ Send from user's own Gmail (better deliverability)
- ✅ SendGrid fallback option
- ✅ Rate limiting to prevent abuse
- ✅ Daily send limits
- ✅ Respect for email provider quotas

### Tracking
- ✅ Open tracking via pixel
- ✅ Click tracking via URL wrapping
- ✅ Reply detection via Gmail API
- ✅ Real-time analytics
- ✅ Per-lead status tracking

### Pricing
- ✅ Free plan: 25 emails/month
- ✅ Pro plan: $12/month unlimited
- ✅ No hidden fees
- ✅ Cancel anytime
- ✅ Fair use policy

---

## Demo Tips

1. **Pace yourself**: Don't rush through features
2. **Show, don't tell**: Actually click through the app
3. **Emphasize privacy**: Highlight security features
4. **Real examples**: Use realistic company names and scenarios
5. **Handle questions**: Be prepared to explain AI, OAuth, tracking
6. **Test beforehand**: Make sure everything works
7. **Have backup**: Keep screenshots ready in case of issues
8. **Personalize**: Adapt script to audience needs

---

## Common Questions

**Q: How is this different from Mailchimp/SendGrid?**
A: We focus specifically on cold outreach with AI personalization. Each email is unique and generated based on the recipient's profile.

**Q: Is this SPAM?**
A: Not if used correctly. Users must obtain consent, provide unsubscribe options, and follow CAN-SPAM/GDPR. We enforce rate limits and best practices.

**Q: How accurate is the AI?**
A: The AI generates human-quality emails, but we always recommend reviewing before sending. Users maintain full control.

**Q: What about deliverability?**
A: Sending from user's own Gmail account (vs. shared IP) improves deliverability significantly. We also provide best practices guidance.

**Q: Can I customize the AI prompts?**
A: Pro users can customize tone and style. The underlying prompts are designed by our team to ensure quality and compliance.

---

## Post-Demo Follow-up

After the demo:
1. Share documentation links
2. Offer trial account
3. Provide deployment guide
4. Schedule technical deep-dive if interested
5. Answer integration questions

---

## Screenshots to Prepare

Capture these ahead of time in case of demo issues:
- [ ] Landing page
- [ ] Dashboard with campaigns
- [ ] Campaign detail with leads
- [ ] AI preview generation
- [ ] Billing page
- [ ] Settings page
- [ ] Analytics with data

---

Good luck with your demo! 🚀
