import { auth as clerkAuth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase";

export async function getCurrentUser() {
  const { userId } = clerkAuth();
  
  if (!userId) {
    return null;
  }

  const { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  return user;
}

export function requireAuth() {
  const { userId } = clerkAuth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return userId;
}
