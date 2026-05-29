import { Award, LayoutDashboard, LogIn, LogOut } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Button from "./Button";
import { signOut } from "../lib/supabase";

const navItems = [
  { to: "/mentorship/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/mentorship/leaderboard", label: "Leaderboard", icon: Award },
];

export default function PageShell({
  children,
  title,
  eyebrow,
  actions,
  showSignOut = true,
}) {
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/mentorship", { replace: true });
  }

  return (
    <main className="min-h-screen bg-swg-mist text-swg-ink">
      <header className="border-b border-swg-line bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <Link className="swg-focus rounded-sm" to="/mentorship/dashboard">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-swg-blue">
              Students' Welfare Group
            </div>
            <div className="text-lg font-bold text-swg-navy">
              Mentorship Portal
            </div>
          </Link>
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `swg-focus inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold ${
                    isActive
                      ? "bg-swg-blue text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-swg-navy"
                  }`
                }
                key={item.to}
                to={item.to}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            {showSignOut ? (
              <Button icon={LogOut} onClick={handleSignOut} variant="ghost">
                Sign out
              </Button>
            ) : (
              <Button
                icon={LogIn}
                onClick={() => navigate("/mentorship")}
                variant="ghost"
              >
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {eyebrow ? (
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-swg-blue">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-2xl font-bold tracking-normal text-swg-navy md:text-3xl">
              {title}
            </h1>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        {children}
      </section>
    </main>
  );
}
