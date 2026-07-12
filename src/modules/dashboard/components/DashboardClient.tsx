"use client";
import {
  Sparkles,
  Users,
  Megaphone,
  MailOpen,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    id?: string | null;
  };
}

export function DashboardClient({ user }: DashboardClientProps) {
  return (
    <div className="p-6 space-y-6">
      {/* User welcome banner */}
      <div className="rounded-xl border border-midnight-border bg-linear-to-r from-midnight-primary/10 via-midnight-surface/5 to-transparent p-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Welcome back, {user.name || "Test User"}!{" "}
          <Sparkles className="h-4 w-4 text-midnight-primary" />
        </h3>
        <p className="mt-1.5 text-midnight-muted max-w-xl text-xs leading-relaxed">
          Your outreach campaign metrics are performing well this week. Monitor
          campaigns, response analytics, and contact management below.
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
            <span className="text-[10px] text-midnight-primary">Active</span>
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
        <h4 className="text-sm font-semibold text-white">System Information</h4>
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
  );
}
