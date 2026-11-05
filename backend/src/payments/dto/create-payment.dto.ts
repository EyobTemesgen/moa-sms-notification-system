import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  @IsNotEmpty()
  voucherRef: string;

  @IsString()
  @IsNotEmpty()
  payeeName: string;

  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @IsString()
  @IsNotEmpty()
  paymentDate: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

