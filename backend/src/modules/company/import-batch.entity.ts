import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../shared/database/entities/user.entity.js";
import { ImportBatchRow } from "./import-batch-row.entity.js";

@Entity("ImportBatch")
export class ImportBatch {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  filename: string;

  @Column({ type: "integer" })
  totalRows: number;

  @Column({ type: "integer" })
  importedRows: number;

  @Column({ type: "integer" })
  duplicateRows: number;

  @Column({ type: "integer" })
  failedRows: number;

  @Column({ type: "text" })
  uploadedBy: string; // User ID

  @CreateDateColumn({ type: "timestamp" })
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt: Date | null;

  @Column({ type: "text", default: "pending" })
  status: string; // pending, processing, completed, failed

  @ManyToOne(() => User, (u) => u.companies, { onDelete: "CASCADE" }) // or any generic cascade
  @JoinColumn({ name: "uploadedBy" })
  user: User;

  @OneToMany(() => ImportBatchRow, (row) => row.batch)
  rows: ImportBatchRow[];
}
