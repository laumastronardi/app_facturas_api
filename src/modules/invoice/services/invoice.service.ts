import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from '../entities/invoice.entity';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { Supplier } from '../../supplier/entities/supplier.entity';
import { FilterInvoicesDto } from '../dto/filter-invoice.dto';
import { buildPaginatedResponse } from 'src/common/utils/paginate-response';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,

    @InjectRepository(Supplier)
    private supplierRepo: Repository<Supplier>,
  ) {}

  async create(dto: CreateInvoiceDto): Promise<Invoice> {
    const supplier = await this.supplierRepo.findOneBy({ id: dto.supplierId });
    if (!supplier) {
      throw new NotFoundException(`Supplier with id ${dto.supplierId} not found`);
    }

    const invoice = this.invoiceRepo.create({
      ...dto,
      supplier,
    });

    return this.invoiceRepo.save(invoice);
  }

  async findAll(filters: FilterInvoicesDto & { page?: number; limit?: number }) {
    const { status, type, supplierId, fromDate, toDate, page = 1, limit = 10 } = filters;

    const qb = this.invoiceRepo
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.supplier', 'supplier')
      .orderBy('invoice.date', 'DESC');

    let statusArray: string[] | undefined;
    if (status) {
      statusArray = Array.isArray(status)
        ? status
        : (status as string).split(',').map((s) => s.trim());
    }
    if (statusArray && statusArray.length > 0) {
      qb.andWhere('invoice.status IN (:...statuses)', { statuses: statusArray });
    }
    if (type)       qb.andWhere('invoice.type = :type',       { type });
    if (supplierId) qb.andWhere('invoice.supplierId = :supplierId', { supplierId });
    if (fromDate)   qb.andWhere('invoice.date >= :fromDate',   { fromDate });
    if (toDate)     qb.andWhere('invoice.date <= :toDate',     { toDate });

    qb.skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return buildPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOne({
      where: { id },
      relations: ['supplier'],
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return invoice;
  }

  async update(id: number, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.invoiceRepo.preload({id, ...dto});

    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} not found`);
    }

    return this.invoiceRepo.save(invoice);
  }

  async remove(id: number): Promise<void> {
    const invoice = await this.findOne(id);
    await this.invoiceRepo.remove(invoice);
  }

  async markAsPaid(id: number, date: string): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findOneBy({ id });
    if (!invoice) throw new NotFoundException('Invoice not found');

    invoice.status = InvoiceStatus.PAID;
    invoice.paymentDate = new Date(date);
    return this.invoiceRepo.save(invoice);
  }

}
