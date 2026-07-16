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
import { Contact } from "./contact.entity.js";

@Entity("Company")
export class Company {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  userId: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", nullable: true })
  website: string | null;

  @Column({ type: "text", nullable: true })
  industry: string | null;

  @Column({ type: "text", nullable: true })
  size: string | null;

  @Column({ type: "text", nullable: true })
  location: string | null;

  @Column({ type: "text", nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt: Date;

  @ManyToOne(() => User, (u) => u.companies, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => Contact, (c) => c.company)
  contacts: Contact[];
}
