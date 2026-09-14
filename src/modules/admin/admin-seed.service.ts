import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const existingSuperAdmin = await this.prisma.user.findFirst({
      where: { role: Role.superadmin },
    });

    if (existingSuperAdmin) {
      return;
    }

    const email = this.configService.get<string>('superadmin.email');
    const password = this.configService.get<string>('superadmin.password');

    if (!email || !password) {
      this.logger.warn(
        'No superadmin exists and SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD are not set — skipping superadmin creation.',
      );
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await this.prisma.user.create({
      data: { email, passwordHash, role: Role.superadmin },
    });

    this.logger.log(`Superadmin account created: ${email}`);
  }
}
