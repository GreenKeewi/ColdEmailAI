import sgMail from '@sendgrid/mail';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@coldemail.ai';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'ColdEmail.AI';

sgMail.setApiKey(SENDGRID_API_KEY);

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
  customArgs?: Record<string, string>;
}

export async function sendSendGridEmail(params: SendEmailParams): Promise<string> {
  const msg = {
    to: params.to,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME,
    },
    subject: params.subject,
    html: params.html,
    text: params.text || params.html.replace(/<[^>]*>/g, ''),
    trackingSettings: {
      clickTracking: { enable: true },
      openTracking: { enable: true },
    },
    customArgs: params.customArgs,
  };

  const response = await sgMail.send(msg);
  
  // Extract message ID from response headers
  const messageId = response[0].headers['x-message-id'] || '';
  
  return messageId;
}

export interface SendGridEvent {
  email: string;
  event: string;
  timestamp: number;
  'smtp-id': string;
  sg_message_id: string;
  sg_event_id: string;
  [key: string]: any;
}

export function parseSendGridEvent(event: SendGridEvent): {
  messageId: string;
  eventType: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'spam_report';
  timestamp: Date;
  metadata: any;
} {
  const eventTypeMap: Record<string, any> = {
    delivered: 'delivered',
    open: 'opened',
    click: 'clicked',
    bounce: 'bounced',
    dropped: 'bounced',
    spamreport: 'spam_report',
  };

  return {
    messageId: event.sg_message_id,
    eventType: eventTypeMap[event.event] || 'delivered',
    timestamp: new Date(event.timestamp * 1000),
    metadata: {
      email: event.email,
      ip: event.ip,
      userAgent: event.useragent,
      url: event.url,
    },
  };
}

export function generateTrackingPixel(messageId: string, appUrl: string): string {
  return `<img src="${appUrl}/api/track/open/${messageId}" width="1" height="1" style="display:none" />`;
}

export function wrapLinksForTracking(html: string, messageId: string, appUrl: string): string {
  // Simple link wrapping - in production, use a proper HTML parser
  return html.replace(
    /href="([^"]+)"/g,
    `href="${appUrl}/api/track/click/${messageId}?url=$1"`
  );
}
