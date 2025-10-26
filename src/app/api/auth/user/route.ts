import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user in our database
    let { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (!user) {
      // Create user if doesn't exist
      const { data: newUser } = await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: userId,
          email: '', // Will be updated from Clerk webhook
          plan: 'free',
        })
        .select()
        .single();
      
      user = newUser;
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
