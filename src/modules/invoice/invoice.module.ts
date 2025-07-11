import { Module } from '@nestjs/common';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './services/invoice.service';
import { OcrService } from './services/ocr.service';
import { InvoiceController } from './controllers/invoice.controller';
import { Supplier } from '../supplier/entities/supplier.entity';
import { SupabaseModule } from '../../supabase/supabase.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [SupabaseModule, ConfigModule],
  controllers: [InvoiceController],
  providers: [InvoiceService, OcrService],
  exports: [InvoiceService, OcrService],
})
export class InvoiceModule {}
