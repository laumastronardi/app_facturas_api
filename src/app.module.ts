import { Module } from '@nestjs/common';
import { SupplierModule } from './modules/supplier/supplier.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule,
    SupplierModule,
    InvoiceModule,
  ]
})
export class AppModule {}
