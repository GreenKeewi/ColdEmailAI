import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabaseAdmin
      .from('campaigns')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: campaigns, count } = await query;

    return NextResponse.json({
      campaigns: campaigns || [],
      total: count || 0,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, tone, leads } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Create campaign
    const { data: campaign, error } = await supabaseAdmin
      .from('campaigns')
      .insert({
        user_id: user.id,
        name,
        tone: tone || 'professional',
        status: 'draft',
        total_leads: leads?.length || 0,
      })
      .select()
      .single();

    if (error) throw error;

    // If leads provided, insert them
    if (leads && leads.length > 0) {
      const leadsData = leads.map((lead: any) => ({
        campaign_id: campaign.id,
        email: lead.email,
        first_name: lead.firstName,
        last_name: lead.lastName,
        company: lead.company,
        title: lead.title,
        custom_fields: lead.customFields || {},
        status: 'pending',
      }));

      await supabaseAdmin.from('leads').insert(leadsData);
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
