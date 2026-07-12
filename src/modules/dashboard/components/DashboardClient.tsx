"use client";
import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import {
  useAppDispatch,
  useAppSelector,
  toggleSidebar,
} from "@/modules/shared";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { dashboardMenuItems } from "../config/menu";
import {
  LogOut,
  Menu,
  X,
  User,
  TrendingUp,
  MailOpen,
  MousePointerClick,
  Sparkles,
  Users,
  Megaphone,
} from "lucide-react";
import Image from "next/image";

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  };
}

export function DashboardClient({ user }: DashboardClientProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-midnight-bg text-midnight-text overflow-hidden font-sans">
      {/* Minimal distinct sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        className="relative z-20 flex flex-col h-full bg-midnight-surface border-r border-midnight-border shrink-0 select-none overflow-hidden"
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-midnight-border">
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden">
              <Image
                src="/careerflow.png"
                alt="CareerFlow Logo"
                fill
                sizes="44px"
                className="object-contain animate-fade-in"
              />
            </div>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-extrabold text-lg tracking-wide uppercase text-white"
              >
                Career<span className="text-midnight-secondary">Flow</span>
              </motion.span>
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="text-midnight-muted hover:text-midnight-text p-1.5 rounded-md hover:bg-midnight-card/40 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {dashboardMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`relative flex items-center gap-3 w-full px-3 h-10 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group ${
                  isActive
                    ? "text-midnight-primary bg-midnight-card/60"
                    : "text-midnight-muted hover:text-midnight-text hover:bg-midnight-card/20"
                }`}
              >
                {/* Minimal Active Bar Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-midnight-primary rounded-r-md"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                    isActive
                      ? "text-midnight-primary"
                      : "text-midnight-muted group-hover:text-midnight-text"
                  }`}
                />
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {item.title}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Panel Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header toolbar */}
        <header className="flex h-16 items-center justify-between px-6 border-b border-midnight-border bg-midnight-surface/40 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="text-midnight-muted hover:text-midnight-text hover:bg-midnight-card/40 p-1.5 rounded-md transition-all cursor-pointer"
              >
                <Menu className="h-4 w-4" />
              </button>
            )}
            <h2 className="text-sm font-semibold tracking-wide uppercase text-white">
              Dashboard Overview
            </h2>
          </div>
          <div className="flex items-center gap-4">
            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-midnight-card border border-midnight-border text-midnight-muted hover:text-midnight-text hover:bg-midnight-card/80 transition-all cursor-pointer shadow-sm"
              >
                <User className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-midnight-border bg-midnight-surface p-2 shadow-2xl z-50 text-left"
                  >
                    {/* User Metadata */}
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.name || "Test User"}
                      </p>
                      <p className="text-xs text-midnight-muted truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="h-px bg-midnight-border my-2" />

                    {/* Dropdown Items */}
                    <button
                      disabled
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-midnight-muted cursor-not-allowed text-left"
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer text-left font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dashboard Panels */}
        <main className="flex-1 overflow-y-auto p-6 bg-midnight-bg">
          <div className="space-y-6">
            {/* User welcome banner */}
            <div className="rounded-xl border border-midnight-border bg-linear-to-r from-midnight-primary/10 via-midnight-surface/5 to-transparent p-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                Welcome back, {user.name || "Test User"}!{" "}
                <Sparkles className="h-4 w-4 text-midnight-primary" />
              </h3>
              <p className="mt-1.5 text-midnight-muted max-w-xl text-xs leading-relaxed">
                Your outreach campaign metrics are performing well this week.
                Monitor campaigns, response analytics, and contact management
                below.
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Card 1 */}
              <div className="rounded-xl border border-midnight-border bg-midnight-card p-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-midnight-muted">
                    Total Contacts
                  </span>
                  <Users className="h-4 w-4 text-midnight-primary" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-2xl font-bold tracking-tight text-white">
                    1,248
                  </div>
                  <span className="text-[10px] text-midnight-success flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> +12%
                  </span>
                </div>
                <p className="text-[10px] text-midnight-muted mt-1.5">
                  Active sync database
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-xl border border-midnight-border bg-midnight-card p-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-midnight-muted">
                    Campaigns Sent
                  </span>
                  <Megaphone className="h-4 w-4 text-midnight-secondary" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-2xl font-bold tracking-tight text-white">
                    14
                  </div>
                  <span className="text-[10px] text-midnight-primary">
                    Active
                  </span>
                </div>
                <p className="text-[10px] text-midnight-muted mt-1.5">
                  4 running draft schedulers
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-xl border border-midnight-border bg-midnight-card p-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-midnight-muted">
                    Email Open Rate
                  </span>
                  <MailOpen className="h-4 w-4 text-midnight-accent" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-2xl font-bold tracking-tight text-white">
                    64.2%
                  </div>
                  <span className="text-[10px] text-midnight-success flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> +4.2%
                  </span>
                </div>
                <p className="text-[10px] text-midnight-muted mt-1.5">
                  Outperforming sector average
                </p>
              </div>

              {/* Card 4 */}
              <div className="rounded-xl border border-midnight-border bg-midnight-card p-6">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-medium text-midnight-muted">
                    Link Click Rate
                  </span>
                  <MousePointerClick className="h-4 w-4 text-midnight-secondary" />
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <div className="text-2xl font-bold tracking-tight text-white">
                    28.4%
                  </div>
                  <span className="text-[10px] text-midnight-success flex items-center gap-0.5">
                    <TrendingUp className="h-3 w-3" /> +2.1%
                  </span>
                </div>
                <p className="text-[10px] text-midnight-muted mt-1.5">
                  Highly engaged recipients
                </p>
              </div>
            </div>

            {/* System Information Card */}
            <div className="rounded-xl border border-midnight-border bg-midnight-card/40 p-6">
              <h4 className="text-sm font-semibold text-white">
                System Information
              </h4>
              <div className="mt-4 grid gap-2.5 text-xs text-midnight-muted">
                <div className="flex justify-between border-b border-midnight-border/50 pb-2">
                  <span>Server-Side Session Status</span>
                  <span className="text-midnight-success font-mono">
                    Authenticated & Verified
                  </span>
                </div>
                <div className="flex justify-between border-b border-midnight-border/50 pb-2">
                  <span>Logged in User ID</span>
                  <span className="font-mono text-[10px]">{user.id}</span>
                </div>
                <div className="flex justify-between border-b border-midnight-border/50 pb-2">
                  <span>Redux Sync Store State</span>
                  <span className="text-midnight-primary font-mono">
                    Synced & Rehydrated
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Connected DB Provider</span>
                  <span className="text-indigo-400 font-mono">
                    Neon Serverless (PostgreSQL)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
