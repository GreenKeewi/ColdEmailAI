# AI Prompt Templates for ColdEmail.AI

This document contains the prompt templates used for generating email content.

## Subject Line Generation

**Purpose:** Generate compelling, personalized subject lines for cold emails.

**Template:**
```
Generate a professional, engaging subject line for a cold email.

Context:
- Recipient: {firstName} {lastName}
- Company: {company}
- Title: {title}
- Tone: {tone}
- Industry: {industry}

Requirements:
- Maximum 60 characters
- Personalized to the recipient
- No spam trigger words (FREE, ACT NOW, etc.)
- Professional and respectful
- Action-oriented but not pushy

Generate 3 subject line options.
```

**Temperature:** 0.7
**Max Tokens:** 100

---

## Email Body - Initial Message

**Purpose:** Generate the first cold email in a campaign.

**Template:**
```
Write a professional cold email to introduce a product/service.

Recipient Details:
- Name: {firstName} {lastName}
- Company: {company}
- Title: {title}

Email Requirements:
- Tone: {tone} (professional, casual, friendly, formal)
- Length: 150-200 words maximum
- Structure:
  1. Personalized greeting
  2. Brief introduction (1 sentence about sender)
  3. Value proposition (2-3 sentences)
  4. Social proof or credibility marker (optional, 1 sentence)
  5. Clear call-to-action
  6. Professional sign-off

Constraints:
- No hard sales language
- Focus on value, not features
- Respect the recipient's time
- Include one clear, specific call-to-action
- Do NOT ask for sensitive information
- Do NOT make unrealistic promises

Generate the email body only (no subject line).
```

**Temperature:** 0.8
**Max Tokens:** 400

---

## Follow-Up 1 (After 3 Days)

**Purpose:** First follow-up if no response to initial email.

**Template:**
```
Write a brief follow-up email for a cold outreach campaign.

Context:
- This is the first follow-up (sent 3 days after initial email)
- Recipient: {firstName} {lastName}
- Company: {company}
- Original subject: {originalSubject}
- Tone: {tone}

Email Requirements:
- Length: 80-120 words
- Acknowledge they might be busy
- Add one new piece of value (insight, resource, or benefit)
- Softer call-to-action
- No pushy language

Structure:
1. Brief acknowledgment
2. One new value point
3. Simple question or CTA

Constraints:
- Keep it short and respectful
- Different angle from first email
- Professional and patient tone
```

**Temperature:** 0.7
**Max Tokens:** 250

---

## Follow-Up 2 (After 3 More Days)

**Purpose:** Second follow-up if still no response.

**Template:**
```
Write a second follow-up email for a cold outreach campaign.

Context:
- This is follow-up #2 (sent 6 days after initial email)
- Recipient: {firstName} {lastName}
- Company: {company}
- Tone: {tone}

Email Requirements:
- Length: 60-100 words
- Very brief and humble
- Provide a resource or insight without asking for anything
- Give them an easy "out" option
- Show respect for their time

Structure:
1. Quick check-in
2. Offer value (resource, article, tool)
3. Easy opt-out or simple yes/no question

Constraints:
- Ultra-brief
- No pressure
- Helpful, not salesy
```

**Temperature:** 0.7
**Max Tokens:** 200

---

## Follow-Up 3 (Final - After 3 More Days)

**Purpose:** Final follow-up before closing the sequence.

**Template:**
```
Write a final follow-up email for a cold outreach campaign.

Context:
- This is the final follow-up (sent 9 days after initial email)
- Recipient: {firstName} {lastName}
- Company: {company}
- Tone: {tone}

Email Requirements:
- Length: 40-80 words
- Polite close to the sequence
- Thank them for their time
- Leave door open for future
- No hard ask

Structure:
1. Acknowledge no response
2. Thank them
3. Brief value reminder
4. Keep door open

Constraints:
- Graceful exit
- Professional and respectful
- No guilt or pressure
- Positive and future-focused
```

**Temperature:** 0.6
**Max Tokens:** 150

---

## Tone Definitions

**Professional:** Formal business language, respectful, focused on business value.

**Casual:** Conversational but still respectful, use of contractions, friendly tone.

**Friendly:** Warm and approachable, builds rapport, personal touches.

**Formal:** Traditional business communication, proper titles, structured format.

---

## Guardrails

All AI-generated content must adhere to these rules:

1. **No Sensitive Data Requests:** Never ask for passwords, SSN, credit cards, etc.
2. **No Spam Triggers:** Avoid ALL CAPS, excessive punctuation, spam words.
3. **Length Limits:** Enforce maximum character counts.
4. **Professional Tone:** Even casual emails must remain respectful.
5. **No Unrealistic Promises:** No "guaranteed results" or exaggerated claims.
6. **Privacy Respect:** No tracking or data collection mentions.
7. **CAN-SPAM Compliance:** Always professional, truthful, and respectful.

---

## Usage in API

```typescript
// Example usage
const prompt = promptTemplates.emailBody
  .replace('{firstName}', lead.firstName)
  .replace('{lastName}', lead.lastName)
  .replace('{company}', lead.company)
  .replace('{title}', lead.title)
  .replace('{tone}', campaign.tone);

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.8,
  max_tokens: 400,
});
```

## Using GitHub Models (development)

You can route AI calls to a GitHub-hosted models endpoint for development or internal testing.

1. Set the provider in your `.env.local`:

```env
AI_PROVIDER=github
GITHUB_MODELS_KEY=ghm_XXXXXXXXXXXXXXXXXXXX
GITHUB_MODELS_API_URL=https://api.github.com/copilot/experimental/generate
GITHUB_MODEL_NAME=default
```

2. The app will send prompts as a JSON POST to `GITHUB_MODELS_API_URL` with an Authorization header `Bearer <GITHUB_MODELS_KEY>`.

3. Response shapes vary by provider. The code attempts to extract a textual output from common response fields (e.g. `output_text`, `choices[0].text`, `output[0].content[0].text`). If your GitHub models endpoint uses a different schema, update `src/lib/ai.ts`'s `githubGenerate` helper to match the exact shape.

Notes:
- This is intended for development and preview stages. Production deployments should use a supported provider (OpenAI or Anthropic) or a vetted internal model gateway.
- Make sure the GitHub models key is stored in environment variables and never committed to source control.
