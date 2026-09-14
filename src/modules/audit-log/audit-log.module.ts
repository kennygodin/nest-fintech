import { Module } from '@nestjs/common';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { AuditLogRepository } from 'src/modules/audit-log/audit-log.repository';

@Module({
  providers: [AuditLogService, AuditLogRepository],
  exports: [AuditLogService],
  controllers: [],
})
export class AuditLogModule {}
