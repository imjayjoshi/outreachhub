import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { Campaign } from "./campaign.entity.js";
import { Contact } from "./contact.entity.js";

@Entity("CampaignContact")
@Unique(["campaignId", "contactId"])
export class CampaignContact {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  campaignId: string;

  @Column({ type: "text" })
  contactId: string;

  @Column({ type: "text", default: "pending" })
  status: string;

  @Column({ type: "timestamp", nullable: true })
  sentAt: Date | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @ManyToOne(() => Campaign, (c) => c.campaignContacts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "campaignId" })
  campaign: Campaign;

  @ManyToOne(() => Contact, (c) => c.campaignContacts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "contactId" })
  contact: Contact;
}
