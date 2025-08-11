import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWalletAndTransactionTables1748100000000 implements MigrationInterface {
  name = 'CreateWalletAndTransactionTables1748100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."transaction_type_enum" AS ENUM('deposit', 'withdraw');
      CREATE TYPE "public"."transaction_status_enum" AS ENUM('pending', 'completed', 'failed', 'cancelled');
      
      CREATE TABLE "wallets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "balance" numeric(10,2) NOT NULL DEFAULT '0',
        "totalDeposited" numeric(10,2) NOT NULL DEFAULT '0',
        "totalWithdrawn" numeric(10,2) NOT NULL DEFAULT '0',
        "userId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId"),
        CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id")
      );
      
      CREATE TABLE "transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "type" "public"."transaction_type_enum" NOT NULL,
        "amount" numeric(10,2) NOT NULL,
        "status" "public"."transaction_status_enum" NOT NULL DEFAULT 'pending',
        "description" character varying,
        "reference" character varying,
        "balanceAfter" numeric(10,2),
        "walletId" uuid NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")
      );
      
      ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b99" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
      ALTER TABLE "transactions" ADD CONSTRAINT "FK_e389fc20c9c1ca1e0c07b2b9b8a" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "transactions" DROP CONSTRAINT "FK_e389fc20c9c1ca1e0c07b2b9b8a"`);
    await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b99"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "wallets"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."transaction_type_enum"`);
  }
}