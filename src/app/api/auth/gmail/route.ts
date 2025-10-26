import { NextResponse } from "next/server";
import { getGmailAuthUrl } from "@/lib/gmail";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.redirect('/sign-in');
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
