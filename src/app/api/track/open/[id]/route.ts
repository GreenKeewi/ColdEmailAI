import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Track open event
    const { data: message } = await supabaseAdmin
      .from('messages')
      .select('id, lead_id, campaign_id')
      .eq('id', params.id)
      .single();

    if (message) {
      // Update message
      await supabaseAdmin
        .from('messages')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString(),
        })
        .eq('id', message.id);

      // Create event
      await supabaseAdmin.from('events').insert({
        message_id: message.id,
        lead_id: message.lead_id,
        campaign_id: message.campaign_id,
        event_type: 'opened',
      });

      // Update lead status
      await supabaseAdmin
        .from('leads')
        .update({ status: 'opened' })
        .eq('id', message.lead_id);
    }

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error tracking open:', error);
    return new NextResponse('', { status: 200 });
  }
}
