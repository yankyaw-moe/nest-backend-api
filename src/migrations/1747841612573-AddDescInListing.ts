import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDescInListing1747841612573 implements MigrationInterface {
    name = 'AddDescInListing1747841612573'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" ADD "description" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "description"`);
    }

}
