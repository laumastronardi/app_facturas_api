import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVatFieldsToInvoice1750541803810 implements MigrationInterface {
    name = 'AddVatFieldsToInvoice1750541803810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" ADD "amount_105" decimal(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "total_neto" decimal(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "vat_amount_21" decimal(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "vat_amount_105" decimal(10,2) NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD "total_amount" decimal(10,2) NOT NULL DEFAULT 0`);
        
        // Actualizar precision y scale para campos existentes
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "amount" TYPE decimal(10,2)`);
        await queryRunner.query(`ALTER TABLE "invoice" ALTER COLUMN "vat" TYPE decimal(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "total_amount"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "vat_amount_105"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "vat_amount_21"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "total_neto"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "amount_105"`);
    }
} 