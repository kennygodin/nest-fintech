import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class TransferDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  recipientEmail: string;

  @ApiProperty({ example: 500000, description: 'Amount to transfer in kobo' })
  @IsInt()
  @Min(100)
  amount: number;

  @ApiPropertyOptional({ example: 'Rent payment' })
  @IsOptional()
  @IsString()
  description?: string;
}
