"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  Building2,
  Send,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  id: string;
  name: string;
  website: string;
  city: string;
  state: string | null;
  industry: string;
  email: string | null;
  source: string;
  status: string;
  mailSent: boolean;
  followUpSent: boolean;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: {
    label: "New",
    color:
      "text-midnight-primary bg-midnight-primary/10 border-midnight-primary/20",
  },
  mailed: {
    label: "Mailed",
    color:
      "text-midnight-secondary bg-midnight-secondary/10 border-midnight-secondary/20",
  },
  replied: {
    label: "Replied",
    color:
      "text-midnight-success bg-midnight-success/10 border-midnight-success/20",
  },
  bounced: {
    label: "Bounced",
    color: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  },
  followup: {
    label: "Follow Up",
    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  email_not_found: {
    label: "No Email",
    color: "text-midnight-muted bg-midnight-card border-midnight-border",
  },
};

const CITIES = ["All Cities", "Ahmedabad", "Pune", "Bangalore", "Hyderabad"];
const STATUSES = [
  "All",
  "new",
  "mailed",
  "replied",
  "bounced",
  "followup",
  "email_not_found",
];
const SOURCE_COLORS: Record<string, string> = {
  duckduckgo: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  clutch: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  goodfirms: "text-teal-400 bg-teal-400/10 border-teal-400/20",
};

function getSourceColor(source: string) {
  for (const [key, cls] of Object.entries(SOURCE_COLORS)) {
    if (source.includes(key)) return cls;
  }
  return "text-midnight-muted bg-midnight-card border-midnight-border";
}

function getSourceLabel(source: string) {
  // combined sources like "duckduckgo+clutch" → "Multi"
  if (source.includes("+")) return "Multi";
  return source.charAt(0).toUpperCase() + source.slice(1);
}

