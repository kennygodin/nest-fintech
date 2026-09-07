import { SafeUser } from 'src/modules/users/types/safe-user.type';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { AUTH_MESSAGES } from 'src/modules/auth/auth.constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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

  login(user: SafeUser) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      accessToken: this.jwtService.sign(payload),
    };
  }
}
