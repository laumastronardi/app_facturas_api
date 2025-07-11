import { Controller, Get, Post, Body, Param, Put, Delete, Query, Patch, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InvoiceService } from '../services/invoice.service';
import { OcrService } from '../services/ocr.service';
import { CreateInvoiceDto, InvoiceType } from '../dto/create-invoice.dto';
import { UpdateInvoiceDto } from '../dto/update-invoice.dto';
import { FilterInvoicesDto } from '../dto/filter-invoice.dto';
import { ProcessInvoiceImageDto, OcrResultDto } from '../dto/process-image.dto';
import { buildPaginatedResponse } from 'src/common/utils/paginate-response';
import { CurrentUser } from '../../../auth/user.decorator';
import { UserResponse } from '../../../auth/entities/user.entity';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { InvoiceStatus } from '../entities/invoice.entity';
import { SupabaseService } from '../../../supabase/supabase.service';

@ApiTags('invoices')
@ApiBearerAuth()
@Controller('invoices')
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly ocrService: OcrService,
    private readonly supabaseService: SupabaseService,
  ) {}

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

  @Post('process-image')
  @ApiOperation({ summary: 'Procesar imagen de factura con OCR' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Imagen de factura para procesar',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de la factura (JPEG, PNG)',
        },
        supplierId: {
          type: 'number',
          description: 'ID del proveedor (opcional)',
        },
        confidenceThreshold: {
          type: 'number',
          description: 'Umbral mínimo de confianza (0-100)',
          default: 95,
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new BadRequestException('Solo se permiten archivos JPG, JPEG y PNG'), false);
      }
      callback(null, true);
    },
  }))
  async processInvoiceImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ProcessInvoiceImageDto,
    @CurrentUser() user: UserResponse,
  ): Promise<OcrResultDto> {
    if (!file) {
      throw new BadRequestException('Se requiere una imagen de factura');
    }

    try {
      const ocrResult = await this.ocrService.processInvoiceImage(file.buffer, dto);
      
      // Verificar umbral de confianza
      if (ocrResult.confidence < (dto.confidenceThreshold || 95)) {
        throw new BadRequestException(
          `La confianza del OCR (${ocrResult.confidence}%) está por debajo del umbral mínimo (${dto.confidenceThreshold || 95}%)`
        );
      }

      // Si se proporcionó un supplierId, usarlo
      if (dto.supplierId) {
        ocrResult.invoiceData.supplierId = dto.supplierId;
      }

      return {
        invoiceData: ocrResult.invoiceData,
        confidence: ocrResult.confidence,
        extractedText: ocrResult.extractedText,
        supplierInfo: ocrResult.supplierInfo ? {
          name: ocrResult.supplierInfo.name,
          cuit: ocrResult.supplierInfo.cuit || null,
        } : undefined,
        requiresSupplierSelection: !ocrResult.invoiceData.supplierId,
      };
    } catch (error) {
      throw new BadRequestException(`Error procesando la imagen: ${error.message}`);
    }
  }

  @Post('create-from-ocr')
  @ApiOperation({ summary: 'Crear factura desde datos de OCR' })
  async createFromOcr(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: UserResponse,
  ) {
    // Validar que el supplierId esté presente
    if (!dto.supplierId) {
      throw new BadRequestException('Se requiere seleccionar un proveedor');
    }

    return this.invoiceService.create(dto);
  }

  @Post('process-image-mock')
  @ApiOperation({ summary: 'DEMO: Simular procesamiento OCR (sin OpenAI)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Imagen de factura para simular procesamiento',
    type: 'multipart/form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de la factura (JPEG, PNG)',
        },
        supplierId: {
          type: 'number',
          description: 'ID del proveedor (opcional)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
        return callback(new BadRequestException('Solo se permiten archivos JPG, JPEG y PNG'), false);
      }
      callback(null, true);
    },
  }))
  async processInvoiceImageMock(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ProcessInvoiceImageDto,
    @CurrentUser() user: UserResponse,
  ): Promise<OcrResultDto> {
    if (!file) {
      throw new BadRequestException('Se requiere una imagen de factura');
    }

    // Simular datos extraídos (valores de ejemplo)
    const mockInvoiceData = {
      amount: 10000,
      amount_105: 1050,
      total_neto: 10000,
      vat_amount_21: 2100,
      vat_amount_105: 1050,
      total_amount: 13150,
      date: "2024-01-15",
      type: InvoiceType.A,
      status: InvoiceStatus.TO_PAY,
      supplierId: dto.supplierId || undefined,
    };

    return {
      invoiceData: mockInvoiceData,
      confidence: 85,
      extractedText: "DEMO: Datos simulados - Factura A, Proveedor Test, Total: $13,150.00",
      supplierInfo: {
        name: "Proveedor Test DEMO",
        cuit: "20-12345678-9" as string | null
      },
      requiresSupplierSelection: !dto.supplierId,
    };
  }

  @Post('create-from-ocr-auto')
  @ApiOperation({ summary: 'Crear factura desde OCR con búsqueda automática de proveedor por CUIT únicamente' })
  async createFromOcrAuto(
    @Body() body: { 
      invoiceData: {
        amount: number;
        amount_105: number;
        total_neto: number;
        vat_amount_21: number;
        vat_amount_105: number;
        total_amount: number;
        date: string;
        type: string;
        status: string;
      };
      supplierInfo?: {
        name: string | null;
        cuit: string | null;
      };
      supplierName?: string;
      supplierId?: number;
    },
    @CurrentUser() user: UserResponse,
  ) {
    const { invoiceData, supplierInfo, supplierName, supplierId } = body;
    
    // Si ya se proporcionó un supplierId, usarlo directamente
    let finalSupplierId = supplierId;
    
    // Si no hay supplierId, buscar el proveedor SOLO por CUIT
    if (!finalSupplierId && supplierInfo?.cuit) {
      const result = await this.supabaseService
        .from('supplier')
        .select('id, name, cuit')
        .eq('cuit', supplierInfo.cuit);
      
      if (result.error) {
        throw new BadRequestException(`Error buscando proveedor: ${result.error.message}`);
      }
      
      if (result.data && result.data.length > 0) {
        finalSupplierId = result.data[0].id;
        console.log(`✅ Proveedor encontrado por CUIT: ${supplierInfo.cuit} -> ID: ${finalSupplierId}`);
      } else {
        console.log(`❌ No se encontró proveedor con CUIT: ${supplierInfo.cuit}`);
        throw new BadRequestException(
          `No se encontró el proveedor con CUIT: ${supplierInfo.cuit}. ` +
          `Créalo primero con: POST /suppliers {"name": "${supplierInfo?.name || 'Nombre del Proveedor'}", "cuit": "${supplierInfo.cuit}", "cbu": "...", "paymentTerm": 30}`
        );
      }
    }
    
    // Validar que tengamos un supplierId
    if (!finalSupplierId) {
      throw new BadRequestException('Se requiere proporcionar supplierId o supplierInfo con CUIT válido');
    }

    // Crear la factura con los datos
    const invoiceDto: CreateInvoiceDto = {
      supplierId: finalSupplierId,
      amount: invoiceData.amount,
      amount_105: invoiceData.amount_105,
      total_neto: invoiceData.total_neto,
      vat_amount_21: invoiceData.vat_amount_21,
      vat_amount_105: invoiceData.vat_amount_105,
      total_amount: invoiceData.total_amount,
      date: invoiceData.date,
      type: invoiceData.type as InvoiceType,
      status: invoiceData.status as InvoiceStatus,
    };

    return this.invoiceService.create(invoiceDto);
  }
}