export function LeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("All Cities");
  const [statusFilter, setStatusFilter] = useState("All");
  const [emailOnly, setEmailOnly] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const lastFetchedState = useRef<string | null>(null);

  useEffect(() => {
    const currentStateKey = `${cityFilter}-${statusFilter}-${emailOnly}-${refreshKey}`;
    if (lastFetchedState.current === currentStateKey) return;
    lastFetchedState.current = currentStateKey;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cityFilter !== "All Cities") params.set("city", cityFilter);
        if (statusFilter !== "All") params.set("status", statusFilter);
        if (emailOnly) params.set("emailOnly", "true");

        const res = await fetch(`/api/leads?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch leads");
        const data = await res.json();
        if (!cancelled) setLeads(data);
      } catch {
        if (!cancelled) toast.error("Failed to load leads.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [cityFilter, statusFilter, emailOnly, refreshKey]);

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.website.toLowerCase().includes(q) ||
      (l.email ?? "").toLowerCase().includes(q)
    );
  });

  const emailFoundCount = leads.filter((l) => l.email).length;
  const mailSentCount = leads.filter((l) => l.mailSent).length;

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-midnight-primary" />
            Scraped Leads
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            Auto-discovered IT companies via DuckDuckGo · Clutch · GoodFirms
          </p>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="flex items-center gap-1.5 text-xs text-midnight-muted hover:text-white border border-midnight-border rounded-lg px-3 py-2 hover:bg-midnight-card/60 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Leads", value: leads.length, color: "text-white" },
          {
            label: "Emails Found",
            value: emailFoundCount,
            color: "text-midnight-success",
          },
          {
            label: "Mails Sent",
            value: mailSentCount,
            color: "text-midnight-secondary",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-midnight-border bg-midnight-card/40 px-4 py-3"
          >
            <p className="text-[10px] text-midnight-muted uppercase tracking-wider">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold mt-0.5 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-midnight-muted" />
          <input
            type="text"
            placeholder="Search name, website, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-midnight-card border border-midnight-border rounded-lg text-midnight-text placeholder:text-midnight-muted focus:outline-none focus:border-midnight-primary/60 transition-colors"
          />
        </div>

        {/* City filter */}
        <div className="relative">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-midnight-card border border-midnight-border rounded-lg text-midnight-text focus:outline-none focus:border-midnight-primary/60 cursor-pointer transition-colors"
          >
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-midnight-muted pointer-events-none" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 text-sm bg-midnight-card border border-midnight-border rounded-lg text-midnight-text focus:outline-none focus:border-midnight-primary/60 cursor-pointer transition-colors"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Statuses" : (STATUS_LABELS[s]?.label ?? s)}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-midnight-muted pointer-events-none" />
        </div>

        {/* Email only toggle */}
        <button
          onClick={() => setEmailOnly((v) => !v)}
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
            emailOnly
              ? "border-midnight-success/40 bg-midnight-success/10 text-midnight-success"
              : "border-midnight-border bg-midnight-card text-midnight-muted hover:text-white"
          }`}
        >
          <Filter className="h-3.5 w-3.5" />
          Email Found Only
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-midnight-card/30 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-midnight-card border border-midnight-border flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-midnight-muted" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            No leads found
          </h3>
          <p className="text-sm text-midnight-muted max-w-xs">
            {leads.length === 0
              ? "Run the worker with pnpm worker, then trigger a fetch job."
              : "Try adjusting your filters."}
          </p>
        </motion.div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-midnight-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-midnight-border bg-midnight-surface/60">
                {[
                  "Company",
                  "City",
                  "Source",
                  "Email",
                  "Email Found",
                  "Mail Sent",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[11px] font-semibold text-midnight-muted uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((lead, idx) => {
                  const statusMeta = STATUS_LABELS[lead.status] ?? {
                    label: lead.status,
                    color:
                      "text-midnight-muted bg-midnight-card border-midnight-border",
                  };
                  const hasEmail = !!lead.email;
                  return (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="border-b border-midnight-border/50 hover:bg-midnight-card/30 transition-colors group"
                    >
                      {/* Company */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 rounded-lg bg-midnight-card border border-midnight-border flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-midnight-primary" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate max-w-[180px]">
                              {lead.name}
                            </p>
                            <a
                              href={`https://${lead.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] text-midnight-muted hover:text-midnight-secondary transition-colors truncate max-w-[180px]"
                            >
                              <Globe className="h-3 w-3 shrink-0" />
                              {lead.website}
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* City */}
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-midnight-muted text-xs">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {lead.city}
                          {lead.state ? `, ${lead.state}` : ""}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex text-[10px] font-medium border px-2 py-0.5 rounded-full ${getSourceColor(lead.source)}`}
                        >
                          {getSourceLabel(lead.source)}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 text-xs text-midnight-secondary hover:text-white transition-colors truncate max-w-[180px]"
                          >
                            <Mail className="h-3 w-3 shrink-0" />
                            {lead.email}
                          </a>
                        ) : (
                          <span className="text-xs text-midnight-muted italic">
                            Not found
                          </span>
                        )}
                      </td>

                      {/* Email Found badge */}
                      <td className="px-4 py-3.5">
                        {hasEmail ? (
                          <span className="flex items-center gap-1 text-xs text-midnight-success font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Yes
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-midnight-muted">
                            <XCircle className="h-3.5 w-3.5" />
                            No
                          </span>
                        )}
                      </td>

                      {/* Mail Sent badge */}
                      <td className="px-4 py-3.5">
                        {lead.mailSent ? (
                          <span className="flex items-center gap-1 text-xs text-midnight-secondary font-medium">
                            <Send className="h-3.5 w-3.5" />
                            Sent
                          </span>
                        ) : (
                          <span className="text-xs text-midnight-muted">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex text-[10px] font-medium border px-2 py-0.5 rounded-full ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Row count */}
      {!loading && filtered.length > 0 && (
        <p className="text-[11px] text-midnight-muted text-right">
          Showing {filtered.length} of {leads.length} leads
        </p>
      )}
    </div>
  );
}
