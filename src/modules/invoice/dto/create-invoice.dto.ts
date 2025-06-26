import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { InvoiceStatus } from '../entities/invoice.entity';

export enum InvoiceType {
  A = 'A',
  X = 'X',
}

export class CreateInvoiceDto {
  @Type(() => Number)
  @IsNotEmpty()
  supplierId: number;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(InvoiceType)
  type: InvoiceType;

  @IsNumber()
  @Min(0)
  amount_105: number;

  @IsNumber()
  @Min(0)
  total_neto: number;

  @IsNumber()
  @Min(0)
  vat_amount_21: number;

  @IsNumber()
  @Min(0)
  vat_amount_105: number;

  @IsNumber()
  @Min(0)
  total_amount: number;

  @IsOptional()
  @IsDateString()
  paymentDate?: string; 

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsDateString()
  date?: string; 
}
