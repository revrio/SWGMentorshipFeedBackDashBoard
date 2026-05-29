import React from "react";
import {
  Award,
  CircleUserRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Mail,
} from "lucide-react";
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
    <main className="min-h-screen bg-[#f7f9fc] text-swg-ink">
      <div className="flex min-h-screen w-full bg-swg-mist">
        <aside className="hidden w-64 shrink-0 border-r border-swg-line bg-white/90 lg:flex lg:flex-col">
          <Link
            className="swg-focus flex h-20 items-center gap-3 border-b border-swg-line px-7"
            to="/mentorship/dashboard"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-swg-aqua text-lg font-black text-swg-blue">
              S
            </div>
            <div className="text-3xl font-black tracking-normal text-swg-navy">
              SWG
            </div>
          </Link>

          <nav className="flex flex-1 flex-col gap-2 px-4 py-6">
            {navItems.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  `swg-focus relative inline-flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-semibold ${
                    isActive
                      ? "bg-swg-aqua text-swg-blue shadow-sm after:absolute after:right-0 after:top-2 after:h-8 after:w-1 after:rounded-l-full after:bg-swg-teal"
                      : "text-slate-500 hover:bg-slate-50 hover:text-swg-navy"
                  }`
                }
                key={item.to}
                to={item.to}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-current shadow-sm">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-swg-line p-6 text-sm text-slate-500">
            <div className="mb-3 flex items-center gap-2 font-semibold text-swg-blue">
              <Mail className="h-4 w-4" />
              SWG IIT KGP
            </div>
            <p>swg@iitkgp.ac.in</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 border-b border-swg-line bg-white/95 backdrop-blur">
            <div className="flex min-h-20 flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
              <div className="min-w-0">
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-swg-aqua font-black text-swg-blue">
                    S
                  </div>
                  <span className="text-2xl font-black text-swg-navy">SWG</span>
                </div>
                <div className="mt-3 lg:mt-0">
                  {eyebrow ? (
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-swg-teal">
                      {eyebrow}
                    </p>
                  ) : null}
                  <h1 className="truncate text-2xl font-bold tracking-normal text-swg-navy md:text-3xl">
                    {title}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {actions ? (
                  <div className="flex flex-wrap gap-2">{actions}</div>
                ) : null}
                <div className="flex items-center gap-2 rounded-full border border-swg-line bg-white px-3 py-2 shadow-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-swg-aqua text-swg-blue">
                    <CircleUserRound className="h-5 w-5" />
                  </span>
                  {showSignOut ? (
                    <Button
                      className="min-h-8 px-2 shadow-none"
                      icon={LogOut}
                      onClick={handleSignOut}
                      variant="ghost"
                    >
                      Sign out
                    </Button>
                  ) : (
                    <Button
                      className="min-h-8 px-2 shadow-none"
                      icon={LogIn}
                      onClick={() => navigate("/mentorship")}
                      variant="ghost"
                    >
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto border-t border-swg-line px-5 py-3 lg:hidden">
              {navItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    `swg-focus inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
                      isActive
                        ? "bg-swg-aqua text-swg-blue"
                        : "bg-white text-slate-500"
                    }`
                  }
                  key={item.to}
                  to={item.to}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <section className="w-full px-5 py-6 lg:px-8 lg:py-8">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
