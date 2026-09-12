import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({ example: 500000, description: 'Amount to withdraw in kobo' })
  @IsInt()
  @Min(100)
  amount: number;

  @ApiPropertyOptional({ example: 'ATM payment' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'false',
    description: 'Testing only: force this withdrawal to fail and reverse',
  })
  @IsBoolean()
  @IsOptional()
  simulateFailure?: boolean;
}
