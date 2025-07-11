import { IsOptional, IsNumber, Min, Max, IsEnum, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceDto } from './create-invoice.dto';

export enum OcrEngine {
  OPENAI = 'openai',
  MOCK = 'mock'
}

export enum Language {
  SPA = 'spa',
  ENG = 'eng',
  POR = 'por'
}

export class ProcessInvoiceImageDto {
  @ApiProperty({
    description: 'ID del proveedor (opcional)',
    required: false,
    example: 1
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  supplierId?: number;

  @ApiProperty({
    description: 'Umbral mínimo de confianza (0-100)',
    required: false,
    minimum: 0,
    maximum: 100,
    default: 95,
    example: 95
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(100)
  confidenceThreshold?: number = 95;

  @ApiProperty({
    description: 'Idioma para el procesamiento OCR',
    required: false,
    enum: Language,
    default: Language.SPA,
    example: 'spa'
  })
  @IsOptional()
  @IsEnum(Language)
  language?: Language = Language.SPA;

  @ApiProperty({
    description: 'Motor de OCR a utilizar',
    required: false,
    enum: OcrEngine,
    default: OcrEngine.OPENAI,
    example: 'openai'
  })
  @IsOptional()
  @IsEnum(OcrEngine)
  ocrEngine?: OcrEngine = OcrEngine.OPENAI;

  @ApiProperty({
    description: 'Temperatura para OpenAI (0.0-2.0). Valores más bajos = más determinístico',
    required: false,
    minimum: 0,
    maximum: 2,
    default: 0.1,
    example: 0.1
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number = 0.1;
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
