import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { parseSendGridEvent } from "@/lib/sendgrid";

export async function POST(request: NextRequest) {
  try {
    const events = await request.json();
    
    // SendGrid sends events as an array
    const eventArray = Array.isArray(events) ? events : [events];

    for (const event of eventArray) {
      const parsed = parseSendGridEvent(event);
      
      // Find message by SendGrid message ID
      const { data: message } = await supabaseAdmin
        .from('messages')
        .select('id, lead_id, campaign_id')
        .eq('sendgrid_message_id', parsed.messageId)
        .single();

      if (!message) {
        console.log('Message not found for ID:', parsed.messageId);
        continue;
      }

      // Create event record
      await supabaseAdmin.from('events').insert({
        message_id: message.id,
        lead_id: message.lead_id,
        campaign_id: message.campaign_id,
        event_type: parsed.eventType,
        metadata: parsed.metadata,
        ip_address: parsed.metadata.ip,
        user_agent: parsed.metadata.userAgent,
      });

      // Update message status
      const updateData: any = {};
      
      if (parsed.eventType === 'delivered') {
        updateData.status = 'delivered';
      } else if (parsed.eventType === 'opened') {
        updateData.status = 'opened';
        updateData.opened_at = parsed.timestamp.toISOString();
      } else if (parsed.eventType === 'clicked') {
        updateData.status = 'clicked';
        updateData.clicked_at = parsed.timestamp.toISOString();
      } else if (parsed.eventType === 'bounced') {
        updateData.status = 'bounced';
      }

      if (Object.keys(updateData).length > 0) {
        await supabaseAdmin
          .from('messages')
          .update(updateData)
          .eq('id', message.id);
      }

      // Update lead status
      if (parsed.eventType === 'opened') {
        await supabaseAdmin
          .from('leads')
          .update({ status: 'opened' })
          .eq('id', message.lead_id);
          
        // Increment campaign opened count
        await supabaseAdmin.rpc('increment_campaign_opened', {
          campaign_id: message.campaign_id
        });
      } else if (parsed.eventType === 'clicked') {
        await supabaseAdmin
          .from('leads')
          .update({ status: 'clicked' })
          .eq('id', message.lead_id);
          
        // Increment campaign clicked count
        await supabaseAdmin.rpc('increment_campaign_clicked', {
          campaign_id: message.campaign_id
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing SendGrid webhook:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
