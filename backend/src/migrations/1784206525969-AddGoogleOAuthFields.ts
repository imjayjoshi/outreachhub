import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGoogleOAuthFields1784206525969 implements MigrationInterface {
  name = "AddGoogleOAuthFields1784206525969";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" DROP CONSTRAINT "Template_userId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_userId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_templateId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" DROP CONSTRAINT "CampaignContact_campaignId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" DROP CONSTRAINT "CampaignContact_contactId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" DROP CONSTRAINT "Contact_userId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" DROP CONSTRAINT "Contact_companyId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" DROP CONSTRAINT "Company_userId_fkey"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" DROP CONSTRAINT "Lead_userId_fkey"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."Account_provider_providerAccountId_key"`,
    );
    await queryRunner.query(`DROP INDEX "public"."Session_sessionToken_key"`);
    await queryRunner.query(
      `DROP INDEX "public"."CampaignContact_campaignId_contactId_key"`,
    );
    await queryRunner.query(`DROP INDEX "public"."Lead_website_key"`);
    await queryRunner.query(`DROP INDEX "public"."User_email_key"`);
    await queryRunner.query(
      `DROP INDEX "public"."VerificationToken_token_key"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."VerificationToken_identifier_token_key"`,
    );
    await queryRunner.query(`DROP INDEX "public"."DailyFetchTarget_city_key"`);
    await queryRunner.query(`ALTER TABLE "User" ADD "provider" text`);
    await queryRunner.query(`ALTER TABLE "User" ADD "providerId" text`);
    await queryRunner.query(`ALTER TABLE "User" ADD "googleId" text`);
    await queryRunner.query(`ALTER TABLE "User" ADD "avatar" text`);
    await queryRunner.query(`ALTER TABLE "User" ADD "refreshToken" text`);
    await queryRunner.query(`ALTER TABLE "User" ADD "tokenExpiry" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" ADD CONSTRAINT "PK_355a03d7cbdaaa6a4c3c4c05b28" PRIMARY KEY ("id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Session" ADD CONSTRAINT "UQ_c9acf2d5c1d633c73f4395fe6bf" UNIQUE ("sessionToken")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Session" ALTER COLUMN "expires" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ALTER COLUMN "updatedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ALTER COLUMN "updatedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ALTER COLUMN "sentAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ALTER COLUMN "updatedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ALTER COLUMN "updatedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ADD CONSTRAINT "UQ_b6e2ef40e149a3923bb47a37b07" UNIQUE ("website")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ALTER COLUMN "lastFetched" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ALTER COLUMN "lastFetched" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ADD CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "emailVerified" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "createdAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "updatedAt" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" ADD CONSTRAINT "UQ_43b37544e48a5b43a980e8cd8e1" UNIQUE ("token")`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" ALTER COLUMN "expires" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "DailyFetchTarget" ADD CONSTRAINT "UQ_cf0c06b10a37443c9fff2dd9ee8" UNIQUE ("city")`,
    );
    await queryRunner.query(
      `ALTER TABLE "DailyFetchLog" ALTER COLUMN "runDate" TYPE TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "DailyFetchLog" ALTER COLUMN "runDate" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "Account" ADD CONSTRAINT "UQ_107d50112599c86e8c49be73104" UNIQUE ("provider", "providerAccountId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ADD CONSTRAINT "UQ_3acc0591d81709d74d7afd31211" UNIQUE ("campaignId", "contactId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" ADD CONSTRAINT "UQ_4f23ea2acab2f4c4120369e792d" UNIQUE ("identifier", "token")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Account" ADD CONSTRAINT "FK_91352a3b16e54146621513a8ff8" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Session" ADD CONSTRAINT "FK_5d4e8000d78793c81fe0b2f38f6" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ADD CONSTRAINT "FK_f263143c804e0a18c5ac932a390" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ADD CONSTRAINT "FK_c2962d4489873940cb1bafb61bd" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ADD CONSTRAINT "FK_fbb58b03e48c2e960aab460f016" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ADD CONSTRAINT "FK_c802adf5d92bb6fd13ae30c77b4" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ADD CONSTRAINT "FK_d9336a09c9e2289f374c34a9e7d" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ADD CONSTRAINT "FK_c0e04e1068848911421d27f2d32" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ADD CONSTRAINT "FK_9d01b35b762602b9b7edd8bf918" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ADD CONSTRAINT "FK_588758d1d2ae16fe80ba3a7777f" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ADD CONSTRAINT "FK_1c80d5c2771b32859f59f0be5e8" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Lead" DROP CONSTRAINT "FK_1c80d5c2771b32859f59f0be5e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" DROP CONSTRAINT "FK_588758d1d2ae16fe80ba3a7777f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" DROP CONSTRAINT "FK_9d01b35b762602b9b7edd8bf918"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" DROP CONSTRAINT "FK_c0e04e1068848911421d27f2d32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" DROP CONSTRAINT "FK_d9336a09c9e2289f374c34a9e7d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" DROP CONSTRAINT "FK_c802adf5d92bb6fd13ae30c77b4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" DROP CONSTRAINT "FK_fbb58b03e48c2e960aab460f016"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" DROP CONSTRAINT "FK_c2962d4489873940cb1bafb61bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" DROP CONSTRAINT "FK_f263143c804e0a18c5ac932a390"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Session" DROP CONSTRAINT "FK_5d4e8000d78793c81fe0b2f38f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Account" DROP CONSTRAINT "FK_91352a3b16e54146621513a8ff8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" DROP CONSTRAINT "UQ_4f23ea2acab2f4c4120369e792d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" DROP CONSTRAINT "UQ_3acc0591d81709d74d7afd31211"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Account" DROP CONSTRAINT "UQ_107d50112599c86e8c49be73104"`,
    );
    await queryRunner.query(
      `ALTER TABLE "DailyFetchLog" ALTER COLUMN "runDate" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "DailyFetchLog" ALTER COLUMN "runDate" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "DailyFetchTarget" DROP CONSTRAINT "UQ_cf0c06b10a37443c9fff2dd9ee8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" ALTER COLUMN "expires" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" DROP CONSTRAINT "UQ_43b37544e48a5b43a980e8cd8e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" ALTER COLUMN "emailVerified" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "User" DROP CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ALTER COLUMN "lastFetched" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ALTER COLUMN "lastFetched" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" DROP CONSTRAINT "UQ_b6e2ef40e149a3923bb47a37b07"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ALTER COLUMN "updatedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ALTER COLUMN "updatedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ALTER COLUMN "sentAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ALTER COLUMN "updatedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ALTER COLUMN "updatedAt" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ALTER COLUMN "updatedAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ALTER COLUMN "createdAt" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Session" ALTER COLUMN "expires" TYPE TIMESTAMP(3)`,
    );
    await queryRunner.query(
      `ALTER TABLE "Session" DROP CONSTRAINT "UQ_c9acf2d5c1d633c73f4395fe6bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "VerificationToken" DROP CONSTRAINT "PK_355a03d7cbdaaa6a4c3c4c05b28"`,
    );
    await queryRunner.query(`ALTER TABLE "VerificationToken" DROP COLUMN "id"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "tokenExpiry"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "refreshToken"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "avatar"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "googleId"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "providerId"`);
    await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "provider"`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "DailyFetchTarget_city_key" ON "DailyFetchTarget" ("city") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken" ("identifier", "token") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken" ("token") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "User_email_key" ON "User" ("email") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Lead_website_key" ON "Lead" ("website") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "CampaignContact_campaignId_contactId_key" ON "CampaignContact" ("campaignId", "contactId") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session" ("sessionToken") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account" ("provider", "providerAccountId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "Lead" ADD CONSTRAINT "Lead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Company" ADD CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ADD CONSTRAINT "Contact_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Contact" ADD CONSTRAINT "Contact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ADD CONSTRAINT "CampaignContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "CampaignContact" ADD CONSTRAINT "CampaignContact_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
