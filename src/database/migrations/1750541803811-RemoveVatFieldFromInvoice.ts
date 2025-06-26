import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveVatFieldFromInvoice1750541803811 implements MigrationInterface {
    name = 'RemoveVatFieldFromInvoice1750541803811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "vat"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" ADD "vat" decimal(10,2) NOT NULL DEFAULT 0`);
    }
} 