import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Account } from "./account.entity.js";
import { Session } from "./session.entity.js";
import { Company } from "./company.entity.js";
import { Contact } from "./contact.entity.js";
import { Template } from "./template.entity.js";
import { Campaign } from "./campaign.entity.js";
import { Lead } from "./lead.entity.js";

@Entity("User")
export class User {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text", nullable: true })
  name: string | null;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "timestamp", nullable: true })
  emailVerified: Date | null;

  @Column({ type: "text", nullable: true })
  image: string | null;

  @Column({ type: "text", nullable: true })
  passwordHash: string | null;

  @Column({ type: "text", nullable: true })
  provider: string | null;

  @Column({ type: "text", nullable: true })
  providerId: string | null;

  @Column({ type: "text", nullable: true })
  googleId: string | null;

  @Column({ type: "text", nullable: true })
  avatar: string | null;

  @Column({ type: "text", nullable: true })
  refreshToken: string | null;

  @Column({ type: "timestamp", nullable: true })
  tokenExpiry: Date | null;

  @Column({ type: "timestamp", nullable: true })
  lastLogin: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @OneToMany(() => Account, (a) => a.user)
  accounts: Account[];

  @OneToMany(() => Session, (s) => s.user)
  sessions: Session[];

  @OneToMany(() => Company, (c) => c.creator)
  companies: Company[];

  @OneToMany(() => Contact, (c) => c.user)
  contacts: Contact[];

  @OneToMany(() => Template, (t) => t.user)
  templates: Template[];

  @OneToMany(() => Campaign, (c) => c.user)
  campaigns: Campaign[];

  @OneToMany(() => Lead, (l) => l.user)
  leads: Lead[];
}
