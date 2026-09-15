import { Module } from '@nestjs/common';
import { AdminController } from 'src/modules/admin/admin.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { AdminService } from 'src/modules/admin/admin.service';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';
import { AdminSeedService } from 'src/modules/admin/admin-seed.service';
import { WalletModule } from 'src/modules/wallet/wallet.module';
import { AdminRepository } from 'src/modules/admin/admin.repository';

@Module({
  imports: [UsersModule, AuditLogModule, WalletModule],
  controllers: [AdminController],
  providers: [AdminService, AdminSeedService, AdminRepository],
  exports: [],
})
export class AdminModule {}
