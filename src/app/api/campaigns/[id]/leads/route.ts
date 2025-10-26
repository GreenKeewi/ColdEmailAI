import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

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
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify campaign belongs to user
    const { data: campaign } = await supabaseAdmin
      .from('campaigns')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = await request.json();
    const { leads } = body;

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json({ error: "Leads array is required" }, { status: 400 });
    }

    // Insert leads
    const leadsData = leads.map((lead: any) => ({
      campaign_id: params.id,
      email: lead.email,
      first_name: lead.firstName || lead.first_name,
      last_name: lead.lastName || lead.last_name,
      company: lead.company,
      title: lead.title,
      custom_fields: lead.customFields || lead.custom_fields || {},
      status: 'pending',
    }));

    const { data: insertedLeads, error } = await supabaseAdmin
      .from('leads')
      .insert(leadsData)
      .select();

    if (error) throw error;

    // Update campaign total_leads count
    const { data: allLeads } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('campaign_id', params.id);

    await supabaseAdmin
      .from('campaigns')
      .update({ total_leads: allLeads?.length || 0 })
      .eq('id', params.id);

    return NextResponse.json({
      success: true,
      count: insertedLeads?.length || 0,
      leads: insertedLeads,
    });
  } catch (error) {
    console.error('Error adding leads:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
