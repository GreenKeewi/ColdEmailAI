import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

// Initialize clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Prompt templates
export const prompts = {
  subjectLine: (lead: any, tone: string) => `
Generate a professional, engaging subject line for a cold email.

Context:
- Recipient: ${lead.firstName} ${lead.lastName}
- Company: ${lead.company}
- Title: ${lead.title}
- Tone: ${tone}

Requirements:
- Maximum 60 characters
- Personalized to the recipient
- No spam trigger words (FREE, ACT NOW, etc.)
- Professional and respectful
- Action-oriented but not pushy

Generate 3 subject line options as a JSON array.
`,

  emailBody: (lead: any, tone: string) => `
Write a professional cold email to introduce a product/service.

Recipient Details:
- Name: ${lead.firstName} ${lead.lastName}
- Company: ${lead.company}
- Title: ${lead.title}

Email Requirements:
- Tone: ${tone}
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
`,

  followUp1: (lead: any, tone: string, originalSubject: string) => `
Write a brief follow-up email for a cold outreach campaign.

Context:
- This is the first follow-up (sent 3 days after initial email)
- Recipient: ${lead.firstName} ${lead.lastName}
- Company: ${lead.company}
- Original subject: ${originalSubject}
- Tone: ${tone}

Email Requirements:
- Length: 80-120 words
- Acknowledge they might be busy
- Add one new piece of value
- Softer call-to-action
- No pushy language

Constraints:
- Keep it short and respectful
- Different angle from first email
- Professional and patient tone
`,

  followUp2: (lead: any, tone: string) => `
Write a second follow-up email for a cold outreach campaign.

Context:
- This is follow-up #2 (sent 6 days after initial email)
- Recipient: ${lead.firstName} ${lead.lastName}
- Company: ${lead.company}
- Tone: ${tone}

Email Requirements:
- Length: 60-100 words
- Very brief and humble
- Provide a resource or insight
- Give them an easy "out" option
- Show respect for their time

Constraints:
- Ultra-brief
- No pressure
- Helpful, not salesy
`,

  followUp3: (lead: any, tone: string) => `
Write a final follow-up email for a cold outreach campaign.

Context:
- This is the final follow-up (sent 9 days after initial email)
- Recipient: ${lead.firstName} ${lead.lastName}
- Company: ${lead.company}
- Tone: ${tone}

Email Requirements:
- Length: 40-80 words
- Polite close to the sequence
- Thank them for their time
- Leave door open for future
- No hard ask

Constraints:
- Graceful exit
- Professional and respectful
- No guilt or pressure
`,
};

// AI generation functions
export async function generateSubjectLines(
  lead: any,
  tone: string = 'professional'
): Promise<string[]> {
  const prompt = prompts.subjectLine(lead, tone);

  if (AI_PROVIDER === 'anthropic') {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch {
        return content.text.split('\n').filter(Boolean).slice(0, 3);
      }
    }
    return [];
  } else {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content || '';
    try {
      return JSON.parse(content);
    } catch {
      return content.split('\n').filter(Boolean).slice(0, 3);
    }
  }
}

export async function generateEmailBody(
  lead: any,
  tone: string = 'professional'
): Promise<string> {
  const prompt = prompts.emailBody(lead, tone);

  if (AI_PROVIDER === 'anthropic') {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 400,
      temperature: 0.8,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  } else {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 400,
    });

    return response.choices[0].message.content || '';
  }
}

export async function generateFollowUp(
  lead: any,
  sequence: number,
  tone: string = 'professional',
  originalSubject: string = ''
): Promise<string> {
  let prompt: string;

  switch (sequence) {
    case 1:
      prompt = prompts.followUp1(lead, tone, originalSubject);
      break;
    case 2:
      prompt = prompts.followUp2(lead, tone);
      break;
    case 3:
      prompt = prompts.followUp3(lead, tone);
      break;
    default:
      throw new Error('Invalid follow-up sequence');
  }

  const maxTokens = sequence === 1 ? 250 : sequence === 2 ? 200 : 150;

  if (AI_PROVIDER === 'anthropic') {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: maxTokens,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    return content.type === 'text' ? content.text : '';
  } else {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || '';
  }
}

export async function generateCampaignPreview(lead: any, tone: string = 'professional') {
  const [subjects, body] = await Promise.all([
    generateSubjectLines(lead, tone),
    generateEmailBody(lead, tone),
  ]);

  const followUps = await Promise.all([
    generateFollowUp(lead, 1, tone, subjects[0]),
    generateFollowUp(lead, 2, tone),
    generateFollowUp(lead, 3, tone),
  ]);

  return {
    subjects,
    body,
    followUps: followUps.map((body, index) => ({
      sequence: index + 1,
      body,
    })),
  };
}
