import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "../shared/database/entities/user.entity.js";
import { Contact } from "../shared/database/entities/contact.entity.js";

@Entity("Company")
export class Company {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  companyName: string;

  @Column({ type: "text", nullable: true })
  email: string | null;

  @Column({ type: "text", nullable: true })
  phone: string | null;

  @Column({ type: "text", nullable: true })
  careerUrl: string | null;

  @Column({ type: "text", nullable: true })
  website: string | null;

  @Column({ type: "text", nullable: true })
  linkedin: string | null;

  @Column({ type: "text", nullable: true })
  industry: string | null;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({ type: "text", nullable: true })
  city: string | null;

  @Column({ type: "text", nullable: true })
  state: string | null;

  @Column({ type: "text", nullable: true })
  country: string | null;

  @Column({ type: "text", nullable: true })
  employeeSize: string | null;

  @Column({ type: "text", default: "active" })
  status: string; // active, archived

  @Column({ type: "text", default: "Manual" })
  source: string; // Excel, CSV, Manual, API, Scraper

  @Column({ type: "text", nullable: true })
  importBatchId: string | null;

  @Column({ type: "text" })
  createdBy: string; // User ID

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @DeleteDateColumn({ type: "timestamp", nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User, (u) => u.companies, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdBy" })
  creator: User;

  @OneToMany(() => Contact, (c) => c.company)
  contacts: Contact[];
}
