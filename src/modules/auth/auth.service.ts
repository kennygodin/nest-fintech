import { SafeUser } from 'src/modules/users/types/safe-user.type';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { AUTH_MESSAGES } from 'src/modules/auth/auth.constants';
import { AuthRepository } from 'src/modules/auth/auth.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authRepository: AuthRepository,
    private readonly configService: ConfigService,
  ) {}

  async logoutAll(userId: string) {
    await this.authRepository.revokeAllRefreshTokensForUser(userId);
  }

  async logout(rawToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const storedToken =
      await this.authRepository.findRefreshTokenByHash(tokenHash);

    if (storedToken && !storedToken.revokedAt) {
      await this.authRepository.revokeRefreshToken(storedToken.id);
    }
  }

  async refreshTokens(rawToken: string) {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const storedToken =
      await this.authRepository.findRefreshTokenByHash(tokenHash);

    if (!storedToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    if (storedToken.revokedAt) {
      await this.authRepository.revokeAllRefreshTokensForUser(
        storedToken.userId,
      );
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    if (storedToken.expiresAt < new Date()) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }

    await this.authRepository.revokeRefreshToken(storedToken.id);

    const user = await this.usersService.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH_TOKEN);
    }
    return this.login({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private generateRefreshToken(): { token: string; tokenHash: string } {
    const token = crypto.randomBytes(40).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    return { token, tokenHash };
  }

  async login(user: SafeUser) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const { token, tokenHash } = this.generateRefreshToken();

    const ttlDays = this.configService.getOrThrow<number>(
      'refreshToken.ttlDays',
    );
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);

    await this.authRepository.createRefreshToken(user.id, tokenHash, expiresAt);

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      refreshToken: token,
      accessToken: this.jwtService.sign(payload),
      refreshTokenExpiresAt: expiresAt,
    };
  }

  async validateUser(email: string, password: string): Promise<SafeUser> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
