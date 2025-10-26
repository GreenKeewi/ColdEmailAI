import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendGmailEmail } from "@/lib/gmail";
import { sendSendGridEmail } from "@/lib/sendgrid";

export async function POST(
  request: NextRequest,
  _context: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { subject, emailBody, testEmail } = body;

    const recipient = testEmail || user.email;

    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: "Subject and email body are required" },
        { status: 400 }
      );
    }

    // Get user settings for email provider
    const { data: settings } = await supabaseAdmin
      .from('settings')
      .select('gmail_email')
      .eq('user_id', user.id)
      .single();

    const useGmail = !!settings?.gmail_email;
    let messageId: string | null = null;

    try {
      if (useGmail) {
        try {
          messageId = await sendGmailEmail(user.id, recipient, subject, emailBody);
        } catch (gmailError) {
          console.error('Gmail send failed, falling back to SendGrid:', gmailError);
          // Fallback to SendGrid
          messageId = await sendSendGridEmail({
            to: recipient,
            subject,
            body: emailBody,
          });
        }
      } else {
        messageId = await sendSendGridEmail({
          to: recipient,
          subject,
          body: emailBody,
        });
      }

      return NextResponse.json({
        success: true,
        messageId,
        message: `Test email sent to ${recipient}`,
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      return NextResponse.json(
        { error: "Failed to send test email", details: String(error) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in test email route:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
