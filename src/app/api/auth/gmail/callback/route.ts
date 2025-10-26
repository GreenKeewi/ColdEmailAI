import { NextRequest, NextResponse } from "next/server";
import { storeGmailTokens } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // userId

    if (!code || !state) {
      return NextResponse.redirect('/settings?error=oauth_failed');
    }

    // Store tokens
    await storeGmailTokens(state, code);

    // Redirect back to settings
    return NextResponse.redirect(
      new URL('/settings?success=gmail_connected', request.url)
    );
  } catch (error) {
    console.error('Error in Gmail OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/settings?error=oauth_failed', request.url)
    );
  }
}
