import { supabaseAdmin } from './supabase';

export async function checkUsageQuota(userId: string): Promise<{
  allowed: boolean;
  usage: number;
  limit: number;
  plan: string;
}> {
  // Get user's plan
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('plan')
    .eq('id', userId)
    .single();

  const plan = user?.plan || 'free';
  const limit = plan === 'free' ? 25 : 10000; // Pro has fair use limit

  // Get current month usage
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  const { data: usage } = await supabaseAdmin
    .from('usage_logs')
    .select('count')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .eq('action_type', 'email_generated');

  const totalUsage = usage?.reduce((sum, log) => sum + log.count, 0) || 0;

  return {
    allowed: totalUsage < limit,
    usage: totalUsage,
    limit,
    plan,
  };
}

export async function incrementUsage(
  userId: string,
  actionType: 'email_generated' | 'email_sent' | 'api_call',
  campaignId?: string
): Promise<void> {
  const currentMonth = new Date().toISOString().slice(0, 7);

  await supabaseAdmin.from('usage_logs').insert({
    user_id: userId,
    action_type: actionType,
    campaign_id: campaignId,
    month: currentMonth,
    count: 1,
  });
}

export async function getUserUsage(userId: string): Promise<{
  emailsGenerated: number;
  emailsSent: number;
  limit: number;
  remaining: number;
  resetDate: string;
}> {
  const { usage, limit } = await checkUsageQuota(userId);
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Get next month's first day
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString();

  const { data: sentLogs } = await supabaseAdmin
    .from('usage_logs')
    .select('count')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .eq('action_type', 'email_sent');

  const emailsSent = sentLogs?.reduce((sum, log) => sum + log.count, 0) || 0;

  return {
    emailsGenerated: usage,
    emailsSent,
    limit,
    remaining: Math.max(0, limit - usage),
    resetDate,
  };
}
