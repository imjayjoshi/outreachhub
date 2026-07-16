import { Entity, PrimaryColumn, Column, Unique } from "typeorm";

@Entity("DailyFetchTarget")
export class DailyFetchTarget {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text", unique: true })
  city: string;

  @Column({ type: "text" })
  state: string;

  @Column({ type: "int" })
  target: number;
}
