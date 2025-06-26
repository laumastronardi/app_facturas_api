import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { Supplier } from '../entities/supplier.entity';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private readonly supabase: SupabaseService) {}

  /** CREATE */
  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const { data, error } = await this.supabase
      .from('supplier')
      .insert(dto)
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  /** READ ALL */
  async findAll(): Promise<Supplier[]> {
    const { data, error } = await this.supabase
      .from('supplier')
      .select('*');

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  /** READ ONE */
  async findOne(id: number): Promise<Supplier> {
    const { data, error } = await this.supabase
      .from('supplier')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Supplier with id ${id} not found`);
    }
    return data;
  }

  /** UPDATE */
  async update(id: number, dto: UpdateSupplierDto): Promise<Supplier> {
    const { data, error } = await this.supabase
      .from('supplier')
      .update(dto)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new NotFoundException(`Supplier with id ${id} not found`);
    return data;
  }

  /** DELETE */
  async remove(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('supplier')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException(`Supplier with id ${id} not found`);
  }
}
