export class ExcelMapper {
  /**
   * Maps raw parsed row keys to standard company entity database field keys.
   * @param rawRows Raw rows parsed from excel
   * @param mappings Mappings dictionary { [fileHeader]: [dbFieldName] }
   */
  public static map(
    rawRows: Record<string, any>[],
    mappings: Record<string, string>,
  ): Record<string, any>[] {
    return rawRows.map((row) => {
      const mappedRow: Record<string, any> = {};

      // Initialize all database fields as null
      const targetFields = [
        "companyName",
        "email",
        "phone",
        "careerUrl",
        "website",
        "linkedin",
        "industry",
        "description",
        "city",
        "state",
        "country",
        "employeeSize",
      ];
      for (const field of targetFields) {
        mappedRow[field] = null;
      }

      // Map raw row fields using mapping configuration
      for (const [fileHeader, dbField] of Object.entries(mappings)) {
        if (!dbField) continue;

        const value = row[fileHeader];
        if (value !== undefined && value !== null) {
          // Normalize value representation
          if (typeof value === "string") {
            mappedRow[dbField] = value;
          } else if (value instanceof Date) {
            mappedRow[dbField] = value.toISOString();
          } else {
            mappedRow[dbField] = String(value);
          }
        }
      }

      return mappedRow;
    });
  }
}
