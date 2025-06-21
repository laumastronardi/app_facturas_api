import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { FilterInvoicesDto } from '../dto/filter-invoice.dto';
import { buildPaginatedResponse } from 'src/common/utils/paginate-response';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoiceService.create(dto);
  }

  @Get()
  findAll(@Query() filters: FilterInvoicesDto) {
    return this.invoiceService.findAll(filters);
  } 

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.invoiceService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.invoiceService.remove(+id);
  }

  @Put(':id/pay')
  markAsPaid(
    @Param('id') id: string,
    @Body('date') date: string,
  ) {
    return this.invoiceService.markAsPaid(+id, date);
  }
}
