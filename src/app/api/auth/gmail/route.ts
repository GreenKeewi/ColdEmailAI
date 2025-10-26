import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getGmailAuthUrl } from "@/lib/gmail";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.redirect('/sign-in');
    }

    // Get user from database
    if (!supabaseAdmin) {
      console.error('supabaseAdmin client is not configured');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate OAuth URL
    const authUrl = getGmailAuthUrl(user.id);

    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Gmail OAuth:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
