import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from 'src/modules/audit-log/audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async log(
    adminId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: object,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.auditLogRepository.create(
      adminId,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress,
      userAgent,
    );
  }
}
