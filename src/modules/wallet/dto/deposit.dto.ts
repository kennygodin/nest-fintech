import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class DepositDto {
  @ApiProperty({ example: 500000, description: 'Amount to deposit in kobo' })
  @IsInt()
  @Min(100)
  amount: number;

  @ApiPropertyOptional({ example: 'Wallet top-up' })
  @IsOptional()
  @IsString()
  description?: string;
}
