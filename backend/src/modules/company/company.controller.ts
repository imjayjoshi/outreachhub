import { Response } from "express";
import { AuthenticatedRequest } from "@/middleware/auth.js";
import { CompanyService } from "./company.service.js";
import { ExcelService } from "../import/excel.service.js";
import { ApiResponse } from "../shared/utils/apiResponse.js";
import { Logger } from "../shared/utils/logger.js";
import { CompanyListQuery } from "./company.dto.js";

export class CompanyController {
  private service = new CompanyService();

  /**
   * GET /api/company
   * List companies with pagination, searching, and filters.
   */
  public list = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const query = req.query as unknown as CompanyListQuery;

      const { list, total } = await this.service.listCompanies(userId, {
        page: query.page || 1,
        limit: query.limit || 10,
        search: query.search,
        sortField: query.sortField,
        sortOrder: query.sortOrder,
        filters: {
          importedToday: query.importedToday,
          importedThisWeek: query.importedThisWeek,
          hasEmail: query.hasEmail,
          hasWebsite: query.hasWebsite,
          hasCareerPage: query.hasCareerPage,
          missingDetails: query.missingDetails,
          status: query.status,
        },
      });

      return ApiResponse.success(
        res,
        "Companies list retrieved successfully.",
        {
          list,
          total,
          page: query.page || 1,
          limit: query.limit || 10,
        },
      );
    } catch (err) {
      Logger.error("[CompanyController.list] Error listing companies:", err);
      return ApiResponse.failure(
        res,
        "Failed to retrieve companies list.",
        err,
      );
    }
  };

  /**
   * GET /api/company/:id
   * Get single company details.
   */
  public get = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id;

      const company = await this.service.getCompanyById(id, userId);
      if (!company) {
        return ApiResponse.failure(res, "Company not found.", null, 404);
      }

      return ApiResponse.success(
        res,
        "Company details retrieved successfully.",
        company,
      );
    } catch (err) {
      Logger.error(
        "[CompanyController.get] Error fetching company details:",
        err,
      );
      return ApiResponse.failure(
        res,
        "Failed to retrieve company details.",
        err,
      );
    }
  };

  /**
   * POST /api/company
   * Create a company manually.
   */
  public create = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const company = await this.service.createCompany(userId, req.body);

      Logger.info(
        `[CompanyController.create] Created manual company: ${company.companyName} (ID: ${company.id})`,
      );
      return ApiResponse.success(
        res,
        "Company created successfully.",
        company,
        201,
      );
    } catch (err) {
      Logger.error("[CompanyController.create] Error creating company:", err);
      return ApiResponse.failure(res, "Failed to create company.", err);
    }
  };

  /**
   * PUT /api/company/:id
   * Update company details.
   */
  public update = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id;

      const updated = await this.service.updateCompany(id, userId, req.body);
      if (!updated) {
        return ApiResponse.failure(
          res,
          "Company not found or unauthorized.",
          null,
          404,
        );
      }

      Logger.info(
        `[CompanyController.update] Updated company: ${updated.companyName} (ID: ${id})`,
      );
      return ApiResponse.success(res, "Company updated successfully.", updated);
    } catch (err) {
      Logger.error("[CompanyController.update] Error updating company:", err);
      return ApiResponse.failure(res, "Failed to update company.", err);
    }
  };

  /**
   * DELETE /api/company/:id
   * Soft delete a company.
   */
  public delete = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const id = req.params.id;

      const success = await this.service.deleteCompany(id, userId);
      if (!success) {
        return ApiResponse.failure(
          res,
          "Company not found or unauthorized.",
          null,
          404,
        );
      }

      Logger.info(`[CompanyController.delete] Soft-deleted company: ${id}`);
      return ApiResponse.success(res, "Company deleted successfully.", { id });
    } catch (err) {
      Logger.error("[CompanyController.delete] Error deleting company:", err);
      return ApiResponse.failure(res, "Failed to delete company.", err);
    }
  };

  /**
   * POST /api/company/bulk-delete
   * Bulk soft delete companies.
   */
  public bulkDelete = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { ids } = req.body;

      const count = await this.service.bulkDeleteCompanies(ids, userId);

      Logger.info(
        `[CompanyController.bulkDelete] Bulk soft-deleted ${count} companies for user ${userId}`,
      );
      return ApiResponse.success(
        res,
        `Successfully deleted ${count} companies.`,
        { count },
      );
    } catch (err) {
      Logger.error(
        "[CompanyController.bulkDelete] Error bulk-deleting companies:",
        err,
      );
      return ApiResponse.failure(res, "Failed to bulk delete companies.", err);
    }
  };

  /**
   * POST /api/company/bulk-archive
   * Bulk archive companies.
   */
  public bulkArchive = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { ids } = req.body;

      const count = await this.service.bulkArchiveCompanies(ids, userId);

      Logger.info(
        `[CompanyController.bulkArchive] Bulk archived ${count} companies for user ${userId}`,
      );
      return ApiResponse.success(
        res,
        `Successfully archived ${count} companies.`,
        { count },
      );
    } catch (err) {
      Logger.error(
        "[CompanyController.bulkArchive] Error bulk-archiving companies:",
        err,
      );
      return ApiResponse.failure(res, "Failed to bulk archive companies.", err);
    }
  };

  /**
   * POST /api/company/generate-details
   * Placeholder to trigger enrichment details.
   */
  public generateDetails = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { ids } = req.body;

      const jobId = await this.service.generateDetails(ids, userId);

      return ApiResponse.success(
        res,
        "Enrichment detail job enqueued successfully.",
        { jobId },
      );
    } catch (err) {
      Logger.error(
        "[CompanyController.generateDetails] Error enqueuing enrichment details:",
        err,
      );
      return ApiResponse.failure(
        res,
        "Failed to queue details generation.",
        err,
      );
    }
  };

  /**
   * POST /api/company/import/preview
   * Spreadsheet upload preview.
   */
  public previewImport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { fileData } = req.body;

      const preview = ExcelService.preview(fileData);

      return ApiResponse.success(
        res,
        "Spreadsheet preview generated successfully.",
        preview,
      );
    } catch (err) {
      Logger.error(
        "[CompanyController.previewImport] Error parsing spreadsheet preview:",
        err,
      );
      return ApiResponse.failure(
        res,
        `Failed to parse upload preview: ${(err as Error).message}`,
        err,
      );
    }
  };

  /**
   * POST /api/company/import/confirm
   * Final confirmed import.
   */
  public confirmImport = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;
      const { fileData, filename, mappings } = req.body;

      const result = await ExcelService.confirm(
        userId,
        filename,
        fileData,
        mappings,
      );

      Logger.info(
        `[CompanyController.confirmImport] Batch ${result.batchId} processed: ${result.importedRows} imported, ${result.duplicateRows} duplicate, ${result.failedRows} failed.`,
      );
      return ApiResponse.success(res, "Spreadsheet import completed.", result);
    } catch (err) {
      Logger.error(
        "[CompanyController.confirmImport] Error confirming import batch:",
        err,
      );
      return ApiResponse.failure(
        res,
        `Failed to finalize spreadsheet import: ${(err as Error).message}`,
        err,
      );
    }
  };

  /**
   * GET /api/company/import/history
   * Retrieve list of past import batches.
   */
  public getImportHistory = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user!.id;
      const batches = await this.service.getImportBatches(userId);

      return ApiResponse.success(
        res,
        "Import history batches retrieved successfully.",
        batches,
      );
    } catch (err) {
      Logger.error(
        "[CompanyController.getImportHistory] Error retrieving import history:",
        err,
      );
      return ApiResponse.failure(
        res,
        "Failed to retrieve import batches.",
        err,
      );
    }
  };

  /**
   * GET /api/company/import/history/:batchId
   * Retrieve details and logs of a specific batch.
   */
  public getImportBatchDetails = async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.user!.id;
      const batchId = req.params.batchId;

      const batch = await this.service.getImportBatchDetails(batchId, userId);
      if (!batch) {
        return ApiResponse.failure(
          res,
          "Import batch record not found.",
          null,
          404,
        );
      }

      return ApiResponse.success(
        res,
        "Import batch details retrieved successfully.",
        batch,
      );
    } catch (err) {
      Logger.error(
        "[CompanyController.getImportBatchDetails] Error retrieving batch details:",
        err,
      );
      return ApiResponse.failure(
        res,
        "Failed to retrieve import batch details.",
        err,
      );
    }
  };
}
