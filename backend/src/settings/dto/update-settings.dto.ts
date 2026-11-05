import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsNumber()
  @IsOptional()
  thresholdAmount?: number;

  @IsBoolean()
  @IsOptional()
  isAlertEnabled?: boolean;

  @IsString()
  @IsOptional()
  smsProvider?: 'mock' | 'http';

  @IsString()
  @IsOptional()
  smsGatewayUrl?: string;

  @IsString()
  @IsOptional()
  smsGatewayKey?: string;

  @IsString()
  @IsOptional()
  smsSenderId?: string;
}

