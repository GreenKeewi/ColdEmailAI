import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateCampaignPreview } from "@/lib/ai";
import { sendGmailEmail } from "@/lib/gmail";
import { sendSendGridEmail } from "@/lib/sendgrid";
import { checkUsageQuota, incrementUsage } from "@/lib/usage";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, plan')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check usage quota
    const quota = await checkUsageQuota(user.id);
    if (!quota.allowed) {
      return NextResponse.json(
        { 
          error: "Quota exceeded",
          message: `You've reached your ${quota.plan} plan limit of ${quota.limit} emails/month`,
          upgrade: quota.plan === 'free'
        },
        { status: 403 }
      );
    }

    // Get campaign
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get pending leads
    const { data: leads } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('campaign_id', params.id)
      .eq('status', 'pending')
      .limit(10); // Send max 10 at a time for now

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: "No pending leads to send to" }, { status: 400 });
    }

    // Get user settings for email provider
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const useGmail = !!settings?.gmail_email;
    let sentCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    // Send emails to each lead
    for (const lead of leads) {
      try {
        // Check quota before each send
        const currentQuota = await checkUsageQuota(user.id);
        if (!currentQuota.allowed) {
          errors.push(`Quota limit reached after ${sentCount} emails`);
          break;
        }

        // Generate personalized email
        const preview = await generateCampaignPreview(
          {
            firstName: lead.first_name,
            lastName: lead.last_name,
            company: lead.company,
            title: lead.title,
          },
          campaign.tone
        );

        const subject = preview.subjects[0];
        const body = preview.body;

        let messageId: string | null = null;
        let provider: 'gmail' | 'sendgrid' = 'sendgrid';

        // Send email
        if (useGmail) {
          try {
            messageId = await sendGmailEmail(user.id, lead.email, subject, body);
            provider = 'gmail';
          } catch (gmailError) {
            console.error('Gmail send failed, falling back to SendGrid:', gmailError);
            // Fallback to SendGrid
            messageId = await sendSendGridEmail({
              to: lead.email,
              subject,
              body,
              leadId: lead.id,
            });
          }
        } else {
          messageId = await sendSendGridEmail({
            to: lead.email,
            subject,
            body,
            leadId: lead.id,
          });
        }

        // Create message record
        await supabaseAdmin
          .from('messages')
          .insert({
            lead_id: lead.id,
            campaign_id: params.id,
            subject,
            body,
            message_type: 'initial',
            status: 'sent',
            provider,
            gmail_message_id: provider === 'gmail' ? messageId : null,
            sendgrid_message_id: provider === 'sendgrid' ? messageId : null,
            sent_at: new Date().toISOString(),
          });

        // Update lead status
        await supabaseAdmin
          .from('leads')
          .update({ status: 'sent' })
          .eq('id', lead.id);

        // Increment usage
        await incrementUsage(user.id, 'email_sent', campaign.id);
        await incrementUsage(user.id, 'email_generated', campaign.id);

        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${lead.email}:`, error);
        failedCount++;
        errors.push(`${lead.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);

        // Update lead status to failed
        await supabaseAdmin
          .from('leads')
          .update({ status: 'failed' })
          .eq('id', lead.id);
      }
    }

    // Update campaign stats
    const { data: allLeads } = await supabaseAdmin
      .from('leads')
      .select('status')
      .eq('campaign_id', params.id);

    const sentLeads = allLeads?.filter(l => l.status === 'sent').length || 0;

    await supabaseAdmin
      .from('campaigns')
      .update({
        sent_count: sentLeads,
        status: sentLeads > 0 ? 'active' : campaign.status,
        started_at: campaign.started_at || new Date().toISOString(),
      })
      .eq('id', params.id);

    return NextResponse.json({
      success: true,
      sent: sentCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error sending campaign:', error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
