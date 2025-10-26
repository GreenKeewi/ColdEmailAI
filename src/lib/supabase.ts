import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client for browser
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Service client for server-side operations
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Database types
export type Database = {
  users: {
    id: string;
    clerk_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    plan: 'free' | 'pro';
    subscription_id: string | null;
    subscription_status: string | null;
    created_at: string;
    updated_at: string;
  };
  campaigns: {
    id: string;
    user_id: string;
    name: string;
    subject_template: string | null;
    body_template: string | null;
    tone: string;
    status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
    total_leads: number;
    sent_count: number;
    opened_count: number;
    clicked_count: number;
    replied_count: number;
    scheduled_at: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
  leads: {
    id: string;
    campaign_id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    title: string | null;
    custom_fields: any;
    status: 'pending' | 'scheduled' | 'sent' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed' | 'failed';
    created_at: string;
    updated_at: string;
  };
  messages: {
    id: string;
    lead_id: string;
    campaign_id: string;
    subject: string;
    body: string;
    message_type: 'initial' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3';
    status: 'pending' | 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed';
    provider: 'gmail' | 'sendgrid' | null;
    gmail_message_id: string | null;
    sendgrid_message_id: string | null;
    scheduled_at: string | null;
    sent_at: string | null;
    opened_at: string | null;
    clicked_at: string | null;
    replied_at: string | null;
    error_message: string | null;
    created_at: string;
    updated_at: string;
  };
  settings: {
    id: string;
    user_id: string;
    gmail_refresh_token: string | null;
    gmail_email: string | null;
    sendgrid_enabled: boolean;
    ai_provider: 'openai' | 'anthropic';
    default_tone: string;
    daily_send_limit: number;
    follow_up_cadence: number;
    created_at: string;
    updated_at: string;
  };
  events: {
    id: string;
    message_id: string;
    lead_id: string;
    campaign_id: string;
    event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'unsubscribed' | 'failed';
    metadata: any;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
  };
  usage_logs: {
    id: string;
    user_id: string;
    action_type: 'email_generated' | 'email_sent' | 'api_call';
    campaign_id: string | null;
    month: string;
    count: number;
    metadata: any;
    created_at: string;
  };
};
