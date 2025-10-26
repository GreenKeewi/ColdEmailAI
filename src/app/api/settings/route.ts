import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get settings
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      gmailConnected: !!settings?.gmail_email,
      gmailEmail: settings?.gmail_email,
      sendgridEnabled: settings?.sendgrid_enabled || false,
      aiProvider: settings?.ai_provider || 'openai',
      defaultTone: settings?.default_tone || 'professional',
      dailySendLimit: settings?.daily_send_limit || 50,
      followUpCadence: settings?.follow_up_cadence || 3,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { defaultTone, dailySendLimit, followUpCadence } = body;

    // Update settings
    await supabaseAdmin
      .from('settings')
      .upsert({
        user_id: user.id,
        default_tone: defaultTone,
        daily_send_limit: dailySendLimit,
        follow_up_cadence: followUpCadence,
      });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
