import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierModule } from './modules/supplier/supplier.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { databaseConfig } from './modules/config/database.config';
import { DatabaseModule } from './database.module';

@Module({
  imports: [
    DatabaseModule,
    SupplierModule,
    InvoiceModule,
  ]
})
export class AppModule {}
