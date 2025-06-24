import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveDescInListing1747841461325 implements MigrationInterface {
    name = 'RemoveDescInListing1747841461325'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" ADD "description" character varying NOT NULL`);
    }

}
