import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewFieldsInListing1747902410070 implements MigrationInterface {
    name = 'AddNewFieldsInListing1747902410070'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" ADD "location" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "location"`);
    }

}
