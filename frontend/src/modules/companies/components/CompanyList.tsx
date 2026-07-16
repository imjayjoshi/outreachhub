"use client";
import { useState, useEffect } from "react";
import { companyService } from "../services/companyService";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { ImportWizard } from "./ImportWizard";
import { ImportHistory } from "./ImportHistory";
import {
  Plus,
  Building2,
  Globe,
  Pencil,
  Trash2,
  ChevronRight,
  Upload,
  Search,
  Filter,
  ArrowUpDown,
  History,
  Link,
  ChevronLeft,
  Download,
  Archive,
  Sparkles,
  Copy,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
}

export function CompanyList() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Pagination, Search, Sorting states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("active");
  const [importedToday, setImportedToday] = useState(false);
  const [importedThisWeek, setImportedThisWeek] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);
  const [hasCareerPage, setHasCareerPage] = useState(false);
  const [missingDetails, setMissingDetails] = useState(false);

  const [showFiltersMenu, setShowFiltersMenu] = useState(false);

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Clipboard states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Dialog/Modal states
  const [activeDialog, setActiveDialog] = useState<
    "none" | "wizard" | "history"
  >("none");

  // API Refresh trigger
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const fetchList = async () => {
      Promise.resolve().then(() => {
        if (active) setLoading(true);
      });
      try {
        const params: Record<string, unknown> = {
          page,
          limit,
          sortField,
          sortOrder,
        };

        if (search.trim()) params.search = search.trim();
        if (statusFilter) params.status = statusFilter;
        if (importedToday) params.importedToday = true;
        if (importedThisWeek) params.importedThisWeek = true;
        if (hasEmail) params.hasEmail = true;
        if (hasWebsite) params.hasWebsite = true;
        if (hasCareerPage) params.hasCareerPage = true;
        if (missingDetails) params.missingDetails = true;

        const response = await companyService.list(params);
        if (response.success && response.data && active) {
          setCompanies(response.data.list as Company[]);
          setTotal(response.data.total);
        }
      } catch {
        if (active) toast.error("Failed to retrieve companies list.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchList();
    return () => {
      active = false;
    };
  }, [
    page,
    limit,
    search,
    sortField,
    sortOrder,
    statusFilter,
    importedToday,
    importedThisWeek,
    hasEmail,
    hasWebsite,
    hasCareerPage,
    missingDetails,
    refreshKey,
  ]);

  // Handle search with simple debounce/trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (page === 1) {
      setRefreshKey((k) => k + 1);
    } else {
      setPage(1);
    }
  };

  // Toggle Sorting
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("DESC");
    }
    setPage(1);
  };

  // Row Select All
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(companies.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  // Row Select Toggle
  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  // Copy Email to Clipboard Helper
  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success("Email copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Single Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;
    setDeletingId(id);
    try {
      await companyService.remove(id);
      toast.success("Company deleted successfully.");
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to delete company.");
    } finally {
      setDeletingId(null);
    }
  };

  // Bulk Actions
  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete the ${selectedIds.length} selected companies?`,
      )
    )
      return;
    try {
      const response = await companyService.bulkDelete(selectedIds);
      toast.success(
        `Successfully deleted ${response.data?.count || selectedIds.length} companies.`,
      );
      setSelectedIds([]);
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to delete companies.");
    }
  };

  const handleBulkArchive = async () => {
    try {
      const response = await companyService.bulkArchive(selectedIds);
      toast.success(
        `Successfully archived ${response.data?.count || selectedIds.length} companies.`,
      );
      setSelectedIds([]);
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Failed to archive companies.");
    }
  };

  const handleBulkExport = () => {
    const selectedCompanies = companies.filter((c) =>
      selectedIds.includes(c.id),
    );
    if (selectedCompanies.length === 0) return;

    const headers = [
      "Company Name",
      "Email ID",
      "Mobile Number",
      "Career Page Link",
      "Website",
      "Linkedin",
      "Industry",
      "Employee Size",
      "Status",
      "Import Source",
      "Created At",
    ];

    const rows = selectedCompanies.map((c) => [
      c.companyName,
      c.email || "",
      c.phone || "",
      c.careerUrl || "",
      c.website || "",
      c.linkedin || "",
      c.industry || "",
      c.employeeSize || "",
      c.status,
      c.source,
      c.createdAt,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) =>
          e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `careerflow_companies_export_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(
      `Successfully exported ${selectedCompanies.length} companies to CSV.`,
    );
  };

  const handleGenerateDetails = async () => {
    try {
      const response = await companyService.generateDetails(selectedIds);
      toast.info(
        `Details Job Triggered! Job ID: ${response.data?.jobId || "N/A"}`,
      );
      setSelectedIds([]);
    } catch {
      toast.error("Failed to trigger enrichment process.");
    }
  };

  const resetFilters = () => {
    setImportedToday(false);
    setImportedThisWeek(false);
    setHasEmail(false);
    setHasWebsite(false);
    setHasCareerPage(false);
    setMissingDetails(false);
    setStatusFilter("active");
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col h-full p-6 space-y-6 relative select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="h-5 w-5 text-midnight-primary" />
            Company Directory
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            Import, filter, and manage corporate profiles in your career
            tracking ecosystem.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setActiveDialog("wizard")}
            className="cursor-pointer bg-midnight-primary hover:bg-[#4676E5] text-white text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-2 shadow-lg shadow-midnight-primary/10"
          >
            <Upload className="h-4 w-4" />
            Import Wizard
          </Button>
          <Button
            onClick={() => setActiveDialog("history")}
            variant="outline"
            className="cursor-pointer border-midnight-border hover:bg-midnight-card text-midnight-text text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            Import History
          </Button>
          <Button
            onClick={() => router.push("/companies/new")}
            variant="outline"
            className="cursor-pointer border-midnight-primary/30 hover:bg-midnight-primary/10 text-midnight-primary text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Company
          </Button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-midnight-muted" />
          <input
            type="text"
            placeholder="Search by company name, email, phone, website..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-midnight-surface border border-midnight-border rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-midnight-muted outline-none focus:border-midnight-primary focus:ring-1 focus:ring-midnight-primary transition-all"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto self-stretch">
          {/* Filters Toggle Button */}
          <div className="relative w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowFiltersMenu(!showFiltersMenu)}
              className={`w-full cursor-pointer border-midnight-border hover:bg-midnight-card text-xs rounded-xl flex items-center justify-center gap-2 ${
                importedToday ||
                importedThisWeek ||
                hasEmail ||
                hasWebsite ||
                hasCareerPage ||
                missingDetails ||
                statusFilter === "archived"
                  ? "border-midnight-primary text-midnight-primary bg-midnight-primary/5"
                  : ""
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters
              {(importedToday ||
                importedThisWeek ||
                hasEmail ||
                hasWebsite ||
                hasCareerPage ||
                missingDetails) && (
                <span className="h-2 w-2 rounded-full bg-midnight-primary" />
              )}
            </Button>

            {/* Filters Dropdown Menu */}
            <AnimatePresence>
              {showFiltersMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowFiltersMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 mt-2 w-64 bg-midnight-surface border border-midnight-border rounded-xl p-4 shadow-2xl z-20 space-y-4"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-midnight-border">
                      <span className="text-xs font-bold text-white">
                        Filter Companies
                      </span>
                      <button
                        onClick={resetFilters}
                        className="text-[10px] text-midnight-primary hover:underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-midnight-muted uppercase">
                        Status
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setStatusFilter("active")}
                          className={`flex-1 text-[10px] py-1 rounded border font-semibold ${
                            statusFilter === "active"
                              ? "bg-midnight-primary border-midnight-primary text-white"
                              : "border-midnight-border text-midnight-muted hover:bg-midnight-card"
                          }`}
                        >
                          Active Only
                        </button>
                        <button
                          onClick={() => setStatusFilter("archived")}
                          className={`flex-1 text-[10px] py-1 rounded border font-semibold ${
                            statusFilter === "archived"
                              ? "bg-midnight-primary border-midnight-primary text-white"
                              : "border-midnight-border text-midnight-muted hover:bg-midnight-card"
                          }`}
                        >
                          Archived
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <p className="text-[10px] font-bold text-midnight-muted uppercase">
                        Quick Filters
                      </p>

                      <label className="flex items-center gap-2.5 text-xs text-midnight-text cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={importedToday}
                          onChange={(e) => {
                            setImportedToday(e.target.checked);
                            if (e.target.checked) setImportedThisWeek(false);
                          }}
                          className="rounded border-midnight-border text-midnight-primary focus:ring-midnight-primary focus:ring-opacity-25"
                        />
                        Imported Today
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-midnight-text cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={importedThisWeek}
                          onChange={(e) => {
                            setImportedThisWeek(e.target.checked);
                            if (e.target.checked) setImportedToday(false);
                          }}
                          className="rounded border-midnight-border text-midnight-primary focus:ring-midnight-primary focus:ring-opacity-25"
                        />
                        Imported This Week
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-midnight-text cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasEmail}
                          onChange={(e) => setHasEmail(e.target.checked)}
                          className="rounded border-midnight-border text-midnight-primary focus:ring-midnight-primary focus:ring-opacity-25"
                        />
                        Has Email
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-midnight-text cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasWebsite}
                          onChange={(e) => setHasWebsite(e.target.checked)}
                          className="rounded border-midnight-border text-midnight-primary focus:ring-midnight-primary focus:ring-opacity-25"
                        />
                        Has Website
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-midnight-text cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hasCareerPage}
                          onChange={(e) => setHasCareerPage(e.target.checked)}
                          className="rounded border-midnight-border text-midnight-primary focus:ring-midnight-primary focus:ring-opacity-25"
                        />
                        Has Career Page
                      </label>

                      <label className="flex items-center gap-2.5 text-xs text-midnight-text cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={missingDetails}
                          onChange={(e) => setMissingDetails(e.target.checked)}
                          className="rounded border-midnight-border text-midnight-primary focus:ring-midnight-primary focus:ring-opacity-25"
                        />
                        Missing Details
                      </label>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Companies Table */}
      <div className="flex-1 min-h-[300px] bg-midnight-surface/20 border border-midnight-border rounded-xl overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-auto max-h-[500px]">
          <table className="w-full text-xs text-left border-collapse table-fixed">
            <thead className="sticky top-0 bg-midnight-card border-b border-midnight-border z-10">
              <tr className="text-white uppercase tracking-wider font-semibold text-[10px]">
                <th className="px-4 py-3.5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      companies.length > 0 &&
                      selectedIds.length === companies.length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-midnight-border text-midnight-primary focus:ring-midnight-primary focus:ring-opacity-25"
                  />
                </th>
                <th className="px-4 py-3.5 w-1/4">
                  <button
                    onClick={() => toggleSort("companyName")}
                    className="flex items-center gap-1 hover:text-midnight-primary cursor-pointer"
                  >
                    Company <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3.5 w-1/5">Email ID</th>
                <th className="px-4 py-3.5 w-32">Mobile Number</th>
                <th className="px-4 py-3.5 w-40">Career Page</th>
                <th className="px-4 py-3.5 w-40">Website</th>
                <th className="px-4 py-3.5 w-24 text-center">Status</th>
                <th className="px-4 py-3.5 w-32">
                  <button
                    onClick={() => toggleSort("createdAt")}
                    className="flex items-center gap-1 hover:text-midnight-primary cursor-pointer"
                  >
                    Imported Date <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-4 py-3.5 w-24 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton Rows
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-midnight-border">
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-4 mx-auto bg-midnight-card/50" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded bg-midnight-card/50" />
                        <div className="space-y-1.5 flex-1">
                          <Skeleton className="h-3 w-28 bg-midnight-card/50" />
                          <Skeleton className="h-2 w-16 bg-midnight-card/50" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-3 w-32 bg-midnight-card/50" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-3 w-20 bg-midnight-card/50" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-3 w-24 bg-midnight-card/50" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-3 w-24 bg-midnight-card/50" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-4 w-12 mx-auto rounded-full bg-midnight-card/50" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-3 w-20 bg-midnight-card/50" />
                    </td>
                    <td className="px-4 py-4">
                      <Skeleton className="h-6 w-16 ml-auto bg-midnight-card/50" />
                    </td>
                  </tr>
                ))
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-20">
                    <div className="flex flex-col items-center gap-3">
                      <Building2 className="h-10 w-10 text-midnight-muted" />
                      <p className="text-sm font-semibold text-white">
                        No companies found matching filters
                      </p>
                      <p className="text-xs text-midnight-muted">
                        Adjust your searches or quick-filters.
                      </p>
                      <Button
                        size="sm"
                        variant="link"
                        onClick={resetFilters}
                        className="text-xs text-midnight-primary cursor-pointer hover:underline"
                      >
                        Reset filters
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const isSelected = selectedIds.includes(company.id);
                  return (
                    <tr
                      key={company.id}
                      className={`border-b border-midnight-border hover:bg-midnight-card/25 transition-all ${
                        isSelected ? "bg-midnight-primary/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleSelectRow(company.id, e.target.checked)
                          }
                          className="rounded border-midnight-border text-midnight-primary focus:ring-midnight-primary focus:ring-opacity-25"
                        />
                      </td>

                      {/* Company Name & Metadata */}
                      <td className="px-4 py-3 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-midnight-card border border-midnight-border flex items-center justify-center shrink-0">
                            <Building2 className="h-4 w-4 text-midnight-primary" />
                          </div>
                          <div className="truncate min-w-0">
                            <p
                              className="font-semibold text-white truncate"
                              title={company.companyName}
                            >
                              {company.companyName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] text-midnight-muted">
                              {company.industry && (
                                <span
                                  className="truncate max-w-[80px]"
                                  title={company.industry}
                                >
                                  {company.industry}
                                </span>
                              )}
                              {company.industry && company.employeeSize && (
                                <span>•</span>
                              )}
                              {company.employeeSize && (
                                <span>{company.employeeSize} emps</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="px-4 py-3 truncate">
                        {company.email ? (
                          <div className="flex items-center gap-1.5 group/email justify-between pr-2">
                            <span
                              className="truncate text-midnight-text"
                              title={company.email}
                            >
                              {company.email}
                            </span>
                            <button
                              onClick={() =>
                                handleCopyEmail(company.email!, company.id)
                              }
                              className="opacity-0 group-hover/email:opacity-100 transition-opacity p-1 text-midnight-muted hover:text-white cursor-pointer"
                              title="Copy email"
                            >
                              {copiedId === company.id ? (
                                <Check className="h-3 w-3 text-midnight-success" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-midnight-muted font-normal italic">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Mobile Number */}
                      <td className="px-4 py-3 truncate">
                        {company.phone ? (
                          <span
                            className="text-midnight-text"
                            title={company.phone}
                          >
                            {company.phone}
                          </span>
                        ) : (
                          <span className="text-midnight-muted font-normal italic">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Career Page Link */}
                      <td className="px-4 py-3 truncate">
                        {company.careerUrl ? (
                          <a
                            href={company.careerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-midnight-primary hover:text-midnight-secondary hover:underline inline-flex items-center gap-1 max-w-full"
                          >
                            <Link className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {company.careerUrl.replace(/^https?:\/\//, "")}
                            </span>
                          </a>
                        ) : (
                          <span className="text-midnight-muted font-normal italic">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Website Link */}
                      <td className="px-4 py-3 truncate">
                        {company.website ? (
                          <a
                            href={company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-midnight-primary hover:text-midnight-secondary hover:underline inline-flex items-center gap-1 max-w-full"
                          >
                            <Globe className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                              {company.website.replace(/^https?:\/\//, "")}
                            </span>
                          </a>
                        ) : (
                          <span className="text-midnight-muted font-normal italic">
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            company.status === "active"
                              ? "bg-midnight-success/10 text-midnight-success border border-midnight-success/20"
                              : "bg-midnight-muted/10 text-midnight-muted border border-midnight-muted/20"
                          }`}
                        >
                          {company.status}
                        </span>
                      </td>

                      {/* Imported Date */}
                      <td className="px-4 py-3 text-midnight-muted font-mono text-[10px]">
                        {new Date(company.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() =>
                              router.push(`/companies/edit/${company.id}`)
                            }
                            className="p-1 text-midnight-muted hover:text-white rounded hover:bg-midnight-surface/50 cursor-pointer"
                            title="Edit Profile"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            disabled={deletingId === company.id}
                            className="p-1 text-midnight-muted hover:text-rose-400 rounded hover:bg-rose-500/10 cursor-pointer disabled:opacity-50"
                            title="Delete Company"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/companies/${company.id}`)
                            }
                            className="p-1 text-midnight-muted hover:text-midnight-secondary rounded hover:bg-midnight-surface/50 cursor-pointer"
                            title="Details"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        {companies.length > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-midnight-border bg-midnight-card/20 select-none">
            <span className="text-[10px] text-midnight-muted">
              Showing{" "}
              <span className="font-bold text-white">{companies.length}</span>{" "}
              of <span className="font-bold text-white">{total}</span> total
              companies
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer border-midnight-border hover:bg-midnight-card disabled:opacity-30"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </Button>
              <span className="text-[10px] font-bold text-white px-2">
                Page {page} of {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 cursor-pointer border-midnight-border hover:bg-midnight-card disabled:opacity-30"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-midnight-surface/90 backdrop-blur-md border border-midnight-border rounded-2xl px-6 py-3.5 flex items-center justify-between gap-6 shadow-2xl min-w-[500px]"
          >
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-midnight-primary/20 rounded-md flex items-center justify-center text-midnight-primary text-xs font-bold font-mono">
                {selectedIds.length}
              </div>
              <span className="text-xs text-white font-semibold">
                companies selected
              </span>
            </div>

            <div className="h-4 w-px bg-midnight-border" />

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleGenerateDetails}
                className="h-8 text-[11px] font-semibold text-midnight-primary hover:bg-midnight-primary/10 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-midnight-primary animate-pulse" />
                Generate Details
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleBulkExport}
                className="h-8 text-[11px] font-semibold text-midnight-secondary hover:bg-midnight-secondary/10 cursor-pointer flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export CSV
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleBulkArchive}
                className="h-8 text-[11px] font-semibold text-midnight-accent hover:bg-midnight-accent/10 cursor-pointer flex items-center gap-1.5"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleBulkDelete}
                className="h-8 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>

            <button
              onClick={() => setSelectedIds([])}
              className="text-midnight-muted hover:text-white p-1 rounded hover:bg-midnight-border transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Wizard Modal Dialog */}
      {activeDialog === "wizard" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ImportWizard
              onComplete={() => setRefreshKey((k) => k + 1)}
              onClose={() => setActiveDialog("none")}
            />
          </div>
        </div>
      )}

      {/* Import History Modal Dialog */}
      {activeDialog === "history" && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <ImportHistory />
              <button
                onClick={() => setActiveDialog("none")}
                className="absolute top-6 right-6 text-midnight-muted hover:text-white p-1 rounded-lg hover:bg-midnight-border transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
