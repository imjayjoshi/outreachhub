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
import { Campaign } from "./campaign.entity.js";

@Entity("Template")
export class Template {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  userId: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text" })
  subject: string;

  @Column({ type: "text" })
  body: string;

  @Column({ type: "jsonb", nullable: true })
  variables: object | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @ManyToOne(() => User, (u) => u.templates, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => Campaign, (c) => c.template)
  campaigns: Campaign[];
}
