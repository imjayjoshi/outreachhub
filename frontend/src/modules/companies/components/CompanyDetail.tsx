"use client";
import { useState, useEffect } from "react";
import { companyService } from "../services/companyService";
import { CompanyForm } from "./CompanyForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import {
  Building2,
  Globe,
  MapPin,
  Pencil,
  ArrowLeft,
  Users,
  FileText,
  ExternalLink,
  Mail,
  Phone,
  Briefcase,
  History,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Contact {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  status: string;
}

interface Company {
  id: string;
  companyName: string;
  email: string | null;
  phone: string | null;
  careerUrl: string | null;
  website: string | null;
  linkedin: string | null;
  industry: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  employeeSize: string | null;
  status: string;
  source: string;
  createdAt: string;
  contacts: Contact[];
}

const STATUS_COLORS: Record<string, string> = {
  new: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  contacted: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  replied: "bg-green-500/10 text-green-400 border-green-500/20",
  rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  default: "bg-midnight-card text-midnight-muted border-midnight-border",
};

interface CompanyDetailProps {
  id: string;
}

export function CompanyDetail({ id }: CompanyDetailProps) {
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    companyService
      .get(id)
      .then((data) => {
        if (!cancelled) setCompany(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load company details.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, refreshKey]);

  const fetchCompany = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48 rounded-xl bg-midnight-card/50" />
        <Skeleton className="h-32 w-full rounded-xl bg-midnight-card/50" />
        <Skeleton className="h-64 w-full rounded-xl bg-midnight-card/50" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center select-none">
        <Building2 className="h-12 w-12 text-midnight-muted mb-4" />
        <h3 className="text-base font-semibold text-white">
          Company not found
        </h3>
        <Button
          onClick={() => router.back()}
          className="mt-4 text-midnight-muted hover:text-white"
          variant="ghost"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    );
  }

  // Helper to compile Location
  const getLocationString = () => {
    const parts = [company.city, company.state, company.country].filter(
      Boolean,
    );
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const locationStr = getLocationString();

  return (
    <div className="p-6 space-y-6 max-w-4xl select-none">
      {/* Back + Edit Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/companies")}
          className="flex items-center gap-1.5 text-sm text-midnight-muted hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Companies
        </button>
        <Button
          onClick={() => setEditOpen(true)}
          variant="ghost"
          className="flex items-center gap-2 text-midnight-muted hover:text-white hover:bg-midnight-card/40 rounded-xl cursor-pointer"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Company Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-midnight-border bg-midnight-card/40 p-6 space-y-5"
      >
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 shrink-0 rounded-xl bg-midnight-card border border-midnight-border flex items-center justify-center">
            <Building2 className="h-7 w-7 text-midnight-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white truncate">
                {company.companyName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-midnight-success/15 text-midnight-success border border-midnight-success/20">
                {company.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-midnight-muted">
              {company.industry && (
                <span className="inline-flex text-xs bg-midnight-primary/10 text-midnight-primary border border-midnight-primary/20 px-2.5 py-1 rounded-full font-medium">
                  {company.industry}
                </span>
              )}
              {locationStr && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {locationStr}
                </span>
              )}
              {company.employeeSize && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {company.employeeSize}{" "}
                  employees
                </span>
              )}
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-midnight-primary hover:text-midnight-secondary transition-colors"
                >
                  <Globe className="h-3.5 w-3.5" />
                  {company.website.replace(/https?:\/\//, "")}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-midnight-border">
          <div className="flex items-center gap-2 text-xs">
            <Mail className="h-4 w-4 text-midnight-muted shrink-0" />
            <span className="text-midnight-muted font-medium">Email:</span>
            <span
              className="text-white truncate"
              title={company.email || "N/A"}
            >
              {company.email || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Phone className="h-4 w-4 text-midnight-muted shrink-0" />
            <span className="text-midnight-muted font-medium">Phone:</span>
            <span
              className="text-white truncate"
              title={company.phone || "N/A"}
            >
              {company.phone || "N/A"}
            </span>
          </div>

          {company.careerUrl ? (
            <div className="flex items-center gap-2 text-xs">
              <Briefcase className="h-4 w-4 text-midnight-muted shrink-0" />
              <span className="text-midnight-muted font-medium">Careers:</span>
              <a
                href={company.careerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-midnight-primary hover:underline truncate"
              >
                Link{" "}
                <ExternalLink className="h-2.5 w-2.5 inline-block ml-0.5" />
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <Briefcase className="h-4 w-4 text-midnight-muted shrink-0" />
              <span className="text-midnight-muted font-medium">Careers:</span>
              <span className="text-midnight-muted italic">N/A</span>
            </div>
          )}
        </div>

        {/* Metadata Source Log */}
        <div className="flex items-center gap-2 text-[10px] text-midnight-muted pt-2.5 border-t border-midnight-border/50">
          <History className="h-3.5 w-3.5" />
          <span>
            Source:{" "}
            <strong className="text-white font-bold">{company.source}</strong>
          </span>
          <span>•</span>
          <span>
            Imported:{" "}
            <strong className="text-white font-bold">
              {new Date(company.createdAt).toLocaleString()}
            </strong>
          </span>
        </div>

        {company.description && (
          <div className="pt-3 border-t border-midnight-border">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-midnight-muted uppercase tracking-wide mb-2">
              <FileText className="h-3.5 w-3.5" /> Description / Notes
            </div>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {company.description}
            </p>
          </div>
        )}
      </motion.div>

      {/* Contacts Section */}
      <div>
        <h2 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-midnight-secondary" />
          Linked Contacts ({company.contacts.length})
        </h2>

        {company.contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-midnight-border bg-midnight-card/20 py-10 text-center">
            <p className="text-sm text-midnight-muted">
              No contacts linked to this company yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {company.contacts.map((contact, idx) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="flex items-center gap-4 rounded-xl border border-midnight-border bg-midnight-card/40 px-5 py-3.5 hover:border-midnight-primary/30 transition-colors cursor-pointer"
                onClick={() => router.push(`/contacts/${contact.id}`)}
              >
                <div className="h-8 w-8 rounded-full bg-midnight-primary/10 border border-midnight-primary/20 flex items-center justify-center text-midnight-primary text-xs font-bold shrink-0">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {contact.name}
                  </p>
                  <p className="text-xs text-midnight-muted">{contact.email}</p>
                </div>
                {contact.role && (
                  <span className="hidden sm:block text-xs text-midnight-muted">
                    {contact.role}
                  </span>
                )}
                <span
                  className={`text-[10px] font-medium border px-2.5 py-0.5 rounded-full capitalize ${
                    STATUS_COLORS[contact.status] ?? STATUS_COLORS.default
                  }`}
                >
                  {contact.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Form Sheet */}
      <CompanyForm
        open={editOpen}
        onOpenChange={setEditOpen}
        company={company}
        onSuccess={() => {
          setEditOpen(false);
          fetchCompany();
        }}
      />
    </div>
  );
}
