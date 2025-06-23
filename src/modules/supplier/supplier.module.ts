import { Module } from '@nestjs/common';
import { Supplier } from './entities/supplier.entity';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { SupplierService } from './services/supplier.service';
import { SupplierController } from './controllers/supplier.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
