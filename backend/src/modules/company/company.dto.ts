export interface CompanyCreateInput {
  companyName: string;
  email?: string | null;
  phone?: string | null;
  careerUrl?: string | null;
  website?: string | null;
  linkedin?: string | null;
  industry?: string | null;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  employeeSize?: string | null;
  status?: string;
  source?: string;
}

export type CompanyUpdateInput = Partial<CompanyCreateInput>;

export interface CompanyListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: "ASC" | "DESC";
  importedToday?: boolean;
  importedThisWeek?: boolean;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  hasCareerPage?: boolean;
  missingDetails?: boolean;
  status?: string;
}

export interface ImportPreviewInput {
  fileData: string; // Base64 encoded file
  filename: string;
}

export interface ImportConfirmInput {
  fileData: string; // Base64 encoded file
  filename: string;
  mappings: Record<string, string>;
}

export interface BulkActionInput {
  ids: string[];
}

export interface GenerateDetailsInput {
  ids: string[];
}
