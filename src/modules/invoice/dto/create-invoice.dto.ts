import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum InvoiceType {
  A = 'A',
  X = 'X',
}

export enum VatRate {
  IVA_21 = 21,
  IVA_105 = 10.5,
}

export class CreateInvoiceDto {
  @Type(() => Number)
  @IsNotEmpty()
  supplierId: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsEnum(InvoiceType)
  type: InvoiceType;

  @IsOptional()
  @IsEnum(VatRate)
  vat?: VatRate;

  @IsOptional()
  @IsDateString()
  paymentDate?: string; 
}
