// src/invoices/invoices.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { buildPaginatedResponse } from 'src/common/utils/paginate-response';
import { SupabaseService } from 'src/supabase/supabase.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { FilterInvoicesDto } from '../dto/filter-invoice.dto';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';

@Injectable()
export class InvoiceService {
  constructor(private readonly supabase: SupabaseService) {}

  /** CREATE */
  async create(dto: CreateInvoiceDto): Promise<Invoice> {

      const payload = {
      date:        dto.date,
      amount:      dto.amount,
      status:      dto.status,
      supplier_id: dto.supplierId,
      type:        dto.type,
      vat:         dto.vat,
    };

    const { data, error } = await this.supabase
      .from('invoice')
      .insert([payload])
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  /** LIST with filters + pagination */
  async findAll(filters: FilterInvoicesDto & { page?: number; limit?: number }) {
    const { status, type, supplierId, fromDate, toDate, page = 1, limit = 10 } = filters;
    const from = (page - 1) * limit;
    const to   = page * limit - 1;

    // armamos query HTTP a Supabase
    let qb = this.supabase
      .from('invoice')
      .select('*, supplier(*)', { count: 'exact' })
      .order('date', { ascending: false })
      .range(from, to);

    if (status)     qb = Array.isArray(status)
      ? qb.in('status', status)
      : qb.eq('status', status);
    if (type)       qb = qb.eq('type', type);
    if (supplierId) qb = qb.eq('supplier_id', supplierId);
    if (fromDate)   qb = qb.gte('date', fromDate);
    if (toDate)     qb = qb.lte('date', toDate);

    const { data, error, count } = await qb;
    if (error) throw new BadRequestException(error.message);

    return buildPaginatedResponse(data ?? [], count ?? 0, page, limit);
  }

  /** READ one by id */
  async findOne(id: number): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoice')
      .select('*, supplier(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException(`Invoice with id ${id} not found`);
    return data;
  }

  /** UPDATE */
  async update(id: number, dto: UpdateInvoiceDto): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoice')
      .update({ 
        date: dto.date,
        amount: dto.amount,
        status: dto.status,
        type: dto.type,
        vat: dto.vat,
        supplier_id: dto.supplierId,  // <-- aquí también
      })  
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new NotFoundException(`Invoice with id ${id} not found`);
    return data;
  }

  /** DELETE */
  async remove(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('invoice')
      .delete()
      .eq('id', id);

    if (error) throw new NotFoundException(`Invoice with id ${id} not found`);
  }

  /** MARK AS PAID */
  async markAsPaid(id: number, paymentDate: string): Promise<Invoice> {
    const { data, error } = await this.supabase
      .from('invoice')
      .update({ status: InvoiceStatus.PAID, paymentDate })
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new NotFoundException(`Invoice with id ${id} not found`);
    return data;
  }
}
