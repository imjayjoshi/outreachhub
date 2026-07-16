import { ExcelParser, ParsedSheet } from "./excel.parser.js";
import { ExcelMapper } from "./excel.mapper.js";
import { ExcelValidator, RowValidationResult } from "./excel.validator.js";
import { DuplicateService } from "./duplicate.service.js";
import { ImportRepository } from "./import.repository.js";
import { Company } from "../company/company.entity.js";
import { ImportBatch } from "../company/import-batch.entity.js";
import { ImportBatchRow } from "../company/import-batch-row.entity.js";

export interface ImportPreviewResponse {
  headers: string[];
  previewRows: Record<string, any>[];
  totalRows: number;
}

export interface ImportConfirmResponse {
  totalRows: number;
  importedRows: number;
  duplicateRows: number;
  failedRows: number;
  warnings: number;
  batchId: string;
  rowLogs: {
    rowNumber: number;
    companyName: string | null;
    status: string;
    reason: string | null;
  }[];
}

export class ExcelService {
  /**
   * Generates a preview of the uploaded spreadsheet (first 20 rows).
   */
  public static preview(base64Data: string): ImportPreviewResponse {
    const { headers, rows, totalRows } = ExcelParser.parse(base64Data);

    return {
      headers,
      previewRows: rows.slice(0, 20),
      totalRows,
    };
  }

  /**
   * Performs the full validation, duplicate checking, and database transaction save.
   */
  public static async confirm(
    userId: string,
    filename: string,
    base64Data: string,
    mappings: Record<string, string>,
  ): Promise<ImportConfirmResponse> {
    const { nanoid } = await import("nanoid");
    const startedAt = new Date();
    const batchId = nanoid();

    // 1. Parse spreadsheet
    const { rows, totalRows } = ExcelParser.parse(base64Data);

    // 2. Map raw rows to entity field names
    const mappedRows = ExcelMapper.map(rows, mappings);

    // 3. Prepare lookups for duplicate check
    const lookupMaps = await DuplicateService.prepareLookupMaps(userId);

    // Accumulators
    const companiesToInsert: Company[] = [];
    const rowLogs: ImportBatchRow[] = [];
    let importedCount = 0;
    let duplicateCount = 0;
    let failedCount = 0;
    let warningCount = 0;

    // 4. Process and validate row by row
    for (let i = 0; i < mappedRows.length; i++) {
      const rowData = mappedRows[i];
      const rowNumber = i + 2; // Offset for header row in spreadsheet

      // 4.1 Validate Company fields
      const validation: RowValidationResult = ExcelValidator.validateRow(
        rowData,
        rowNumber,
      );

      if (validation.warnings.length > 0) {
        warningCount += validation.warnings.length;
      }

      if (!validation.isValid) {
        failedCount++;
        const log = new ImportBatchRow();
        log.id = nanoid();
        log.batchId = batchId;
        log.rowNumber = rowNumber;
        log.companyName = rowData.companyName || "Unknown Name";
        log.status = "failed";
        log.reason = validation.errors.join("; ");
        rowLogs.push(log);
        continue;
      }

      // 4.2 Check for duplicates
      const dupCheck = DuplicateService.checkDuplicate(
        validation.data,
        lookupMaps,
      );
      if (dupCheck.isDuplicate) {
        duplicateCount++;
        const log = new ImportBatchRow();
        log.id = nanoid();
        log.batchId = batchId;
        log.rowNumber = rowNumber;
        log.companyName = validation.data.companyName;
        log.status = "duplicate";
        log.reason = dupCheck.reason || "Duplicate found";
        rowLogs.push(log);
        continue;
      }

      // 4.3 Clean data is valid, build Company entity
      const company = new Company();
      company.id = nanoid();
      company.companyName = validation.data.companyName;
      company.email = validation.data.email;
      company.phone = validation.data.phone;
      company.careerUrl = validation.data.careerUrl;
      company.website = validation.data.website;
      company.linkedin = validation.data.linkedin;
      company.industry = validation.data.industry;
      company.description = validation.data.description;
      company.city = validation.data.city;
      company.state = validation.data.state;
      company.country = validation.data.country;
      company.employeeSize = validation.data.employeeSize;
      company.status = "active";
      company.source = filename.endsWith(".csv") ? "CSV" : "Excel";
      company.importBatchId = batchId;
      company.createdBy = userId;
      company.createdAt = new Date();
      company.updatedAt = new Date();

      companiesToInsert.push(company);
      importedCount++;

      // Optimistically add the new company elements to maps to prevent duplicates within the SAME import file!
      const nameKey = company.companyName.trim().toLowerCase();
      if (nameKey) {
        lookupMaps.nameMap.set(nameKey, company);
      }
      if (company.website) {
        const domain = company.website
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .split("/")[0]
          .toLowerCase();
        if (domain) lookupMaps.websiteMap.set(domain, company);
      }
      if (company.careerUrl) {
        const domain = company.careerUrl
          .replace(/^https?:\/\//, "")
          .replace(/^www\./, "")
          .split("/")[0]
          .toLowerCase();
        if (domain) lookupMaps.careerUrlMap.set(domain, company);
      }
      if (company.email) {
        const emails = company.email
          .toLowerCase()
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);
        for (const email of emails) {
          lookupMaps.emailMap.set(email, company);
        }
      }
    }

    // 5. Build the batch entity
    const batch = new ImportBatch();
    batch.id = batchId;
    batch.filename = filename;
    batch.totalRows = totalRows;
    batch.importedRows = importedCount;
    batch.duplicateRows = duplicateCount;
    batch.failedRows = failedCount;
    batch.uploadedBy = userId;
    batch.startedAt = startedAt;
    batch.completedAt = new Date();
    batch.status = "completed";

    // 6. Save transactional log records and companies
    await ImportRepository.saveBatchAndRecords(
      batch,
      rowLogs,
      companiesToInsert,
    );

    return {
      totalRows,
      importedRows: importedCount,
      duplicateRows: duplicateCount,
      failedRows: failedCount,
      warnings: warningCount,
      batchId,
      rowLogs: rowLogs.map((log) => ({
        rowNumber: log.rowNumber,
        companyName: log.companyName,
        status: log.status,
        reason: log.reason,
      })),
    };
  }
}
