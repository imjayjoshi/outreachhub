import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("DailyFetchLog")
export class DailyFetchLog {
  @PrimaryColumn({ type: "text" })
  id: string;

  @CreateDateColumn({ type: "timestamp" })
  runDate: Date;

  @Column({ type: "text" })
  city: string;

  @Column({ type: "int" })
  found: number;

  @Column({ type: "int" })
  duplicates: number;

  @Column({ type: "int" })
  inserted: number;

  @Column({ type: "int" })
  emailsFound: number;

  @Column({ type: "text" })
  status: string;
}
