import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  create(dto: CreateSupplierDto) {
    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  findAll() {
    return this.supplierRepository.find();
  }

  findOne(id: number) {
    return this.supplierRepository.findOneBy({ id });
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.supplierRepository.preload({
      id,
      ...dto,
    });

    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }

    return this.supplierRepository.save(supplier);
  }

  async remove(id: number) {
    const supplier = await this.findOne(id);
    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }
    return this.supplierRepository.remove(supplier);
  }
}
