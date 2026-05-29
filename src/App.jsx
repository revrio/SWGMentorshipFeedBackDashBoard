import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Loader2 } from "lucide-react";
import { getCurrentAppUser, supabase } from "./lib/supabase";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";

function LoadingScreen() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
        <div className="flex items-center gap-3 rounded border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-sky-700" />
          Loading mentorship portal
        </div>
      </div>
    </main>
  );
}

function ProtectedRoute() {
  const location = useLocation();
  const [state, setState] = useState({
    isLoading: true,
    isAllowed: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function verifyAccess() {
      const { user, profile, error } = await getCurrentAppUser();

      if (!isMounted) return;

      setState({
        isLoading: false,
        isAllowed: Boolean(user && profile && !error),
      });
    }

    verifyAccess();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verifyAccess();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (state.isLoading) {
    return <LoadingScreen />;
  }

  if (!state.isAllowed) {
    return (
      <Navigate
        replace
        to="/mentorship"
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate replace to="/mentorship" />} />
        <Route path="/mentorship" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/mentorship/dashboard" element={<Dashboard />} />
        </Route>
        <Route path="/mentorship/leaderboard" element={<Leaderboard />} />
        <Route path="*" element={<Navigate replace to="/mentorship" />} />
      </Routes>
    </BrowserRouter>
  );
}
