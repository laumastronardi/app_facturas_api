import { Module } from '@nestjs/common';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './services/invoice.service';
import { InvoiceController } from './controllers/invoice.controller';
import { Supplier } from '../supplier/entities/supplier.entity';
import { SupabaseModule } from 'src/supabase/supabase.module';

console.log('InvoiceModule: before @Module');

@Module({
  imports: [SupabaseModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {
  constructor() {
    console.log('InvoiceModule: constructor');
  }
}
