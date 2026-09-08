import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiPropertyOptional({ example: 'a1b2c3...' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
