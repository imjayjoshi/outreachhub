import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity.js";

@Entity("Lead")
export class Lead {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  userId: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", unique: true })
  website: string;

  @Column({ type: "text" })
  city: string;

  @Column({ type: "text", nullable: true })
  state: string | null;

  @Column({ type: "text", default: "IT" })
  industry: string;

  @Column({ type: "text", nullable: true })
  email: string | null;

  @Column({ type: "text" })
  source: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  lastFetched: Date;

  @Column({ type: "text", default: "new" })
  status: string;

  @Column({ type: "boolean", default: false })
  mailSent: boolean;

  @Column({ type: "boolean", default: false })
  followUpSent: boolean;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.leads, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
