import { auth as clerkAuth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase";

export async function getCurrentUser() {
  const { userId } = clerkAuth();
  
  if (!userId) {
    return null;
  }

  // First try to get existing user
  let { data: user } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  // If user doesn't exist, create them
  if (!user) {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        first_name: clerkUser.firstName || null,
        last_name: clerkUser.lastName || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }

    user = newUser;
  }

  return user;
}

export function requireAuth() {
  const { userId } = clerkAuth();
  
  if (!userId) {
    throw new Error('Unauthorized');
  }
  
  return userId;
}
