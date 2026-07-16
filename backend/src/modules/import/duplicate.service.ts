import { AppDataSource } from "../shared/database/dataSource.js";
import { Company } from "../company/company.entity.js";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason?: string;
  matchedId?: string;
}

export class DuplicateService {
  /**
   * Helper to normalize a URL to a domain level string to prevent subtle duplicates
   * E.g. "https://www.google.com/search?q=1" -> "google.com"
   */
  private static normalizeDomain(
    url: string | null | undefined,
  ): string | null {
    if (!url) return null;
    let clean = String(url).trim().toLowerCase();

    // Strip protocol
    clean = clean.replace(/^https?:\/\//, "");
    // Strip www.
    clean = clean.replace(/^www\./, "");
    // Strip trailing slash and path
    const slashIndex = clean.indexOf("/");
    if (slashIndex !== -1) {
      clean = clean.substring(0, slashIndex);
    }

    return clean || null;
  }

  /**
   * Helper to parse and split emails into lowercase tokens
   */
  private static parseEmailTokens(
    emailStr: string | null | undefined,
  ): string[] {
    if (!emailStr) return [];
    return String(emailStr)
      .toLowerCase()
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
  }

  /**
   * Pre-fetches all existing user companies and returns indexing maps.
   */
  public static async prepareLookupMaps(userId: string) {
    const companyRepo = AppDataSource.getRepository(Company);

    // Fetch only non-deleted companies for this user
    const companies = await companyRepo.find({
      select: ["id", "companyName", "website", "careerUrl", "email"],
      where: { createdBy: userId },
    });

    const websiteMap = new Map<string, Company>();
    const careerUrlMap = new Map<string, Company>();
    const emailMap = new Map<string, Company>();
    const nameMap = new Map<string, Company>();

    for (const company of companies) {
      // 1. Website
      const webDomain = this.normalizeDomain(company.website);
      if (webDomain) {
        websiteMap.set(webDomain, company);
      }

      // 2. Career URL
      const careerDomain = this.normalizeDomain(company.careerUrl);
      if (careerDomain) {
        careerUrlMap.set(careerDomain, company);
      }

      // 3. Emails
      const emails = this.parseEmailTokens(company.email);
      for (const email of emails) {
        emailMap.set(email, company);
      }

      // 4. Company Name
      const nameKey = company.companyName.trim().toLowerCase();
      if (nameKey) {
        nameMap.set(nameKey, company);
      }
    }

    return {
      websiteMap,
      careerUrlMap,
      emailMap,
      nameMap,
    };
  }

  /**
   * Checks if a row is a duplicate using prepared maps in order of priority:
   * Website -> Career URL -> Email -> Company Name.
   */
  public static checkDuplicate(
    row: Record<string, any>,
    maps: {
      websiteMap: Map<string, Company>;
      careerUrlMap: Map<string, Company>;
      emailMap: Map<string, Company>;
      nameMap: Map<string, Company>;
    },
  ): DuplicateCheckResult {
    const { websiteMap, careerUrlMap, emailMap, nameMap } = maps;

    // 1. Website
    const rowWebDomain = this.normalizeDomain(row.website);
    if (rowWebDomain && websiteMap.has(rowWebDomain)) {
      const match = websiteMap.get(rowWebDomain)!;
      return {
        isDuplicate: true,
        reason: `Duplicate Website domain: "${row.website}" (matches "${match.companyName}")`,
        matchedId: match.id,
      };
    }

    // 2. Career URL
    const rowCareerDomain = this.normalizeDomain(row.careerUrl);
    if (rowCareerDomain && careerUrlMap.has(rowCareerDomain)) {
      const match = careerUrlMap.get(rowCareerDomain)!;
      return {
        isDuplicate: true,
        reason: `Duplicate Career URL domain: "${row.careerUrl}" (matches "${match.companyName}")`,
        matchedId: match.id,
      };
    }

    // 3. Email
    const rowEmails = this.parseEmailTokens(row.email);
    for (const email of rowEmails) {
      if (emailMap.has(email)) {
        const match = emailMap.get(email)!;
        return {
          isDuplicate: true,
          reason: `Duplicate Email ID: "${email}" (matches "${match.companyName}")`,
          matchedId: match.id,
        };
      }
    }

    // 4. Company Name
    if (row.companyName) {
      const nameKey = String(row.companyName).trim().toLowerCase();
      if (nameKey && nameMap.has(nameKey)) {
        const match = nameMap.get(nameKey)!;
        return {
          isDuplicate: true,
          reason: `Duplicate Company Name: "${row.companyName}" (matches existing company ID: ${match.id})`,
          matchedId: match.id,
        };
      }
    }

    return { isDuplicate: false };
  }
}
