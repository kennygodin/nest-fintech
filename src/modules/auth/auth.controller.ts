import {
  Res,
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { AuthService } from 'src/modules/auth/auth.service';
import { LoginUserDto } from 'src/modules/auth/dto/login.dto';
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto';
import {
  AUTH_MESSAGES,
  ClientType,
  isClientType,
} from 'src/modules/auth/auth.constants';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshTokenCookie(
    res: Response,
    refreshToken: string,
    expiresAt: Date,
  ) {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.configService.get('app.nodeEnv') === 'production',
      sameSite: 'strict',
      expires: expiresAt,
    });
  }

  @Post('logout-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Log out of all devices' })
  @ResponseMessage(AUTH_MESSAGES.LOGOUT_ALL_SUCCESS)
  async logoutAll(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(req.user!.id);
    res.clearCookie('refreshToken');
  }

  @Post('logout')
  @ApiOperation({ summary: 'Log out this device' })
  @ResponseMessage(AUTH_MESSAGES.LOGOUT_SUCCESS)
  async logout(
    @Body() dto: RefreshTokenDto,
    @Headers('x-client-type') clientType: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!isClientType(clientType)) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_CLIENT_TYPE);
    }

    const rawToken =
      clientType === ClientType.WEB
        ? (req.cookies?.refreshToken as string | undefined)
        : dto.refreshToken;

    if (rawToken) {
      await this.authService.logout(rawToken);
    }

    if (clientType === ClientType.WEB) {
      res.clearCookie('refreshToken');
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ResponseMessage(AUTH_MESSAGES.REFRESH_SUCCESS)
  async refresh(
    @Body() dto: RefreshTokenDto,
    @Headers('x-client-type') clientType: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!isClientType(clientType)) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_CLIENT_TYPE);
    }

    const rawToken =
      clientType === ClientType.WEB
        ? (req.cookies?.refreshToken as string | undefined)
        : dto.refreshToken;

    if (!rawToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    const { refreshToken, refreshTokenExpiresAt, ...result } =
      await this.authService.refreshTokens(rawToken);

    if (clientType === ClientType.WEB) {
      this.setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresAt);

      return result;
    }

    return { ...result, refreshToken };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login User' })
  @ResponseMessage(AUTH_MESSAGES.LOGIN_SUCCESS)
  async login(
    @Body() dto: LoginUserDto,
    @Headers('x-client-type') clientType: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!isClientType(clientType)) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_CLIENT_TYPE);
    }

    const user = await this.authService.validateUser(dto.email, dto.password);

    const { refreshToken, refreshTokenExpiresAt, ...result } =
      await this.authService.login(user);

    if (clientType === ClientType.WEB) {
      this.setRefreshTokenCookie(res, refreshToken, refreshTokenExpiresAt);

      return result;
    }

    return { ...result, refreshToken };
  }
}
