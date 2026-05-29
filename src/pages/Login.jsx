import React, { useEffect, useState } from "react";
import { ArrowRight, Award, LayoutDashboard, Mail, ShieldCheck } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import StatusBanner from "../components/StatusBanner";
import {
  ensureMenteePortalUser,
  getCurrentAppUser,
  isSupabaseConfigured,
  sendLoginOtp,
  sendSignupOtp,
  supabase,
  verifyLoginOtp,
} from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [mode, setMode] = useState("signin");
  const [step, setStep] = useState("email");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function finishPendingSignup() {
      const pendingEmail = window.localStorage.getItem("swg_pending_signup_email");

      if (!pendingEmail || !isSupabaseConfigured) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setMode("signup");
      setEmail(pendingEmail);
      setIsLoading(true);

      const { profile, error } = await ensureMenteePortalUser(pendingEmail);

      setIsLoading(false);

      if (error || !profile) {
        setStatus({
          tone: "red",
          message:
            "Your Supabase account was created, but the portal user row could not be created. Check the insert RLS policy on public.users.",
        });
        return;
      }

      window.localStorage.removeItem("swg_pending_signup_email");
      setIsAuthenticated(true);
      navigate("/mentorship/dashboard", { replace: true });
    }

    finishPendingSignup();
  }, [navigate]);

  async function handleSendOtp(event) {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const normalizedEmail = email.trim().toLowerCase();
    let error = null;

    if (mode === "signin") {
      const { data: allowedUser, error: roleError } = await supabase
        .from("users")
        .select("id, role")
        .eq("email", normalizedEmail)
        .in("role", ["mentee", "admin"])
        .maybeSingle();

      if (roleError || !allowedUser) {
        setIsLoading(false);
        setStatus({
          tone: "red",
          message:
            "This email is not enabled for the SWG mentorship portal. Use Create account for testing or ask an admin to add you.",
        });
        return;
      }

      ({ error } = await sendLoginOtp(normalizedEmail));
    } else {
      ({ error } = await sendSignupOtp(normalizedEmail));
      window.localStorage.setItem("swg_pending_signup_email", normalizedEmail);
    }

    setIsLoading(false);

    if (error) {
      setStatus({ tone: "red", message: error.message });
      return;
    }

    setEmail(normalizedEmail);
    setStep("token");
    setStatus({
      tone: "green",
      message:
        mode === "signin"
          ? "A one-time password has been sent to your email."
          : "Check your email for a sign-in link or code to finish account creation.",
    });
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const { error } = await verifyLoginOtp(email, token.trim());

    if (error) {
      setIsLoading(false);
      setStatus({ tone: "red", message: error.message });
      return;
    }

    const { profile, error: profileError } =
      mode === "signup"
        ? await ensureMenteePortalUser(email)
        : await getCurrentAppUser();
    setIsLoading(false);

    if (profileError || !profile) {
      setStatus({
        tone: "red",
        message:
          mode === "signup"
            ? "Your Supabase account was created, but the portal user row could not be created. Check the insert RLS policy on public.users."
            : "Your account is authenticated but not authorized here.",
      });
      return;
    }

    setIsAuthenticated(true);
    window.localStorage.removeItem("swg_pending_signup_email");
    navigate(location.state?.from ?? "/mentorship/dashboard", { replace: true });
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setStep("email");
    setToken("");
    setStatus(null);
  }

  if (isAuthenticated) {
    return <Navigate replace to="/mentorship/dashboard" />;
  }

  return (
    <main className="min-h-screen bg-swg-mist text-swg-ink">
      <section className="grid min-h-screen w-full bg-swg-mist lg:grid-cols-[270px_1fr]">
        <aside className="hidden border-r border-swg-line bg-white/95 p-7 lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-swg-aqua text-lg font-black text-swg-blue">
              S
            </div>
            <div className="text-3xl font-black tracking-normal text-swg-navy">
              SWG
            </div>
          </div>
          <nav className="mt-10 space-y-3 text-sm font-semibold text-slate-500">
            <div className="flex min-h-12 items-center gap-3 rounded-xl bg-swg-aqua px-4 text-swg-blue">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </div>
            <Link
              className="swg-focus flex min-h-12 items-center gap-3 rounded-xl px-4 hover:bg-slate-50 hover:text-swg-navy"
              to="/mentorship/leaderboard"
            >
              <Award className="h-4 w-4" />
              Leaderboard
            </Link>
          </nav>
          <div className="mt-auto text-sm text-slate-500">
            <div className="mb-3 flex items-center gap-2 font-semibold text-swg-blue">
              <Mail className="h-4 w-4" />
              SWG IIT KGP
            </div>
            <p>swg@iitkgp.ac.in</p>
          </div>
        </aside>

        <div className="grid w-full items-center gap-8 px-5 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-10 xl:px-12">
          <div>
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-swg-aqua text-lg font-black text-swg-blue">
                S
              </div>
              <div className="text-3xl font-black tracking-normal text-swg-navy">
                SWG
              </div>
            </div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-swg-teal">
              Students' Welfare Group, IIT Kharagpur
            </p>
            <h1 className="text-4xl font-bold tracking-normal text-swg-navy md:text-5xl">
              Mentorship Dashboard
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              Submit cycle feedback and review frozen mentor rankings through a
              focused portal built for the SWG mentorship workflow.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
              <div className="rounded-2xl border border-swg-line bg-white p-4 shadow-soft">
                <ShieldCheck className="mb-3 h-5 w-5 text-swg-teal" />
                OTP access for mentees and admins only.
              </div>
              <div className="rounded-2xl border border-swg-line bg-white p-4 shadow-soft">
                <Mail className="mb-3 h-5 w-5 text-swg-teal" />
                Feedback windows follow active database cycles.
              </div>
            </div>
          </div>

        <div className="rounded-2xl border border-swg-line bg-white p-6 shadow-corporate">
          <div className="mb-5 grid grid-cols-2 rounded-xl border border-swg-line bg-slate-50 p-1">
            <button
              className={`swg-focus min-h-10 rounded-lg text-sm font-bold ${
                mode === "signin"
                  ? "bg-white text-swg-blue shadow-sm"
                  : "text-slate-500"
              }`}
              onClick={() => switchMode("signin")}
              type="button"
            >
              Sign in
            </button>
            <button
              className={`swg-focus min-h-10 rounded-lg text-sm font-bold ${
                mode === "signup"
                  ? "bg-white text-swg-blue shadow-sm"
                  : "text-slate-500"
              }`}
              onClick={() => switchMode("signup")}
              type="button"
            >
              Sign up
            </button>
          </div>

          <h2 className="text-xl font-bold text-swg-navy">
            {step === "email"
              ? mode === "signin"
                ? "Sign in with email"
                : "Create testing account"
              : "Check your email"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {step === "email"
              ? mode === "signin"
                ? "Use the email registered in the mentorship users table."
                : "Use an email you can access. This creates a mentee portal user for local testing."
              : `We sent login instructions to ${email}.`}
          </p>

          {!isSupabaseConfigured ? (
            <div className="mt-5">
              <StatusBanner tone="amber">
                Supabase is not configured yet. Create a <strong>.env</strong>{" "}
                file from <strong>.env.example</strong>, then set{" "}
                <strong>VITE_SUPABASE_URL</strong> and{" "}
                <strong>VITE_SUPABASE_ANON_KEY</strong>.
              </StatusBanner>
            </div>
          ) : null}

          {status ? (
            <div className="mt-5">
              <StatusBanner tone={status.tone}>{status.message}</StatusBanner>
            </div>
          ) : null}

          <form
            className="mt-6 space-y-4"
            onSubmit={step === "email" ? handleSendOtp : handleVerifyOtp}
          >
            <label className="block">
              <span className="text-sm font-semibold text-swg-navy">Email</span>
              <input
                className="swg-focus mt-2 min-h-11 w-full rounded-lg border border-swg-line px-3 text-sm"
                disabled={step === "token"}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@kgpian.iitkgp.ac.in"
                required
                type="email"
                value={email}
              />
            </label>

            {step === "token" ? (
              <label className="block">
                <span className="text-sm font-semibold text-swg-navy">
                  One-time password
                </span>
                <input
                  className="swg-focus mt-2 min-h-11 w-full rounded-md border border-swg-line px-3 text-sm"
                  inputMode="numeric"
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="6 digit code"
                  required
                  value={token}
                />
              </label>
            ) : null}

            <Button
              className="w-full"
              disabled={!isSupabaseConfigured}
              icon={ArrowRight}
              isLoading={isLoading}
              type="submit"
            >
              {step === "email"
                ? mode === "signin"
                  ? "Send OTP"
                  : "Create account"
                : "Verify and continue"}
            </Button>
            {step === "token" ? (
              <Button
                className="w-full"
                onClick={() => {
                  setStep("email");
                  setToken("");
                  setStatus(null);
                }}
                variant="secondary"
              >
                Change email
              </Button>
            ) : null}
          </form>
        </div>
        </div>
      </section>
    </main>
  );
}
