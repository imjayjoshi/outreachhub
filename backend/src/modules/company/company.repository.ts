import { AppDataSource } from "../shared/database/dataSource.js";
import { Company } from "./company.entity.js";
import { Repository, Like, IsNull, Not, Between } from "typeorm";

export interface CompanyListFilters {
  importedToday?: boolean;
  importedThisWeek?: boolean;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  hasCareerPage?: boolean;
  missingDetails?: boolean;
  status?: string; // active, archived
}

export interface CompanyListOptions {
  page: number;
  limit: number;
  search?: string;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
  filters?: CompanyListFilters;
}

export class CompanyRepository {
  private get repo(): Repository<Company> {
    return AppDataSource.getRepository(Company);
  }

  /**
   * Find a single company by ID, checking creator security boundaries.
   */
  public async findById(id: string, userId: string): Promise<Company | null> {
    return this.repo.findOne({
      where: { id, createdBy: userId },
      relations: { contacts: true },
    });
  }

  /**
   * Find companies with pagination, filtering, searching, and sorting.
   */
  public async findWithPagination(
    userId: string,
    options: CompanyListOptions,
  ): Promise<{ list: Company[]; total: number }> {
    const { page, limit, search, sortField, sortOrder, filters } = options;
    const skip = (page - 1) * limit;

    const queryBuilder = this.repo.createQueryBuilder("company");

    // Scoped to current user and filter out soft-deleted records by default
    queryBuilder.where("company.createdBy = :userId", { userId });

    // Handle Global Search (matches companyName, email, phone, website, careerUrl)
    if (search) {
      queryBuilder.andWhere(
        `(LOWER(company.companyName) LIKE :search 
          OR LOWER(company.email) LIKE :search 
          OR LOWER(company.phone) LIKE :search 
          OR LOWER(company.website) LIKE :search 
          OR LOWER(company.careerUrl) LIKE :search)`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    // Handle Filters
    if (filters) {
      // Status filter
      if (filters.status) {
        queryBuilder.andWhere("company.status = :status", {
          status: filters.status,
        });
      } else {
        // Default to active if status filter is not explicitly provided
        queryBuilder.andWhere("company.status = 'active'");
      }

      // Imported Today
      if (filters.importedToday) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        queryBuilder.andWhere(
          "company.createdAt BETWEEN :todayStart AND :todayEnd",
          {
            todayStart: start,
            todayEnd: end,
          },
        );
      }

      // Imported This Week
      if (filters.importedThisWeek) {
        const start = new Date();
        start.setDate(start.getDate() - 7);
        start.setHours(0, 0, 0, 0);
        queryBuilder.andWhere("company.createdAt >= :weekStart", {
          weekStart: start,
        });
      }

      // Has Email
      if (filters.hasEmail) {
        queryBuilder.andWhere(
          "company.email IS NOT NULL AND company.email != ''",
        );
      }

      // Has Website
      if (filters.hasWebsite) {
        queryBuilder.andWhere(
          "company.website IS NOT NULL AND company.website != ''",
        );
      }

      // Has Career Page
      if (filters.hasCareerPage) {
        queryBuilder.andWhere(
          "company.careerUrl IS NOT NULL AND company.careerUrl != ''",
        );
      }

      // Missing Details (either missing email, website, career page, phone, or industry)
      if (filters.missingDetails) {
        queryBuilder.andWhere(
          `(company.email IS NULL OR company.email = '' 
            OR company.website IS NULL OR company.website = '' 
            OR company.careerUrl IS NULL OR company.careerUrl = '' 
            OR company.phone IS NULL OR company.phone = '' 
            OR company.industry IS NULL OR company.industry = '')`,
        );
      }
    } else {
      // Default to active
      queryBuilder.andWhere("company.status = 'active'");
    }

    // Handle Sorting (with whitelist injection prevention)
    const allowedSortFields = [
      "companyName",
      "email",
      "phone",
      "website",
      "careerUrl",
      "createdAt",
      "updatedAt",
    ];
    const activeSortField = allowedSortFields.includes(sortField || "")
      ? sortField!
      : "createdAt";
    const activeSortOrder = sortOrder === "ASC" ? "ASC" : "DESC";

    queryBuilder.orderBy(`company.${activeSortField}`, activeSortOrder);

    // Apply Pagination
    queryBuilder.skip(skip).take(limit);

    const [list, total] = await queryBuilder.getManyAndCount();

    return { list, total };
  }

  /**
   * Creates a new company record.
   */
  public async create(data: Partial<Company>): Promise<Company> {
    const company = this.repo.create(data);
    return this.repo.save(company);
  }

  /**
   * Updates an existing company.
   */
  public async update(
    id: string,
    userId: string,
    data: Partial<Company>,
  ): Promise<Company | null> {
    await this.repo.update({ id, createdBy: userId }, data);
    return this.findById(id, userId);
  }

  /**
   * Soft deletes a company by setting deletedAt.
   */
  public async softDelete(id: string, userId: string): Promise<boolean> {
    const result = await this.repo.softDelete({ id, createdBy: userId });
    return !!result.affected && result.affected > 0;
  }

  /**
   * Bulk soft deletes multiple companies.
   */
  public async bulkDelete(ids: string[], userId: string): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.repo.softDelete({
      id: Like(`%`),
      createdBy: userId,
    } as any); // fallback expression or direct update
    // A cleaner approach for TypeORM bulk soft-delete on specific ID arrays:
    const updateResult = await this.repo
      .createQueryBuilder()
      .softDelete()
      .where("id IN (:...ids) AND createdBy = :userId", { ids, userId })
      .execute();
    return updateResult.affected || 0;
  }

  /**
   * Bulk updates company status (e.g. to 'archived').
   */
  public async bulkArchive(ids: string[], userId: string): Promise<number> {
    if (ids.length === 0) return 0;
    const result = await this.repo
      .createQueryBuilder()
      .update(Company)
      .set({ status: "archived" })
      .where("id IN (:...ids) AND createdBy = :userId", { ids, userId })
      .execute();
    return result.affected || 0;
  }
}
