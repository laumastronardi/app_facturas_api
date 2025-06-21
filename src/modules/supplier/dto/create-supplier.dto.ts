import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  cbu?: string;

  @IsOptional()
  @IsNumber()
  paymentTerm?: number;
}
