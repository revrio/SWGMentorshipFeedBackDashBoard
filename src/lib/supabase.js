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

export async function sendLoginOtp(email) {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error(
        "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      ),
    };
  }

  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/mentorship/dashboard`,
    },
  });
}

export async function verifyLoginOtp(email, token) {
  if (!isSupabaseConfigured) {
    return {
      data: null,
      error: new Error(
        "Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      ),
    };
  }

  return supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });
}

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
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  return supabase.auth.signOut();
}
