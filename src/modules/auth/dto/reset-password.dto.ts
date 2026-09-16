import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/, { message: 'Reset code must be exactly 6 digits' })
  token: string;

  @ApiProperty({ example: 'QWEasd23!' })
  @IsString()
  newPassword: string;
}
