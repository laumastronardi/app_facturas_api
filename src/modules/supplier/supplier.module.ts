import { Module } from '@nestjs/common';
import { SupplierController } from './controllers/supplier.controller';
import { SupplierService } from './services/supplier.service';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [SupabaseModule],
  controllers: [SupplierController],
  providers: [SupplierService],
  exports: [SupplierService],
})
export class SupplierModule {}
