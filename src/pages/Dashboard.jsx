import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, Send, ShieldAlert, UserRound } from "lucide-react";
import Button from "../components/Button";
import PageShell from "../components/PageShell";
import RatingInput from "../components/RatingInput";
import StatusBanner from "../components/StatusBanner";
import { getCurrentAppUser, supabase } from "../lib/supabase";

const initialState = {
  isLoading: true,
  profile: null,
  mentee: null,
  cycle: null,
  existingFeedback: null,
  error: null,
};

export default function Dashboard() {
  const [state, setState] = useState(initialState);
  const [ratings, setRatings] = useState({ q1_rating: "", q2_rating: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const canSubmit = useMemo(
    () => ratings.q1_rating && ratings.q2_rating && state.cycle && state.mentee,
    [ratings, state.cycle, state.mentee],
  );
  const completedCount = Object.values(ratings).filter(Boolean).length;
  const progressPercent = (completedCount / 2) * 100;

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setState(initialState);

    const { profile, error: profileError } = await getCurrentAppUser();

    if (profileError || !profile) {
      setState({
        ...initialState,
        isLoading: false,
        error: "Your account could not be loaded.",
      });
      return;
    }

    if (profile.role === "admin") {
      setState({
        ...initialState,
        isLoading: false,
        profile,
      });
      return;
    }

    const { data: mentee, error: menteeError } = await supabase
      .from("mentees")
      .select("id, name, roll_number, mentor_id, session_id, mentors(name, roll_number)")
      .eq("id", profile.id)
      .maybeSingle();

    if (menteeError || !mentee) {
      setState({
        ...initialState,
        isLoading: false,
        profile,
        error: "No mentee profile is linked with this account.",
      });
      return;
    }

    const now = new Date().toISOString();
    const { data: cycle, error: cycleError } = await supabase
      .from("feedback_cycles")
      .select("id, cycle_name, opens_at, closes_at, session_id")
      .eq("session_id", mentee.session_id)
      .lte("opens_at", now)
      .gte("closes_at", now)
      .order("closes_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (cycleError) {
      setState({
        ...initialState,
        isLoading: false,
        profile,
        mentee,
        error: "Could not check the current feedback cycle.",
      });
      return;
    }

    if (!cycle) {
      setState({
        ...initialState,
        isLoading: false,
        profile,
        mentee,
      });
      return;
    }

    const { data: existingFeedback, error: feedbackError } = await supabase
      .from("feedbacks")
      .select("id, created_at")
      .eq("mentee_id", mentee.id)
      .eq("cycle_id", cycle.id)
      .maybeSingle();

    setState({
      isLoading: false,
      profile,
      mentee,
      cycle,
      existingFeedback: feedbackError ? null : existingFeedback,
      error: feedbackError
        ? "Could not check your previous submission status."
        : null,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError(null);

    if (!canSubmit) return;

    setIsSubmitting(true);

    const { error } = await supabase.from("feedbacks").insert({
      mentee_id: state.mentee.id,
      mentor_id: state.mentee.mentor_id,
      cycle_id: state.cycle.id,
      q1_rating: Number(ratings.q1_rating),
      q2_rating: Number(ratings.q2_rating),
    });

    setIsSubmitting(false);

    if (error) {
      setSubmitError(error.message);
      return;
    }

    await loadDashboard();
  }

  return (
    <PageShell
      eyebrow="Mentorship Feedback"
      title={
        state.mentee?.name ? `Welcome back, ${state.mentee.name}!` : "Mentorship Dashboard"
      }
    >
      {state.isLoading ? (
        <div className="rounded-md border border-swg-line bg-white p-6 text-sm text-slate-600 shadow-corporate">
          Loading your mentorship dashboard...
        </div>
      ) : null}

      {!state.isLoading && state.error ? (
        <StatusBanner icon={ShieldAlert} tone="red">
          {state.error}
        </StatusBanner>
      ) : null}

      {!state.isLoading && state.profile?.role === "admin" ? (
        <StatusBanner icon={ShieldAlert} tone="blue">
          Admin accounts can access mentorship records and the leaderboard. The
          feedback form is available only to mentee accounts.
        </StatusBanner>
      ) : null}

      {!state.isLoading && state.mentee ? (
        <div className="grid gap-5 xl:grid-cols-[330px_1fr]">
          <aside className="rounded-2xl border border-swg-line bg-white p-5 shadow-corporate">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-swg-aqua text-swg-blue">
                <UserRound className="h-9 w-9" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Mentor
                </p>
                <h2 className="mt-1 text-xl font-bold text-swg-navy">
                  {state.mentee.mentors?.name ?? "Mentor"}
                </h2>
                <p className="text-sm text-slate-500">
                  {state.mentee.mentors?.roll_number ?? "Roll number unavailable"}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-swg-mist p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Mentee Code
              </p>
              <p className="mt-2 font-semibold text-swg-navy">{state.mentee.roll_number}</p>
              <p className="text-sm text-slate-500">{state.mentee.name}</p>
            </div>

            <div className="mt-5 rounded-xl border border-swg-line p-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-swg-navy">Progress</span>
                <span className="font-bold text-swg-teal">{completedCount}/2</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-swg-teal transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            {!state.cycle ? (
              <StatusBanner icon={Clock} tone="amber">
                No feedback cycle is active right now.
              </StatusBanner>
            ) : null}

            {state.cycle && state.existingFeedback ? (
              <StatusBanner icon={CheckCircle2} tone="green">
                Thank you. Your feedback for{" "}
                <strong>{state.cycle.cycle_name}</strong> has already been
                submitted.
              </StatusBanner>
            ) : null}

            {state.cycle && !state.existingFeedback ? (
              <form
                className="rounded-2xl border border-swg-line bg-white p-5 shadow-corporate"
                onSubmit={handleSubmit}
              >
                <div className="mb-5 border-b border-swg-line pb-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-swg-teal">
                        Active Cycle
                      </p>
                      <h2 className="mt-2 text-xl font-bold text-swg-navy">
                        {state.cycle.cycle_name}
                      </h2>
                    </div>
                    <span className="rounded-full bg-swg-aqua px-3 py-1 text-sm font-bold text-swg-blue">
                      {completedCount} of 2 questions completed
                    </span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-swg-teal transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  <RatingInput
                    index="1"
                    label="How helpful was your mentor's academic guidance?"
                    name="q1_rating"
                    onChange={(value) =>
                      setRatings((current) => ({
                        ...current,
                        q1_rating: value,
                      }))
                    }
                    value={ratings.q1_rating}
                  />
                  <RatingInput
                    index="2"
                    label="How responsive and approachable was your mentor?"
                    name="q2_rating"
                    onChange={(value) =>
                      setRatings((current) => ({
                        ...current,
                        q2_rating: value,
                      }))
                    }
                    value={ratings.q2_rating}
                  />
                </div>

                {submitError ? (
                  <div className="mt-5">
                    <StatusBanner tone="red">{submitError}</StatusBanner>
                  </div>
                ) : null}

                <div className="mt-6 flex justify-end">
                  <Button
                    className="min-w-52"
                    disabled={!canSubmit}
                    icon={Send}
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    Submit feedback
                  </Button>
                </div>
              </form>
            ) : null}
          </section>
        </div>
      ) : null}
    </PageShell>
  );
}
