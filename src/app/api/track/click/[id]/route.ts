import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Track click event
    const { data: message } = await supabaseAdmin
      .from('messages')
      .select('id, lead_id, campaign_id, status')
      .eq('id', params.id)
      .single();

    if (message && message.status !== 'clicked' && message.status !== 'replied') {
      // Update message
      await supabaseAdmin
        .from('messages')
        .update({
          status: 'clicked',
          clicked_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      // Create event
      await supabaseAdmin.from('events').insert({
        message_id: message.id,
        lead_id: message.lead_id,
        campaign_id: message.campaign_id,
        event_type: 'clicked',
        metadata: { url },
      });

      // Update lead status (only if not already replied)
      const { data: lead } = await supabaseAdmin
        .from('leads')
        .select('status')
        .eq('id', message.lead_id)
        .single();

      if (lead && lead.status !== 'replied') {
        await supabaseAdmin
          .from('leads')
          .update({ status: 'clicked' })
          .eq('id', message.lead_id);
      }

      // Update campaign clicked_count
      const { data: campaign } = await supabaseAdmin
        .from('campaigns')
        .select('clicked_count')
        .eq('id', message.campaign_id)
        .single();

      if (campaign) {
        await supabaseAdmin
          .from('campaigns')
          .update({ clicked_count: (campaign.clicked_count || 0) + 1 })
          .eq('id', message.campaign_id);
      }
    }

    // Redirect to the original URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error tracking click:', error);
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');
    if (url) {
      return NextResponse.redirect(url);
    }
    return NextResponse.redirect(new URL('/', request.url));
  }
}
