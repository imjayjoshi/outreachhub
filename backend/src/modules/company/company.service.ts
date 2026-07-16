import { CompanyRepository, CompanyListOptions } from "./company.repository.js";
import { ImportRepository } from "../import/import.repository.js";
import { Company } from "./company.entity.js";
import { CompanyCreateInput, CompanyUpdateInput } from "./company.dto.js";

export class CompanyService {
  private companyRepo = new CompanyRepository();

  /**
   * Fetch a company by ID and verify owner.
   */
  public async getCompanyById(
    id: string,
    userId: string,
  ): Promise<Company | null> {
    return this.companyRepo.findById(id, userId);
  }

  /**
   * Query companies with search, pagination, and filters.
   */
  public async listCompanies(
    userId: string,
    options: CompanyListOptions,
  ): Promise<{ list: Company[]; total: number }> {
    return this.companyRepo.findWithPagination(userId, options);
  }

  /**
   * Create a single manual company.
   */
  public async createCompany(
    userId: string,
    data: CompanyCreateInput,
  ): Promise<Company> {
    const { nanoid } = await import("nanoid");
    const companyData: Partial<Company> = {
      id: nanoid(),
      companyName: data.companyName,
      email: data.email || null,
      phone: data.phone || null,
      careerUrl: data.careerUrl || null,
      website: data.website || null,
      linkedin: data.linkedin || null,
      industry: data.industry || null,
      description: data.description || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      employeeSize: data.employeeSize || null,
      status: data.status || "active",
      source: data.source || "Manual",
      createdBy: userId,
    };
    return this.companyRepo.create(companyData);
  }

  /**
   * Update a company.
   */
  public async updateCompany(
    id: string,
    userId: string,
    data: CompanyUpdateInput,
  ): Promise<Company | null> {
    const updates: Partial<Company> = { ...data } as Partial<Company>;
    // Keep updated date current
    updates.updatedAt = new Date();
    return this.companyRepo.update(id, userId, updates);
  }

  /**
   * Soft deletes a single company.
   */
  public async deleteCompany(id: string, userId: string): Promise<boolean> {
    return this.companyRepo.softDelete(id, userId);
  }

  /**
   * Bulk soft deletes companies.
   */
  public async bulkDeleteCompanies(
    ids: string[],
    userId: string,
  ): Promise<number> {
    return this.companyRepo.bulkDelete(ids, userId);
  }

  /**
   * Bulk archives companies.
   */
  public async bulkArchiveCompanies(
    ids: string[],
    userId: string,
  ): Promise<number> {
    return this.companyRepo.bulkArchive(ids, userId);
  }

  /**
   * Placeholder job trigger for enrichment detail generation.
   */
  public async generateDetails(ids: string[], userId: string): Promise<string> {
    const { nanoid } = await import("nanoid");
    const jobId = `job_${nanoid()}`;
    // In Phase 3, this will enqueue a job in BullMQ to enrich selected company records.
    console.log(
      `[enrichment] Enqueued enrichment details job ${jobId} for user ${userId} targeting companies:`,
      ids,
    );
    return jobId;
  }

  /**
   * Retrieve list of past spreadsheet import batches.
   */
  public async getImportBatches(userId: string) {
    return ImportRepository.getBatchesByUser(userId);
  }

  /**
   * Retrieve specific batch details (including errors and skipped duplicates).
   */
  public async getImportBatchDetails(batchId: string, userId: string) {
    return ImportRepository.getBatchDetails(batchId, userId);
  }
}
