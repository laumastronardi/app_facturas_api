import { IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceDto } from './create-invoice.dto';

export class ProcessInvoiceImageDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  supplierId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceThreshold?: number = 95; // Umbral mínimo de confianza optimizado para precisión
}

export class OcrResultDto {
  invoiceData: Partial<CreateInvoiceDto>;
  confidence: number;
  extractedText: string;
  supplierInfo?: {
    name: string | null;
    cuit: string | null;
  };
  requiresSupplierSelection: boolean;
}
