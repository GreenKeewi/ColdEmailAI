import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { generateCampaignPreview } from "@/lib/ai";
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

    // Get user from database
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
          upgrade: quota.plan === 'free' ? true : false
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { leadId, tone } = body;

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

    // Get lead
    const { data: lead } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .eq('campaign_id', params.id)
      .single();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Generate preview
    const preview = await generateCampaignPreview(
      {
        firstName: lead.first_name,
        lastName: lead.last_name,
        company: lead.company,
        title: lead.title,
      },
      tone || campaign.tone
    );

    // Increment usage
    await incrementUsage(user.id, 'email_generated', campaign.id);

    return NextResponse.json(preview);
  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
