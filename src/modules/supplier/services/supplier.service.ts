import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../../supabase/supabase.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { Supplier } from '../entities/supplier.entity';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { formatCuit, validateCuit } from '../../../common/utils/cuit-validator';

@Injectable()
export class SupplierService {
  constructor(private readonly supabase: SupabaseService) {}

  /** CREATE */
  async create(dto: CreateSupplierDto): Promise<Supplier> {
    // Validar y formatear CUIT
    if (dto.cuit && !validateCuit(dto.cuit)) {
      throw new BadRequestException('El CUIT proporcionado no es válido');
    }

    // Formatear CUIT al formato estándar
    const formattedDto = {
      ...dto,
      cuit: dto.cuit ? formatCuit(dto.cuit) : dto.cuit
    };

    // Verificar que no exista otro proveedor con el mismo CUIT
    if (formattedDto.cuit) {
      const { data: existingSupplier } = await this.supabase
        .from('supplier')
        .select('id, name')
        .eq('cuit', formattedDto.cuit)
        .single();

      if (existingSupplier) {
        throw new BadRequestException(
          `Ya existe un proveedor con el CUIT ${formattedDto.cuit}: ${existingSupplier.name}`
        );
      }
    }

    const { data, error } = await this.supabase
      .from('supplier')
      .insert(formattedDto)
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
    // Si se está actualizando el CUIT, validarlo
    if (dto.cuit !== undefined) {
      if (dto.cuit && !validateCuit(dto.cuit)) {
        throw new BadRequestException('El CUIT proporcionado no es válido');
      }

      // Formatear CUIT al formato estándar
      dto.cuit = dto.cuit ? formatCuit(dto.cuit) : dto.cuit;

      // Verificar que no exista otro proveedor con el mismo CUIT
      if (dto.cuit) {
        const { data: existingSupplier } = await this.supabase
          .from('supplier')
          .select('id, name')
          .eq('cuit', dto.cuit)
          .neq('id', id) // Excluir el proveedor actual
          .single();

        if (existingSupplier) {
          throw new BadRequestException(
            `Ya existe otro proveedor con el CUIT ${dto.cuit}: ${existingSupplier.name}`
          );
        }
      }
    }

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
