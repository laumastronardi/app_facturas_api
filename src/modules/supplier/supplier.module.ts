import { Module } from '@nestjs/common';
import { SupplierService } from './services/supplier.service';
import { SupplierController } from './controllers/supplier.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './entities/supplier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  controllers: [SupplierController],
  providers: [SupplierService],
})
export class SupplierModule {}
