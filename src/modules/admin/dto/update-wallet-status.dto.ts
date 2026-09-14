import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { WalletStatus } from 'generated/prisma/enums';

export class UpdateWalletStatusDto {
  @ApiProperty({ enum: WalletStatus, example: WalletStatus.active })
  @IsEnum(WalletStatus)
  status: WalletStatus;
}
