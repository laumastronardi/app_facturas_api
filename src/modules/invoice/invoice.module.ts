import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './services/invoice.service';
import { InvoiceController } from './controllers/invoice.controller';
import { Supplier } from '../supplier/entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Supplier])],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
