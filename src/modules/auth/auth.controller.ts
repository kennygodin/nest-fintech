import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoginUserDto } from 'src/modules/auth/dto/login.dto';
import { AUTH_MESSAGES } from 'src/modules/auth/auth.constants';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login User' })
  @ResponseMessage(AUTH_MESSAGES.LOGIN_SUCCESS)
  async login(@Body() dto: LoginUserDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);

    return this.authService.login(user);
  }
}
