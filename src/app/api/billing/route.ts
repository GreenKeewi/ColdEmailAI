import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('plan, subscription_status, subscription_id')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate next billing date (assuming monthly billing)
    const nextBillingDate = new Date();
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    nextBillingDate.setDate(1);

    return NextResponse.json({
      plan: user.plan,
      status: user.subscription_status || 'active',
      nextBillingDate: user.plan === 'pro' ? nextBillingDate.toISOString() : null,
      cancelAtPeriodEnd: false,
    });
  } catch (error) {
    console.error('Error fetching billing info:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // 'upgrade' or 'cancel'

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, plan')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === 'upgrade' && user.plan === 'free') {
      // In production, this would integrate with Clerk billing or Stripe
      // For now, just update the plan
      await supabaseAdmin
        .from('users')
        .update({
          plan: 'pro',
          subscription_status: 'active',
        })
        .eq('id', user.id);

      return NextResponse.json({ 
        success: true,
        message: 'Upgraded to Pro plan successfully!',
        checkoutUrl: '/billing' // In production, return Stripe checkout URL
      });
    }

    if (action === 'cancel' && user.plan === 'pro') {
      // In production, this would cancel the Stripe subscription
      await supabaseAdmin
        .from('users')
        .update({
          plan: 'free',
          subscription_status: 'cancelled',
        })
        .eq('id', user.id);

      return NextResponse.json({ 
        success: true,
        message: 'Subscription cancelled successfully'
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error('Error updating billing:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
