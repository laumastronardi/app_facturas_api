import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch, ParseIntPipe } from '@nestjs/common';
import { InvoiceService } from '../services/invoice.service';
import { CreateInvoiceDto } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { FilterInvoicesDto } from '../dto/filter-invoice.dto';
import { buildPaginatedResponse } from 'src/common/utils/paginate-response';
import { CurrentUser } from '../../../auth/user.decorator';
import { UserResponse } from '../../../auth/entities/user.entity';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  create(@Body() dto: CreateInvoiceDto, @CurrentUser() user: UserResponse) {
    return this.invoiceService.create(dto);
  }

  @Get()
  findAll(
    @Query() filters: Omit<FilterInvoicesDto,'page'|'limit'>,
    @CurrentUser() user: UserResponse,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    // Transformar status si es un string separado por comas
    let processedFilters = { ...filters };
    if (typeof filters.status === 'string' && filters.status.includes(',')) {
      processedFilters.status = filters.status.split(',').map(s => s.trim());
    }
    
    return this.invoiceService.findAll({ ...processedFilters, page: pageNum, limit: limitNum });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(+id);
  }

  @Put(':id')
  @Patch(':id')
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
