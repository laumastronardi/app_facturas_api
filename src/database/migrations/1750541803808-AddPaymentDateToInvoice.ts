import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentDateToInvoice1750541803808 implements MigrationInterface {
    name = 'AddPaymentDateToInvoice1750541803808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" ADD "paymentDate" date`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice" DROP COLUMN "paymentDate"`);
    }

}
