import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupplierModule } from './modules/supplier/supplier.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { AppController } from './app.controller';
import { databaseConfig } from './modules/config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    SupplierModule,
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
