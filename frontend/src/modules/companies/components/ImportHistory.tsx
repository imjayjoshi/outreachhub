import { useState, useEffect } from "react";
import { companyService } from "../services/companyService";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Calendar,
  Layers,
  ChevronRight,
  AlertTriangle,
  X,
  History,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface ImportBatch {
  id: string;
  filename: string;
  totalRows: number;
  importedRows: number;
  duplicateRows: number;
  failedRows: number;
  uploadedBy: string;
  startedAt: string;
  completedAt: string | null;
  status: string;
  rows?: ImportBatchRowLog[];
}

interface ImportBatchRowLog {
  id: string;
  batchId: string;
  rowNumber: number;
  companyName: string | null;
  status: string;
  reason: string | null;
}

export function ImportHistory() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Batch Details Modal
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await companyService.getImportHistory();
      if (response.success && response.data) {
        setBatches(response.data);
      }
    } catch {
      toast.error("Failed to load import history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await companyService.getImportHistory();
        if (response.success && response.data && active) {
          setBatches(response.data);
        }
      } catch {
        if (active) toast.error("Failed to load import history.");
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleViewDetails = async (batch: ImportBatch) => {
    setSelectedBatch(batch);
    setLoadingDetails(true);
    try {
      const response = await companyService.getImportBatchDetails(batch.id);
      if (response.success && response.data) {
        setSelectedBatch(response.data);
      }
    } catch {
      toast.error("Failed to retrieve import batch logs.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return (
        d.toLocaleDateString() +
        " " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col h-full bg-midnight-surface/10 rounded-xl border border-midnight-border p-6 shadow-xl relative">
      <div className="flex items-center justify-between pb-4 border-b border-midnight-border">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <History className="h-4 w-4 text-midnight-primary" />
          Spreadsheet Import History
        </h3>
        <Button
          size="sm"
          variant="outline"
          className="text-xs cursor-pointer border-midnight-border hover:bg-midnight-card"
          onClick={fetchHistory}
        >
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-midnight-primary animate-spin" />
          <p className="text-xs text-midnight-muted">
            Loading import history logs...
          </p>
        </div>
      ) : batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
          <FileSpreadsheet className="h-10 w-10 text-midnight-muted" />
          <p className="text-sm text-white font-medium">
            No import history found
          </p>
          <p className="text-xs text-midnight-muted">
            Upload spreadsheets in the Import Wizard to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-4 border border-midnight-border rounded-lg max-h-[400px]">
          <table className="w-full text-xs text-left border-collapse bg-midnight-surface/5">
            <thead>
              <tr className="bg-midnight-surface text-white border-b border-midnight-border font-semibold uppercase tracking-wider">
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Import Date</th>
                <th className="px-4 py-3 text-center">Total Rows</th>
                <th className="px-4 py-3 text-center">Success</th>
                <th className="px-4 py-3 text-center">Duplicates</th>
                <th className="px-4 py-3 text-center">Failed</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr
                  key={batch.id}
                  className="border-b border-midnight-border hover:bg-midnight-card/25 transition-colors"
                >
                  <td
                    className="px-4 py-3 font-semibold text-white truncate max-w-[200px]"
                    title={batch.filename}
                  >
                    {batch.filename}
                  </td>
                  <td className="px-4 py-3 text-midnight-muted flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(batch.startedAt)}
                  </td>
                  <td className="px-4 py-3 text-center font-semibold text-white">
                    {batch.totalRows}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-midnight-success">
                    {batch.importedRows}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-midnight-accent">
                    {batch.duplicateRows}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-midnight-danger">
                    {batch.failedRows}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded font-bold uppercase text-[9px] bg-midnight-success/20 text-midnight-success">
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[10px] cursor-pointer hover:bg-midnight-card"
                      onClick={() => handleViewDetails(batch)}
                    >
                      View Logs <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Batch Logs Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-midnight-bg border border-midnight-border rounded-xl shadow-2xl p-6 max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start pb-3 border-b border-midnight-border">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="h-4 w-4 text-midnight-primary" />
                  Import Details: {selectedBatch.filename}
                </h4>
                <p className="text-[10px] text-midnight-muted mt-0.5">
                  Uploaded at {formatDate(selectedBatch.startedAt)} • ID:{" "}
                  {selectedBatch.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-midnight-muted hover:text-white p-1 hover:bg-midnight-border rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Counts grid */}
            <div className="grid grid-cols-4 gap-2.5 my-4">
              <div className="bg-midnight-surface/50 border border-midnight-border rounded-lg p-2.5 text-center">
                <p className="text-[9px] text-midnight-muted font-bold uppercase">
                  Total Rows
                </p>
                <p className="text-base font-extrabold text-white mt-0.5">
                  {selectedBatch.totalRows}
                </p>
              </div>
              <div className="bg-midnight-success/15 border border-midnight-success/20 rounded-lg p-2.5 text-center">
                <p className="text-[9px] text-midnight-success font-bold uppercase">
                  Imported
                </p>
                <p className="text-base font-extrabold text-midnight-success mt-0.5">
                  {selectedBatch.importedRows}
                </p>
              </div>
              <div className="bg-midnight-accent/15 border border-midnight-accent/20 rounded-lg p-2.5 text-center">
                <p className="text-[9px] text-midnight-accent font-bold uppercase">
                  Duplicates
                </p>
                <p className="text-base font-extrabold text-midnight-accent mt-0.5">
                  {selectedBatch.duplicateRows}
                </p>
              </div>
              <div className="bg-midnight-danger/15 border border-midnight-danger/20 rounded-lg p-2.5 text-center">
                <p className="text-[9px] text-midnight-danger font-bold uppercase">
                  Failed
                </p>
                <p className="text-base font-extrabold text-midnight-danger mt-0.5">
                  {selectedBatch.failedRows}
                </p>
              </div>
            </div>

            {/* List of row errors/duplicates */}
            <div className="flex-1 overflow-y-auto min-h-[150px]">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <Loader2 className="h-6 w-6 text-midnight-primary animate-spin" />
                  <p className="text-[10px] text-midnight-muted">
                    Loading row outcome logs...
                  </p>
                </div>
              ) : !selectedBatch.rows || selectedBatch.rows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-8 w-8 text-midnight-success" />
                  <p className="text-xs text-white font-semibold mt-2">
                    Perfect Import Run!
                  </p>
                  <p className="text-[10px] text-midnight-muted">
                    No rows failed or were marked as duplicates.
                  </p>
                </div>
              ) : (
                <div className="border border-midnight-border rounded-lg overflow-x-auto text-[10px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-midnight-surface text-white border-b border-midnight-border font-semibold uppercase">
                        <th className="px-3 py-2">Row</th>
                        <th className="px-3 py-2">Company Name</th>
                        <th className="px-3 py-2">Outcome</th>
                        <th className="px-3 py-2">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBatch.rows.map((rowLog) => (
                        <tr
                          key={rowLog.id}
                          className="border-b border-midnight-border hover:bg-midnight-card/30"
                        >
                          <td className="px-3 py-2 text-midnight-muted">
                            {rowLog.rowNumber}
                          </td>
                          <td className="px-3 py-2 font-bold text-white">
                            {rowLog.companyName || "Unknown"}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold uppercase text-[7px] ${
                                rowLog.status === "duplicate"
                                  ? "bg-midnight-accent/20 text-midnight-accent"
                                  : "bg-midnight-danger/20 text-midnight-danger"
                              }`}
                            >
                              {rowLog.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-midnight-text italic flex items-start gap-1">
                            <AlertTriangle className="h-3 w-3 text-midnight-accent shrink-0 mt-0.5" />
                            {rowLog.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-midnight-border">
              <Button
                className="cursor-pointer bg-midnight-primary hover:bg-midnight-primary/95 text-xs text-white"
                onClick={() => setSelectedBatch(null)}
              >
                Close Logs
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
