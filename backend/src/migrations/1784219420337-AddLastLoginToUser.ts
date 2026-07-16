import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastLoginToUser1784219420337 implements MigrationInterface {
  name = "AddLastLoginToUser1784219420337";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" ADD "lastLogin" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "lastLogin"`);
  }
}
