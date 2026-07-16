import xlsx from "xlsx";

export interface ParsedSheet {
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export class ExcelParser {
  /**
   * Parses a Base64-encoded excel/csv file string.
   */
  public static parse(base64Data: string): ParsedSheet {
    // Strip data URL prefixes if present
    const base64Clean = base64Data.replace(/^data:.*?;base64,/, "");

    const workbook = xlsx.read(base64Clean, {
      type: "base64",
      cellDates: true,
    });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new Error("The Excel/CSV file contains no sheets.");
    }

    const worksheet = workbook.Sheets[firstSheetName];
    // sheet_to_json with defval empty string maps empty columns correctly
    const rows = xlsx.utils.sheet_to_json<Record<string, any>>(worksheet, {
      defval: "",
    });

    // Grab headers from sheet range or first row keys
    let headers: string[] = [];
    if (rows.length > 0) {
      headers = Object.keys(rows[0]);
    } else {
      // Fallback: search cells to construct headers
      const range = xlsx.utils.decode_range(worksheet["!ref"] || "A1:A1");
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = xlsx.utils.encode_cell({ r: 0, c: col });
        const cell = worksheet[cellRef];
        if (cell && cell.v !== undefined) {
          headers.push(String(cell.v).trim());
        }
      }
    }

    return {
      headers,
      rows,
      totalRows: rows.length,
    };
  }
}
