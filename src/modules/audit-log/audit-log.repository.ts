import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(skip: number, take: number) {
    const [logs, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: { admin: { select: { email: true } } },
      }),

      this.prisma.auditLog.count(),
    ]);

    return {
      logs,
      total,
    };
  }
  async create(
    adminId: string,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: object,
    ipAddress?: string,
    userAgent?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId,
        metadata: metadata ?? Prisma.JsonNull,
        ipAddress,
        userAgent,
      },
    });
  }
}
