import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ImportBatch } from "./import-batch.entity.js";

@Entity("ImportBatchRow")
export class ImportBatchRow {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  batchId: string;

  @Column({ type: "integer" })
  rowNumber: number;

  @Column({ type: "text", nullable: true })
  companyName: string | null;

  @Column({ type: "text" })
  status: string; // failed, duplicate, warning

  @Column({ type: "text", nullable: true })
  reason: string | null;

  @ManyToOne(() => ImportBatch, (batch) => batch.rows, { onDelete: "CASCADE" })
  @JoinColumn({ name: "batchId" })
  batch: ImportBatch;
}
