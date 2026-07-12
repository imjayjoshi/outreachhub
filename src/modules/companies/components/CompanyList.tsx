"use client";
import { useState, useEffect, useRef } from "react";
import { companyService } from "../services/companyService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Building2,
  Globe,
  MapPin,
  Pencil,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Company {
  id: string;
  name: string;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  notes?: string | null;
  createdAt: string;
}

interface CSVRow {
  companyName: string;
  website?: string;
  location?: string;
  industry?: string;
  contactName: string;
  email: string;
  role?: string;
  phone?: string;
}

export function CompanyList() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      toast.loading("Importing leads from CSV...", { id: "csv-import" });

      try {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) throw new Error("CSV file is empty");

        const headers = lines[0]
          .split(",")
          .map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const rows: CSVRow[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const values: string[] = [];
          let current = "";
          let inQuotes = false;
          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"' || char === "'") {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              values.push(current.trim().replace(/^["']|["']$/g, ""));
              current = "";
            } else {
              current += char;
            }
          }
          values.push(current.trim().replace(/^["']|["']$/g, ""));

          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index] || "";
          });

          const getVal = (possibleKeys: string[]) => {
            const key = Object.keys(rowData).find((k) =>
              possibleKeys.includes(k.toLowerCase().trim()),
            );
            return key ? rowData[key] : "";
          };

          const companyName = getVal([
            "company name",
            "company",
            "organization",
            "firm",
          ]);
          const website = getVal([
            "website",
            "domain",
            "url",
            "web",
            "carrer page link",
            "career page link",
            "career page",
            "carrer page",
            "career link",
            "carrer link",
          ]);
          const location = getVal(["location", "city", "address", "state"]);
          const industry = getVal(["industry", "sector"]);
          const contactName = getVal([
            "contact name",
            "name",
            "contact",
            "person",
            "full name",
          ]);
          const email = getVal([
            "email",
            "mail",
            "email address",
            "contact email",
            "email id",
            "email_id",
          ]);
          const role = getVal(["role", "title", "designation", "job title"]);
          const phone = getVal([
            "phone",
            "mobile",
            "tel",
            "phone number",
            "mobile number",
            "mobile_number",
          ]);

          if (companyName && email) {
            rows.push({
              companyName,
              website,
              location,
              industry,
              contactName,
              email,
              role,
              phone,
            });
          }
        }

        if (rows.length === 0) {
          toast.error(
            "No valid rows found in CSV. Make sure you have 'Company Name' and 'Email ID' (or 'Email') columns.",
            { id: "csv-import" },
          );
          return;
        }

        const res = await fetch("/api/companies/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        });

        if (!res.ok) throw new Error("Import failed");
        const data = await res.json();

        toast.success(`Successfully imported ${data.imported} leads!`, {
          id: "csv-import",
        });
        fetchCompanies();
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to import CSV.";
        toast.error(errorMsg, {
          id: "csv-import",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const lastFetchedKey = useRef<number | null>(null);

  useEffect(() => {
    if (lastFetchedKey.current === refreshKey) return;
    lastFetchedKey.current = refreshKey;

    let cancelled = false;
    companyService
      .list()
      .then((data) => {
        if (!cancelled) setCompanies(data);
      })
      .catch(() => {
        if (!cancelled) toast.error("Failed to load companies.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // setLoading(true) is called here — outside the effect — so the linter is satisfied.
  const fetchCompanies = () => {
    setLoading(true);
    setRefreshKey((k) => k + 1);
  };

  const handleEdit = (company: Company) => {
    router.push(`/companies/edit/${company.id}`);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await companyService.remove(id);
      toast.success("Company deleted.");
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch {
      toast.error("Failed to delete company.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCsvUpload}
        accept=".csv"
        className="hidden"
      />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-midnight-primary" />
            Companies
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            Manage and track companies in your outreach pipeline.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="border-midnight-border hover:bg-midnight-card text-midnight-text font-semibold rounded-xl cursor-pointer flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Upload CSV
          </Button>
          <Button
            onClick={() => router.push("/companies/new")}
            className="bg-midnight-primary hover:bg-[#4676E5] text-white font-semibold rounded-xl shadow-lg shadow-midnight-primary/10 cursor-pointer flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Company
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton
              key={i}
              className="h-16 w-full rounded-xl bg-midnight-card/50"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && companies.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center flex-1 py-20 text-center"
        >
          <div className="h-16 w-16 rounded-2xl bg-midnight-card flex items-center justify-center mb-4 border border-midnight-border">
            <Building2 className="h-8 w-8 text-midnight-muted" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">
            No companies yet
          </h3>
          <p className="text-sm text-midnight-muted max-w-xs">
            Start by adding the first company or uploading a CSV of leads.
          </p>
        </motion.div>
      )}

      {/* Company Cards */}
      {!loading && companies.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {companies.map((company, idx) => (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.03 }}
                className="group flex items-center gap-4 rounded-xl border border-midnight-border bg-midnight-card/40 px-5 py-4 hover:border-midnight-primary/30 hover:bg-midnight-card/70 transition-all duration-200"
              >
                {/* Icon */}
                <div className="h-10 w-10 shrink-0 rounded-lg bg-midnight-card border border-midnight-border flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-midnight-primary" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {company.name}
                    </p>
                    {company.industry && (
                      <span className="hidden sm:inline-flex text-[10px] bg-midnight-primary/10 text-midnight-primary border border-midnight-primary/20 px-2 py-0.5 rounded-full font-medium">
                        {company.industry}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-midnight-muted">
                    {company.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:text-midnight-secondary truncate max-w-[140px] transition-colors"
                        >
                          {company.website.replace(/https?:\/\//, "")}
                        </a>
                      </span>
                    )}
                    {company.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {company.location}
                      </span>
                    )}
                    {company.size && (
                      <span className="text-midnight-muted/60">
                        {company.size} employees
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(company)}
                    className="p-2 rounded-lg hover:bg-midnight-bg text-midnight-muted hover:text-white transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    disabled={deletingId === company.id}
                    className="p-2 rounded-lg hover:bg-rose-500/10 text-midnight-muted hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                    title="Delete"
                  >
                    {deletingId === company.id ? (
                      <AlertTriangle className="h-3.5 w-3.5 animate-pulse" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => router.push(`/companies/${company.id}`)}
                    className="p-2 rounded-lg hover:bg-midnight-bg text-midnight-muted hover:text-midnight-secondary transition-colors cursor-pointer"
                    title="View details"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
