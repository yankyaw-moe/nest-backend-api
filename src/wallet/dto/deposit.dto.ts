import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DepositDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @Min(0.01, { message: 'Amount must be greater than 0' })
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;
}