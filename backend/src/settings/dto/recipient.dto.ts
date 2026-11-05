import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateRecipientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateRecipientDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

