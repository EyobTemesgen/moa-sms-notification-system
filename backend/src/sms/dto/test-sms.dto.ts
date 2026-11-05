import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class TestSmsDto {
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  message?: string;

  @IsString()
  @IsOptional()
  gatewayUrl?: string;

  @IsString()
  @IsOptional()
  apiKey?: string;
}

