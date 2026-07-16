import { z } from "zod";

export interface RowValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowNumber: number;
  data: Record<string, any>;
}

export class ExcelValidator {
  /**
   * Cleans and normalizes email strings, extracting multiple emails if delimited.
   * Supports separators: , / | - _
   */
  public static parseEmails(emailStr: string | null | undefined): {
    emails: string[];
    error?: string;
  } {
    if (!emailStr) return { emails: [] };
    const raw = String(emailStr).trim();
    if (!raw) return { emails: [] };

    // Delimiters: replace commas, slashes, pipes with spaces
    let normalized = raw.replace(/[\/,|]/g, " ");

    // Handle hyphens and underscores with spaces around them
    normalized = normalized.replace(/\s+[-_]\s+/g, " ");

    // Split by whitespace
    const parts = normalized.split(/\s+/);
    const emails: string[] = [];

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    for (const part of parts) {
      const trimmed = part.trim();
      if (!trimmed) continue;

      if (emailRegex.test(trimmed)) {
        emails.push(trimmed);
      } else {
        // If there are multiple '@' symbols in a single part (e.g. joined by underscore or hyphen without spaces)
        const atCount = (trimmed.match(/@/g) || []).length;
        if (atCount > 1) {
          const subParts = trimmed.split(/[-_]/);
          let subValid = true;
          const temp: string[] = [];

          for (const sub of subParts) {
            const subTrim = sub.trim();
            if (!subTrim) continue;
            if (emailRegex.test(subTrim)) {
              temp.push(subTrim);
            } else {
              subValid = false;
              break;
            }
          }

          if (subValid && temp.length > 0) {
            emails.push(...temp);
          } else {
            // Fallback: extract using global regex match
            const matches = trimmed.match(
              /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            );
            if (matches && matches.length > 0) {
              emails.push(
                ...matches.map((m) => m.replace(/^[-_]+|[-_]+$/g, "")),
              );
            } else {
              return {
                emails: [],
                error: `Invalid email address format: ${trimmed}`,
              };
            }
          }
        } else {
          // Clean leading/trailing hyphens/underscores which might be separators
          const cleaned = trimmed.replace(/^[-_]+|[-_]+$/g, "");
          if (emailRegex.test(cleaned)) {
            emails.push(cleaned);
          } else {
            return {
              emails: [],
              error: `Invalid email address format: ${trimmed}`,
            };
          }
        }
      }
    }

    if (emails.length === 0) {
      return { emails: [], error: `Invalid email address format: ${raw}` };
    }

    return { emails: [...new Set(emails)] };
  }

  /**
   * Helper to normalize and validate URL fields.
   */
  public static normalizeUrl(urlStr: string | null | undefined): {
    url: string | null;
    error?: string;
  } {
    if (!urlStr) return { url: null };
    let trimmed = String(urlStr).trim();
    if (!trimmed) return { url: null };

    // Prepend https:// if protocol is missing
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(trimmed);
      return { url: parsed.href };
    } catch {
      return { url: null, error: `Invalid URL format: ${urlStr}` };
    }
  }

  /**
   * Validates and cleanses a mapped row record.
   */
  public static validateRow(
    row: Record<string, any>,
    rowNumber: number,
  ): RowValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const cleanedData: Record<string, any> = { ...row };

    // 1. Validate Company Name (Required)
    const rawName = row.companyName;
    if (
      rawName === undefined ||
      rawName === null ||
      String(rawName).trim() === ""
    ) {
      errors.push("Company Name is required.");
    } else {
      cleanedData.companyName = String(rawName).trim();
    }

    // 2. Validate Emails (Optional)
    if (
      row.email !== undefined &&
      row.email !== null &&
      String(row.email).trim() !== ""
    ) {
      const emailResult = this.parseEmails(row.email);
      if (emailResult.error) {
        errors.push(emailResult.error);
      } else {
        cleanedData.email = emailResult.emails.join(", ");
      }
    } else {
      cleanedData.email = null;
    }

    // 3. Validate Phone (Optional)
    if (
      row.phone !== undefined &&
      row.phone !== null &&
      String(row.phone).trim() !== ""
    ) {
      cleanedData.phone = String(row.phone).trim();
    } else {
      cleanedData.phone = null;
    }

    // 4. Validate Career Page Link (Optional)
    if (
      row.careerUrl !== undefined &&
      row.careerUrl !== null &&
      String(row.careerUrl).trim() !== ""
    ) {
      const urlResult = this.normalizeUrl(row.careerUrl);
      if (urlResult.error) {
        errors.push(`Career URL: ${urlResult.error}`);
      } else {
        cleanedData.careerUrl = urlResult.url;
      }
    } else {
      cleanedData.careerUrl = null;
    }

    // 5. Validate Website (Optional)
    if (
      row.website !== undefined &&
      row.website !== null &&
      String(row.website).trim() !== ""
    ) {
      const urlResult = this.normalizeUrl(row.website);
      if (urlResult.error) {
        errors.push(`Website: ${urlResult.error}`);
      } else {
        cleanedData.website = urlResult.url;
      }
    } else {
      cleanedData.website = null;
    }

    // Clean other optional details
    const textFields = [
      "linkedin",
      "industry",
      "description",
      "city",
      "state",
      "country",
      "employeeSize",
    ];
    for (const field of textFields) {
      if (
        row[field] !== undefined &&
        row[field] !== null &&
        String(row[field]).trim() !== ""
      ) {
        cleanedData[field] = String(row[field]).trim();
      } else {
        cleanedData[field] = null;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      rowNumber,
      data: cleanedData,
    };
  }
}
