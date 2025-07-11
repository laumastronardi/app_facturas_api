import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { IsCuit } from '../../../common/decorators/is-cuit.decorator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsCuit({ message: 'El CUIT debe ser válido y tener el formato XX-XXXXXXXX-X' })
  cuit: string;

  @IsOptional()
  @IsString()
  cbu?: string;

  @IsOptional()
  @IsNumber()
  paymentTerm?: number;
}
