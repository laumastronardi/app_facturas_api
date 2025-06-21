import { IsOptional, IsString, IsNumber, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterInvoicesDto {
  @IsOptional()
  @IsIn(['to_pay', 'prepared', 'paid'])
  status?: string;

  @IsOptional()
  @IsIn(['A', 'X'])
  type?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  supplierId?: number;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
