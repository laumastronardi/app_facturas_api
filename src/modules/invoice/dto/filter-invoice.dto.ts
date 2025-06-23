import { IsOptional, IsString, IsNumber, IsIn, IsDateString, IsArray, IsEnum, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FilterInvoicesDto {
  @IsOptional()
  @IsEnum(['to_pay','prepared','paid'], { each: true })
  status?: string | string[];

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
  @IsNumber() @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber() @Min(1)
  limit?: number;
}
