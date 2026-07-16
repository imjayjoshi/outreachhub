import { Entity, Column, Unique, PrimaryGeneratedColumn } from "typeorm";

@Entity("VerificationToken")
@Unique(["identifier", "token"])
export class VerificationToken {
  // TypeORM requires a primary column; we use a surrogate since Prisma model
  // had a composite unique key but no single @id.
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  identifier: string;

  @Column({ type: "text", unique: true })
  token: string;

  @Column({ type: "timestamp" })
  expires: Date;
}
