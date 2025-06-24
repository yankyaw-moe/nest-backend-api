import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewFieldsInListing1747902092831 implements MigrationInterface {
    name = 'AddNewFieldsInListing1747902092831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" ADD "price" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "listing" DROP COLUMN "price"`);
    }

}
