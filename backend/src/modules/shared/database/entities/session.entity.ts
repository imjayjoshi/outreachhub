import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity.js";

@Entity("Session")
export class Session {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column({ type: "text", unique: true })
  sessionToken: string;

  @Column({ type: "text" })
  userId: string;

  @Column({ type: "timestamp" })
  expires: Date;

  @ManyToOne(() => User, (u) => u.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;
}
