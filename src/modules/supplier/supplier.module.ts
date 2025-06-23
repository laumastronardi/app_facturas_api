import { Module } from '@nestjs/common';
import { Supplier } from './entities/supplier.entity';
import { SupabaseModule } from 'src/supabase/supabase.module';
import { SuppliersService } from './services/supplier.service';
import { SuppliersController } from './controllers/supplier.controller';

@Module({
  imports: [SupabaseModule],
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SupplierModule {}
