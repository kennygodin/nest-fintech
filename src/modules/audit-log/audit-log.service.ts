import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from 'src/modules/audit-log/audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async listAuditLogs(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { logs, total } = await this.auditLogRepository.findMany(skip, limit);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

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
