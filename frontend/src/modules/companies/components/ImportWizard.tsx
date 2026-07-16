import { useState, useRef } from "react";
import { companyService } from "../services/companyService";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface ImportWizardProps {
  onComplete: () => void;
  onClose: () => void;
}

const STEPS = [
  { id: 1, name: "Upload File" },
  { id: 2, name: "Preview Data" },
  { id: 3, name: "Map Columns" },
  { id: 4, name: "Validation Review" },
  { id: 5, name: "Import Summary" },
];

const TARGET_FIELDS = [
  { key: "companyName", label: "Company Name", required: true },
  { key: "email", label: "Email ID", required: false },
  { key: "phone", label: "Mobile Number", required: false },
  { key: "careerUrl", label: "Career Page Link", required: false },
  { key: "website", label: "Website URL", required: false },
  { key: "linkedin", label: "LinkedIn URL", required: false },
  { key: "industry", label: "Industry", required: false },
  { key: "employeeSize", label: "Employee Size", required: false },
];

export function ImportWizard({ onComplete, onClose }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Parsed File Details
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, unknown>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [fileBase64, setFileBase64] = useState<string>("");

  // Column Mappings { [fileHeader]: [dbFieldName] }
  const [mappings, setMappings] = useState<Record<string, string>>({});

  // Summary Report from Backend
  const [report, setReport] = useState<{
    batchId: string;
    totalRows: number;
    importedRows: number;
    duplicateRows: number;
    failedRows: number;
    warnings: number;
    rowLogs: {
      rowNumber: number;
      companyName: string | null;
      status: string;
      reason: string | null;
    }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convert uploaded file to base64
  const handleFile = async (selectedFile: File) => {
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      toast.error(
        "Invalid file format. Please upload .xlsx, .xls, or .csv files only.",
      );
      return;
    }

    setFile(selectedFile);
    setProcessing(true);

    try {
      const base64 = await fileToBase64(selectedFile);
      setFileBase64(base64);

      // Call preview API
      const response = await companyService.previewImport(
        base64,
        selectedFile.name,
      );
      if (response.success && response.data) {
        setHeaders(response.data.headers);
        setPreviewRows(response.data.previewRows);
        setTotalRows(response.data.totalRows);

        // Step 3: Run Auto-mapping
        autoMapHeaders(response.data.headers);

        setCurrentStep(2);
      } else {
        throw new Error(response.message || "Failed to parse spreadsheet file");
      }
    } catch (err) {
      toast.error((err as Error).message || "Error reading file contents.");
      setFile(null);
    } finally {
      setProcessing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Automatically map typical headers
  const autoMapHeaders = (detectedHeaders: string[]) => {
    const initialMappings: Record<string, string> = {};

    const fieldSynonyms: Record<string, string[]> = {
      companyName: ["company name", "company", "organization", "firm", "name"],
      email: [
        "email id",
        "email_id",
        "email address",
        "email",
        "mail",
        "contact email",
      ],
      phone: [
        "mobile number",
        "mobile_number",
        "phone number",
        "phone",
        "mobile",
        "tel",
        "contact phone",
      ],
      careerUrl: [
        "career page link",
        "career page",
        "career url",
        "carrer page link",
        "career link",
        "carrer link",
      ],
      website: ["website", "domain", "url", "web", "site"],
      linkedin: ["linkedin", "linkedin url", "linkedin_url"],
      industry: ["industry", "sector", "vertical"],
      employeeSize: ["employee size", "employees", "size", "employee count"],
    };

    detectedHeaders.forEach((header) => {
      const normalizedHeader = header.trim().toLowerCase();

      // Find matching field
      const matchedField = Object.entries(fieldSynonyms).find(([, synonyms]) =>
        synonyms.includes(normalizedHeader),
      );

      if (matchedField) {
        initialMappings[header] = matchedField[0];
      } else {
        initialMappings[header] = ""; // Let user map manually
      }
    });

    setMappings(initialMappings);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = async () => {
    if (!file) return;

    // Verify companyName is mapped
    const isNameMapped = Object.values(mappings).includes("companyName");
    if (!isNameMapped) {
      toast.error(
        "You must map a source column to the required 'Company Name' field.",
      );
      return;
    }

    setProcessing(true);
    toast.loading("Processing import batch and detecting duplicates...", {
      id: "confirm-import",
    });

    try {
      const response = await companyService.confirmImport(
        fileBase64,
        file.name,
        mappings,
      );
      if (response.success && response.data) {
        setReport(response.data);
        toast.success("Spreadsheet import completed successfully!", {
          id: "confirm-import",
        });
        setCurrentStep(5);
        onComplete();
      } else {
        throw new Error(
          response.message || "Failed to finalize company import",
        );
      }
    } catch (err) {
      toast.error((err as Error).message || "Import process failed.", {
        id: "confirm-import",
      });
    } finally {
      setProcessing(false);
    }
  };

  // Perform client-side validations on preview data for feedback
  const getValidationIssues = (row: Record<string, unknown>) => {
    const issues: { field: string; type: "error" | "warning"; msg: string }[] =
      [];

    // Find header mapped to companyName
    const nameHeader = Object.keys(mappings).find(
      (k) => mappings[k] === "companyName",
    );
    const nameVal = nameHeader ? row[nameHeader] : null;
    if (!nameVal || String(nameVal).trim() === "") {
      issues.push({
        field: "Company Name",
        type: "error",
        msg: "Missing required company name",
      });
    }

    // Find email
    const emailHeader = Object.keys(mappings).find(
      (k) => mappings[k] === "email",
    );
    const emailVal = emailHeader ? row[emailHeader] : null;
    if (emailVal && String(emailVal).trim() !== "") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // Check if it's multiple emails
      const rawVal = String(emailVal).trim();
      const parts = rawVal.split(/[\/,|\s-_]+/);
      const invalidEmails = parts.filter(
        (p) =>
          p.trim() && !emailRegex.test(p.trim().replace(/^[-_]+|[-_]+$/g, "")),
      );
      if (invalidEmails.length > 0 && parts.length > 0) {
        issues.push({
          field: "Email",
          type: "error",
          msg: `Contains invalid email format: "${invalidEmails[0]}"`,
        });
      }
    }

    // Find website
    const webHeader = Object.keys(mappings).find(
      (k) => mappings[k] === "website",
    );
    const webVal = webHeader ? row[webHeader] : null;
    if (webVal && String(webVal).trim() !== "") {
      const val = String(webVal).trim();
      const testVal = /^https?:\/\//i.test(val) ? val : `https://${val}`;
      try {
        new URL(testVal);
      } catch {
        issues.push({
          field: "Website",
          type: "warning",
          msg: "Invalid website URL structure",
        });
      }
    }

    // Find careerUrl
    const careerHeader = Object.keys(mappings).find(
      (k) => mappings[k] === "careerUrl",
    );
    const careerVal = careerHeader ? row[careerHeader] : null;
    if (careerVal && String(careerVal).trim() !== "") {
      const val = String(careerVal).trim();
      const testVal = /^https?:\/\//i.test(val) ? val : `https://${val}`;
      try {
        new URL(testVal);
      } catch {
        issues.push({
          field: "Career Page",
          type: "warning",
          msg: "Invalid career URL structure",
        });
      }
    }

    return issues;
  };

  return (
    <div className="flex flex-col h-full bg-midnight-bg p-6 rounded-xl border border-midnight-border max-w-5xl mx-auto my-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-4 border-b border-midnight-border">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-midnight-primary animate-pulse" />
            Enterprise Import Wizard
          </h2>
          <p className="text-xs text-midnight-muted">
            Import bulk organizations using spreadsheet files (.xlsx, .xls,
            .csv)
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-midnight-muted hover:text-white p-1 rounded-lg hover:bg-midnight-border transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Tracker */}
      <div className="flex items-center justify-between py-6 px-2">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div
              key={step.id}
              className="flex flex-1 items-center last:flex-initial"
            >
              <div className="flex flex-col items-center gap-1.5 relative">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all ${
                    isCompleted
                      ? "bg-midnight-primary/20 border-midnight-primary text-midnight-primary"
                      : isActive
                        ? "bg-midnight-primary border-midnight-primary text-white shadow-[0_0_12px_rgba(90,141,255,0.4)]"
                        : "bg-midnight-surface border-midnight-border text-midnight-muted"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={`text-[10px] whitespace-nowrap font-medium ${
                    isActive ? "text-white font-bold" : "text-midnight-muted"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${
                    isCompleted ? "bg-midnight-primary" : "bg-midnight-border"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Wizard Step Body */}
      <div className="flex-1 overflow-y-auto min-h-[300px] border border-midnight-border bg-midnight-surface/20 rounded-xl p-6 relative">
        <AnimatePresence mode="wait">
          {processing && (
            <div className="absolute inset-0 bg-midnight-bg/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-4">
              <RefreshCw className="h-10 w-10 text-midnight-primary animate-spin" />
              <p className="text-sm font-semibold text-white">
                Analyzing spreadsheet data, please wait...
              </p>
            </div>
          )}
        </AnimatePresence>

        {/* STEP 1: Upload File */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center h-full min-h-[260px]"
          >
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full max-w-xl p-10 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 ${
                dragActive
                  ? "border-midnight-primary bg-midnight-primary/5"
                  : "border-midnight-border hover:border-midnight-primary hover:bg-midnight-surface/40"
              }`}
            >
              <Upload className="h-12 w-12 text-midnight-primary" />
              <div className="text-center">
                <p className="text-sm font-medium text-white">
                  Drag & drop your file here, or click to browse
                </p>
                <p className="text-xs text-midnight-muted mt-1">
                  Supports CSV, XLSX, XLS formats only
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
            </div>
          </motion.div>
        )}

        {/* STEP 2: Preview Rows */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full gap-4"
          >
            <div className="flex justify-between items-center bg-midnight-surface/40 p-3 rounded-lg border border-midnight-border">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-midnight-secondary" />
                <div>
                  <p className="text-xs font-semibold text-white">
                    {file?.name}
                  </p>
                  <p className="text-[10px] text-midnight-muted">
                    Detected {headers.length} columns • Total {totalRows}{" "}
                    records found.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="text-xs cursor-pointer border-midnight-border hover:bg-midnight-card"
                onClick={() => setCurrentStep(1)}
              >
                Change File
              </Button>
            </div>

            <p className="text-xs text-midnight-muted">
              Displaying preview of the first 20 records:
            </p>
            <div className="overflow-x-auto border border-midnight-border rounded-lg max-h-[220px]">
              <table className="w-full text-[11px] text-left border-collapse bg-midnight-surface/10">
                <thead>
                  <tr className="bg-midnight-surface border-b border-midnight-border text-white uppercase tracking-wider font-semibold">
                    <th className="px-4 py-2 text-midnight-muted">Row</th>
                    {headers.map((h, i) => (
                      <th key={i} className="px-4 py-2 min-w-[120px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className="border-b border-midnight-border hover:bg-midnight-card/45 transition-colors"
                    >
                      <td className="px-4 py-1.5 font-bold text-midnight-muted">
                        {rowIdx + 2}
                      </td>
                      {headers.map((h, colIdx) => (
                        <td
                          key={colIdx}
                          className="px-4 py-1.5 text-midnight-text truncate max-w-[200px]"
                        >
                          {row[h] !== undefined && row[h] !== null
                            ? String(row[h])
                            : ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-midnight-border">
              <Button
                variant="outline"
                className="cursor-pointer border-midnight-border text-xs"
                onClick={() => setCurrentStep(1)}
              >
                Back
              </Button>
              <Button
                className="cursor-pointer bg-midnight-primary hover:bg-midnight-primary/95 text-xs text-white"
                onClick={() => setCurrentStep(3)}
              >
                Map Columns <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Column Mapping */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full gap-4"
          >
            <div className="p-3 bg-midnight-primary/10 border border-midnight-primary/30 rounded-lg">
              <p className="text-xs text-white leading-relaxed">
                <span className="font-bold text-midnight-primary">
                  Column Mapping:
                </span>{" "}
                Map detected headers in your file to standard CareerFlow fields.
                We auto-detected matches, but you can override them manually.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[250px] overflow-y-auto pr-2">
              {headers.map((header) => {
                const currentVal = mappings[header] || "";
                return (
                  <div
                    key={header}
                    className="flex flex-col gap-1.5 p-3 rounded-lg border border-midnight-border bg-midnight-surface/20"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                        {header}
                      </span>
                      <span className="text-[10px] text-midnight-muted font-mono">
                        Mapped To:
                      </span>
                    </div>
                    <select
                      value={currentVal}
                      onChange={(e) =>
                        setMappings({ ...mappings, [header]: e.target.value })
                      }
                      className="w-full bg-midnight-surface border border-midnight-border rounded-lg text-xs p-2 text-white outline-none cursor-pointer focus:border-midnight-primary focus:ring-1 focus:ring-midnight-primary transition-all"
                    >
                      <option value="">-- [Ignore Column] --</option>
                      {TARGET_FIELDS.map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.label} {f.required ? "*(Required)" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-midnight-border">
              <Button
                variant="outline"
                className="cursor-pointer border-midnight-border text-xs"
                onClick={() => setCurrentStep(2)}
              >
                Back
              </Button>
              <Button
                className="cursor-pointer bg-midnight-primary hover:bg-midnight-primary/95 text-xs text-white"
                onClick={() => {
                  const hasNameMap =
                    Object.values(mappings).includes("companyName");
                  if (!hasNameMap) {
                    toast.error(
                      "You must map at least one column to 'Company Name'.",
                    );
                    return;
                  }
                  setCurrentStep(4);
                }}
              >
                Review Validations <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Live Preview Validation */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col h-full gap-4"
          >
            <div className="p-3 bg-midnight-surface/30 border border-midnight-border rounded-lg">
              <p className="text-xs text-midnight-muted">
                Validation dry-run over the first 20 records. Columns will be
                cleaned and normalized before database insertions.
              </p>
            </div>

            <div className="overflow-y-auto max-h-[220px] border border-midnight-border rounded-lg">
              <div className="space-y-2 p-2">
                {previewRows.map((row, idx) => {
                  const issues = getValidationIssues(row);
                  const isOk = issues.length === 0;
                  const nameHeader = Object.keys(mappings).find(
                    (k) => mappings[k] === "companyName",
                  );
                  const nameVal =
                    nameHeader && row[nameHeader]
                      ? String(row[nameHeader])
                      : "Row " + (idx + 2);

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col gap-1.5 p-3 rounded-lg border text-xs ${
                        isOk
                          ? "border-midnight-success/20 bg-midnight-success/5"
                          : issues.some((i) => i.type === "error")
                            ? "border-midnight-danger/20 bg-midnight-danger/5"
                            : "border-midnight-accent/20 bg-midnight-accent/5"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{nameVal}</span>
                        <div className="flex items-center gap-1.5 font-semibold text-[10px]">
                          {isOk ? (
                            <span className="text-midnight-success flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Valid
                            </span>
                          ) : (
                            <span
                              className={
                                issues.some((i) => i.type === "error")
                                  ? "text-midnight-danger"
                                  : "text-midnight-accent"
                              }
                            >
                              {issues.length}{" "}
                              {issues.length === 1 ? "Issue" : "Issues"} Found
                            </span>
                          )}
                        </div>
                      </div>

                      {issues.length > 0 && (
                        <div className="space-y-1 mt-1 pl-4 border-l border-midnight-border">
                          {issues.map((issue, issueIdx) => (
                            <div
                              key={issueIdx}
                              className="flex items-start gap-1 text-[10px]"
                            >
                              {issue.type === "error" ? (
                                <AlertCircle className="h-3 w-3 text-midnight-danger shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-midnight-accent shrink-0 mt-0.5" />
                              )}
                              <span className="text-midnight-muted">
                                <span className="text-white font-medium">
                                  {issue.field}
                                </span>
                                : {issue.msg}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-midnight-border">
              <Button
                variant="outline"
                className="cursor-pointer border-midnight-border text-xs"
                onClick={() => setCurrentStep(3)}
              >
                Back
              </Button>
              <Button
                className="cursor-pointer bg-midnight-primary hover:bg-midnight-primary/95 text-xs text-white"
                onClick={handleConfirmImport}
              >
                Confirm Import & Check Duplicates{" "}
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 5: Final Import Summary */}
        {currentStep === 5 && report && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col h-full gap-4"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-midnight-border">
              <CheckCircle2 className="h-8 w-8 text-midnight-success" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Spreadsheet Import Completed!
                </h3>
                <p className="text-xs text-midnight-muted">
                  Batch ID: {report.batchId}
                </p>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="bg-midnight-surface/50 border border-midnight-border rounded-lg p-3 text-center">
                <p className="text-[10px] text-midnight-muted font-bold uppercase">
                  Total Rows
                </p>
                <p className="text-lg font-extrabold text-white mt-1">
                  {report.totalRows}
                </p>
              </div>
              <div className="bg-midnight-success/15 border border-midnight-success/20 rounded-lg p-3 text-center">
                <p className="text-[10px] text-midnight-success font-bold uppercase">
                  Imported
                </p>
                <p className="text-lg font-extrabold text-midnight-success mt-1">
                  {report.importedRows}
                </p>
              </div>
              <div className="bg-midnight-accent/15 border border-midnight-accent/20 rounded-lg p-3 text-center">
                <p className="text-[10px] text-midnight-accent font-bold uppercase">
                  Duplicates
                </p>
                <p className="text-lg font-extrabold text-midnight-accent mt-1">
                  {report.duplicateRows}
                </p>
              </div>
              <div className="bg-midnight-danger/15 border border-midnight-danger/20 rounded-lg p-3 text-center">
                <p className="text-[10px] text-midnight-danger font-bold uppercase">
                  Failed
                </p>
                <p className="text-lg font-extrabold text-midnight-danger mt-1">
                  {report.failedRows}
                </p>
              </div>
              <div className="bg-midnight-surface/50 border border-midnight-border rounded-lg p-3 text-center">
                <p className="text-[10px] text-midnight-muted font-bold uppercase">
                  Warnings
                </p>
                <p className="text-lg font-extrabold text-white mt-1">
                  {report.warnings}
                </p>
              </div>
            </div>

            {/* Outcome row logs (duplicates/failures) */}
            {report.rowLogs.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-midnight-accent" />
                  Detailed Row Outcomes Log ({report.rowLogs.length} issues)
                </p>
                <div className="max-h-[160px] overflow-y-auto border border-midnight-border rounded-lg text-[10px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-midnight-surface text-white border-b border-midnight-border uppercase font-semibold">
                        <th className="px-3 py-1.5">Row</th>
                        <th className="px-3 py-1.5">Company</th>
                        <th className="px-3 py-1.5">Status</th>
                        <th className="px-3 py-1.5">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.rowLogs.map((log, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-midnight-border hover:bg-midnight-card/30"
                        >
                          <td className="px-3 py-1.5 text-midnight-muted">
                            {log.rowNumber}
                          </td>
                          <td className="px-3 py-1.5 font-bold text-white truncate max-w-[120px]">
                            {log.companyName}
                          </td>
                          <td className="px-3 py-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold uppercase text-[8px] ${
                                log.status === "duplicate"
                                  ? "bg-midnight-accent/20 text-midnight-accent"
                                  : "bg-midnight-danger/20 text-midnight-danger"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 text-midnight-text italic">
                            {log.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-midnight-border">
              <Button
                className="cursor-pointer bg-midnight-primary hover:bg-midnight-primary/95 text-xs text-white"
                onClick={() => {
                  onClose();
                  onComplete();
                }}
              >
                Close Wizard
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
