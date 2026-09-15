import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { WalletStatus } from 'generated/prisma/enums';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class SearchWalletsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: WalletStatus })
  @IsOptional()
  @IsEnum(WalletStatus)
  status?: WalletStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;
}
