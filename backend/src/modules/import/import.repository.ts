import { AppDataSource } from "../shared/database/dataSource.js";
import { Company } from "../company/company.entity.js";
import { ImportBatch } from "../company/import-batch.entity.js";
import { ImportBatchRow } from "../company/import-batch-row.entity.js";

export class ImportRepository {
  /**
   * Saves the import batch log, row level errors/duplicates logs, and imports companies
   * inside a single database transaction. If any database operation fails, the transaction is rolled back.
   */
  public static async saveBatchAndRecords(
    batch: ImportBatch,
    rowLogs: ImportBatchRow[],
    companiesToInsert: Company[],
  ): Promise<void> {
    await AppDataSource.transaction(async (manager) => {
      // 1. Save the main batch entity
      await manager.save(ImportBatch, batch);

      // 2. Bulk insert row outcome logs (duplicates/failures) in chunks
      if (rowLogs.length > 0) {
        const chunkSize = 500;
        for (let i = 0; i < rowLogs.length; i += chunkSize) {
          const chunk = rowLogs.slice(i, i + chunkSize);
          await manager.insert(ImportBatchRow, chunk);
        }
      }

      // 3. Bulk insert the new companies in chunks
      if (companiesToInsert.length > 0) {
        const chunkSize = 500;
        for (let i = 0; i < companiesToInsert.length; i += chunkSize) {
          const chunk = companiesToInsert.slice(i, i + chunkSize);
          await manager.insert(Company, chunk);
        }
      }
    });
  }

  /**
   * Retrieves all past import batches for a user.
   */
  public static async getBatchesByUser(userId: string): Promise<ImportBatch[]> {
    return AppDataSource.getRepository(ImportBatch).find({
      where: { uploadedBy: userId },
      order: { startedAt: "DESC" },
    });
  }

  /**
   * Retrieves details (including row logs) of a specific import batch.
   */
  public static async getBatchDetails(
    batchId: string,
    userId: string,
  ): Promise<ImportBatch | null> {
    return AppDataSource.getRepository(ImportBatch).findOne({
      where: { id: batchId, uploadedBy: userId },
      relations: { rows: true },
    });
  }
}
