import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity.js";
import { Company } from "./company.entity.js";
import { CampaignContact } from "./campaign-contact.entity.js";

@Entity("Contact")
export class Contact {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  userId: string;

  @Column({ type: "text", nullable: true })
  companyId: string | null;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text" })
  email: string;

  @Column({ type: "text", nullable: true })
  phone: string | null;

  @Column({ type: "text", nullable: true })
  role: string | null;

  @Column({ type: "text", nullable: true })
  linkedinUrl: string | null;

  @Column({ type: "text", default: "new" })
  status: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @ManyToOne(() => User, (u) => u.contacts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Company, (c) => c.contacts, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "companyId" })
  company: Company | null;

  @OneToMany(() => CampaignContact, (cc) => cc.contact)
  campaignContacts: CampaignContact[];
}
