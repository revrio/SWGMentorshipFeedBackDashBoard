import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
});

export async function sendLoginOtp(email) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/mentorship/dashboard`,
    },
  });
}

export async function verifyLoginOtp(email, token) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getCurrentAppUser() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      error: authError ?? new Error("No active Supabase session."),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("id", user.id)
    .in("role", ["mentee", "admin"])
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      user: null,
      profile: null,
      error: profileError ?? new Error("User is not allowed in mentorship."),
    };
  }

  return { user, profile, error: null };
}

export async function signOut() {
  return supabase.auth.signOut();
}
