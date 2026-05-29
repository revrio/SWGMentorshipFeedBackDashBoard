import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseAnonKey || "missing-anon-key",
  {
  auth: {
    autoRefreshToken: true,
    detectSessionInUrl: true,
    persistSession: true,
  },
  },
);


export async function getCurrentSession() {
  if (!isSupabaseConfigured) {
    return {
      session: null,
      error: new Error(
        "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      ),
    };
  }

  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

export async function getCurrentAppUser() {
  if (!isSupabaseConfigured) {
    return {
      user: null,
      profile: null,
      error: new Error(
        "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      ),
    };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      user: null,
      profile: null,
      error: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, email, role")
    .eq("email", user.email)
    .in("role", ["mentee", "admin"])
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      user: null,
      profile: null,
      error: new Error("Unauthorized: This email is not registered as an active mentee."),
    };
  }

  return { user, profile, error: null };
}


export async function signOut() {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  return supabase.auth.signOut();
}
