import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity.js";

@Entity("Account")
@Unique(["provider", "providerAccountId"])
export class Account {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text" })
  userId: string;

  @Column({ type: "text" })
  type: string;

  @Column({ type: "text" })
  provider: string;

  @Column({ type: "text" })
  providerAccountId: string;

  @Column({ type: "text", nullable: true })
  refresh_token: string | null;

  @Column({ type: "text", nullable: true })
  access_token: string | null;

  @Column({ type: "int", nullable: true })
  expires_at: number | null;

  @Column({ type: "text", nullable: true })
  token_type: string | null;

  @Column({ type: "text", nullable: true })
  scope: string | null;

  @Column({ type: "text", nullable: true })
  id_token: string | null;

  @Column({ type: "text", nullable: true })
  session_state: string | null;

  @ManyToOne(() => User, (u) => u.accounts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
