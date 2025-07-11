// src/suppliers/suppliers.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { SupplierService } from '../services/supplier.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { validateCuit, formatCuit, getCuitType } from '../../../common/utils/cuit-validator';
import { Public } from '../../../auth/public.decorator';
@ApiTags('suppliers')
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  /** Health check: debe ir antes de la ruta dinámica :id */
  @Get('health')
  @ApiOperation({ summary: 'Health check del servicio de proveedores' })
  health() {
    return { status: 'OK' };
  }

  /** Validar CUIT */
  @Get('validate-cuit')
  @Public()
  @ApiOperation({ summary: 'Validar formato y dígito verificador de CUIT' })
  @ApiQuery({ 
    name: 'cuit', 
    description: 'CUIT a validar (formato XX-XXXXXXXX-X o solo números)',
    example: '30-71056429-7'
  })
  validateCuit(@Query('cuit') cuit: string) {
    if (!cuit) {
      return { valid: false, message: 'Se requiere proporcionar un CUIT' };
    }

    const isValid = validateCuit(cuit);
    const formatted = formatCuit(cuit);
    const type = isValid ? getCuitType(cuit) : null;

    return {
      valid: isValid,
      original: cuit,
      formatted: formatted,
      type: type,
      message: isValid 
        ? 'CUIT válido' 
        : 'CUIT inválido: formato incorrecto o dígito verificador no coincide'
    };
  }

  /** CREATE */
  @Post()
  @ApiOperation({ summary: 'Crear nuevo proveedor' })
  create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  /** READ ALL */
  @Get()
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  findAll() {
    return this.supplierService.findAll();
  }

  /** READ ONE */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.findOne(id);
  }

  /** UPDATE */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSupplierDto
  ) {
    return this.supplierService.update(id, dto);
  }

  /** DELETE */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proveedor' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.supplierService.remove(id);
  }
}
