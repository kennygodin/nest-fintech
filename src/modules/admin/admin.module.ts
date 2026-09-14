import { Module } from '@nestjs/common';
import { AdminController } from 'src/modules/admin/admin.controller';
import { UsersModule } from 'src/modules/users/users.module';
import { AdminService } from 'src/modules/admin/admin.service';
import { AuditLogModule } from 'src/modules/audit-log/audit-log.module';
import { AdminSeedService } from 'src/modules/admin/admin-seed.service';

@Module({
  imports: [UsersModule, AuditLogModule],
  controllers: [AdminController],
  providers: [AdminService, AdminSeedService],
  exports: [],
})
export class AdminModule {}
