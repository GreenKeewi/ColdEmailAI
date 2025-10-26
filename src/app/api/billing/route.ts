import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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
