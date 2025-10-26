import { google } from 'googleapis';
import { supabaseAdmin } from './supabase';
import { encrypt, decrypt } from './encryption';

const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID!;
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET!;
const GMAIL_REDIRECT_URI = process.env.GMAIL_REDIRECT_URI!;

export function getGmailOAuthClient() {
  return new google.auth.OAuth2(
    GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET,
    GMAIL_REDIRECT_URI
  );
}

export function getGmailAuthUrl(userId: string): string {
  const oauth2Client = getGmailOAuthClient();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/gmail.readonly',
    ],
    state: userId, // Pass userId to link account after OAuth
  });
}

export async function storeGmailTokens(userId: string, code: string): Promise<void> {
  const oauth2Client = getGmailOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  
  if (!tokens.refresh_token) {
    throw new Error('No refresh token received');
  }
  
  // Get user's email
  oauth2Client.setCredentials(tokens);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const profile = await gmail.users.getProfile({ userId: 'me' });
  
  // Encrypt and store refresh token
  const encryptedToken = encrypt(tokens.refresh_token);
  
  await supabaseAdmin
    .from('settings')
    .upsert({
      user_id: userId,
      gmail_refresh_token: encryptedToken,
      gmail_email: profile.data.emailAddress,
    });
}

export async function getGmailClient(userId: string) {
  const { data: settings } = await supabaseAdmin
    .from('settings')
    .select('gmail_refresh_token')
    .eq('user_id', userId)
    .single();
  
  if (!settings?.gmail_refresh_token) {
    throw new Error('Gmail not connected');
  }
  
  const refreshToken = decrypt(settings.gmail_refresh_token);
  
  const oauth2Client = getGmailOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  
  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function sendGmailEmail(
  userId: string,
  to: string,
  subject: string,
  body: string
): Promise<string> {
  const gmail = await getGmailClient(userId);
  
  const message = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    body,
  ].join('\n');
  
  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
  
  return response.data.id || '';
}

export async function checkGmailReplies(userId: string, messageId: string): Promise<boolean> {
  const gmail = await getGmailClient(userId);
  
  try {
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });
    
    // Check if message has replies (thread has more than 1 message)
    const threadId = message.data.threadId;
    if (threadId) {
      const thread = await gmail.users.threads.get({
        userId: 'me',
        id: threadId,
      });
      
      return (thread.data.messages?.length || 0) > 1;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Gmail replies:', error);
    return false;
  }
}
