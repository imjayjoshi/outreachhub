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
import { Template } from "./template.entity.js";
import { CampaignContact } from "./campaign-contact.entity.js";

@Entity("Campaign")
export class Campaign {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  userId: string;

  @Column({ type: "text", nullable: true })
  templateId: string | null;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", default: "draft" })
  status: string;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @ManyToOne(() => User, (u) => u.campaigns, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Template, (t) => t.campaigns, {
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "templateId" })
  template: Template | null;

  @OneToMany(() => CampaignContact, (cc) => cc.campaign)
  campaignContacts: CampaignContact[];
}
