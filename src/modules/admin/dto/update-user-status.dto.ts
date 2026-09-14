import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { UserStatus } from 'generated/prisma/enums';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.suspended })
  @IsEnum(UserStatus)
  status: UserStatus;
}
