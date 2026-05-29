import React, { useEffect, useState } from "react";
import { RefreshCw, Trophy } from "lucide-react";
import Button from "../components/Button";
import LeaderboardTable from "../components/LeaderboardTable";
import PageShell from "../components/PageShell";
import StatusBanner from "../components/StatusBanner";
import { isSupabaseConfigured, supabase } from "../lib/supabase";

const views = {
  default: "default",
  overall: "overall",
};

export default function Leaderboard() {
  const [activeView, setActiveView] = useState(views.default);
  const [rows, setRows] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeaderboard(activeView);
  }, [activeView]);

  async function getCurrentSessionRow() {
    const { data, error: sessionError } = await supabase
      .from("academic_sessions")
      .select("id, session_name")
      .eq("is_current", true)
      .maybeSingle();

    if (sessionError) throw sessionError;
    return data;
  }

  async function getLatestClosedCycle(sessionId) {
    const { data, error: cycleError } = await supabase
      .from("feedback_cycles")
      .select("id, cycle_name, closes_at")
      .eq("session_id", sessionId)
      .lt("closes_at", new Date().toISOString())
      .order("closes_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cycleError) throw cycleError;
    return data;
  }

  async function loadLeaderboard(view) {
    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        setSession(null);
        setCycle(null);
        setRows([]);
        setError(
          "Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to load snapshots.",
        );
        return;
      }

      const currentSession = await getCurrentSessionRow();
      setSession(currentSession);

      if (!currentSession) {
        setRows([]);
        setCycle(null);
        setError("No current academic session is configured.");
        return;
      }

      let query = supabase
        .from("leaderboard_snapshots")
        .select(
          "id, mentor_id, session_id, cycle_id, review, engagement_score, final_score, mentors(name, roll_number)",
        )
        .eq("session_id", currentSession.id)
        .order("final_score", { ascending: false });

      if (view === views.overall) {
        query = query.is("cycle_id", null);
        setCycle(null);
      } else {
        const latestClosedCycle = await getLatestClosedCycle(currentSession.id);
        setCycle(latestClosedCycle);

        if (!latestClosedCycle) {
          setRows([]);
          setError("No closed feedback cycle is available yet.");
          return;
        }

        query = query.eq("cycle_id", latestClosedCycle.id);
      }

      const { data, error: snapshotError } = await query;

      if (snapshotError) throw snapshotError;
      setRows(data ?? []);
    } catch (caughtError) {
      setRows([]);
      setError(caughtError.message ?? "Could not load the leaderboard.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageShell
      actions={
        <>
          <div className="inline-flex rounded-md border border-swg-line bg-white p-1 shadow-sm">
            <button
              className={`swg-focus min-h-9 rounded-lg px-4 text-sm font-semibold ${
                activeView === views.default
                  ? "bg-swg-aqua text-swg-blue shadow-sm"
                  : "text-slate-600 hover:text-swg-navy"
              }`}
              onClick={() => setActiveView(views.default)}
              type="button"
            >
              Default View
            </button>
            <button
              className={`swg-focus min-h-9 rounded-lg px-4 text-sm font-semibold ${
                activeView === views.overall
                  ? "bg-swg-aqua text-swg-blue shadow-sm"
                  : "text-slate-600 hover:text-swg-navy"
              }`}
              onClick={() => setActiveView(views.overall)}
              type="button"
            >
              Overall Session View
            </button>
          </div>
          <Button
            icon={RefreshCw}
            onClick={() => loadLeaderboard(activeView)}
            variant="secondary"
          >
            Refresh
          </Button>
        </>
      }
      eyebrow="Mentorship Leader"
      showSignOut={false}
      title="Mentor Leaderboard"
    >
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-swg-line bg-white p-4 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Session
          </p>
          <p className="mt-2 font-semibold text-swg-navy">
            {session?.session_name ?? "Not configured"}
          </p>
        </div>
        <div className="rounded-2xl border border-swg-line bg-white p-4 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Snapshot
          </p>
          <p className="mt-2 font-semibold text-swg-navy">
            {activeView === views.overall
              ? "Overall session"
              : cycle?.cycle_name ?? "Latest closed cycle"}
          </p>
        </div>
        <div className="rounded-2xl border border-swg-line bg-white p-4 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
            Score Basis
          </p>
          <p className="mt-2 font-semibold text-swg-navy">
            65% rating, 35% engagement
          </p>
        </div>
      </div>

      <div className="mb-5">
        <StatusBanner icon={Trophy} tone="blue">
          Rankings are read from immutable{" "}
          <strong>leaderboard_snapshots</strong>. This screen displays stored
          final scores, raw rating averages, and engagement percentages.
        </StatusBanner>
      </div>

      {error ? (
        <div className="mb-5">
          <StatusBanner tone="amber">{error}</StatusBanner>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-swg-line bg-white p-6 text-sm text-slate-600 shadow-corporate">
          Loading leaderboard snapshots...
        </div>
      ) : (
        <LeaderboardTable rows={rows} />
      )}
    </PageShell>
  );
}
