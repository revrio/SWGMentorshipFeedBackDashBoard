import { useState } from "react";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import StatusBanner from "../components/StatusBanner";
import {
  getCurrentAppUser,
  isSupabaseConfigured,
  sendLoginOtp,
  supabase,
  verifyLoginOtp,
} from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [step, setStep] = useState("email");
  const [status, setStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  async function handleSendOtp(event) {
    event.preventDefault();
    setIsLoading(true);
    setStatus(null);

    const normalizedEmail = email.trim().toLowerCase();
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
        message: "This email is not enabled for the SWG mentorship portal.",
      });
      return;
    }

    const { error } = await sendLoginOtp(normalizedEmail);

    setIsLoading(false);

    if (error) {
      setStatus({ tone: "red", message: error.message });
      return;
    }

    setEmail(normalizedEmail);
    setStep("token");
    setStatus({
      tone: "green",
      message: "A one-time password has been sent to your email.",
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

    const { profile, error: profileError } = await getCurrentAppUser();
    setIsLoading(false);

    if (profileError || !profile) {
      setStatus({
        tone: "red",
        message: "Your account is authenticated but not authorized here.",
      });
      return;
    }

    setIsAuthenticated(true);
    navigate(location.state?.from ?? "/mentorship/dashboard", { replace: true });
  }

  if (isAuthenticated) {
    return <Navigate replace to="/mentorship/dashboard" />;
  }

  return (
    <main className="min-h-screen bg-swg-mist text-swg-ink">
      <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-8 px-5 py-10 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-swg-blue">
            Students' Welfare Group, IIT Kharagpur
          </p>
          <h1 className="text-4xl font-bold tracking-normal text-swg-navy md:text-5xl">
            Mentorship Dashboard
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
            Submit cycle feedback and review frozen mentor rankings through a
            focused portal built for the SWG mentorship workflow.
          </p>
          <div className="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
            <div className="rounded-md border border-swg-line bg-white p-4">
              <ShieldCheck className="mb-3 h-5 w-5 text-swg-blue" />
              OTP access for mentees and admins only.
            </div>
            <div className="rounded-md border border-swg-line bg-white p-4">
              <Mail className="mb-3 h-5 w-5 text-swg-blue" />
              Feedback windows follow active database cycles.
            </div>
          </div>
        </div>

        <div className="rounded-md border border-swg-line bg-white p-6 shadow-corporate">
          <h2 className="text-xl font-bold text-swg-navy">
            {step === "email" ? "Sign in with email" : "Enter OTP"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {step === "email"
              ? "Use the email registered in the mentorship users table."
              : `We sent the code to ${email}.`}
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
                className="swg-focus mt-2 min-h-11 w-full rounded-md border border-swg-line px-3 text-sm"
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
              {step === "email" ? "Send OTP" : "Verify and continue"}
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
      </section>
    </main>
  );
}
