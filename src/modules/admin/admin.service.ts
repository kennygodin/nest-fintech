import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { UserStatus } from 'generated/prisma/enums';
import { USER_MESSAGES } from 'src/modules/users/users.constants';
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from 'src/modules/admin/admin.constants';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createAdmin(
    superAdminId: string,
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const newAdmin = await this.usersService.createAdminUser(email, password);

    await this.auditLogService.log(
      superAdminId,
      AUDIT_ACTIONS.CREATE_ADMIN,
      AUDIT_ENTITY_TYPES.USER,
      newAdmin.id,
      { email },
      ipAddress,
      userAgent,
    );

    return newAdmin;
  }

  async updateUserStatus(
    adminId: string,
    targetUserId: string,
    status: UserStatus,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.usersService.findById(targetUserId);

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    const updatedUser = await this.usersService.updateStatus(
      targetUserId,
      status,
    );

    await this.auditLogService.log(
      adminId,
      AUDIT_ACTIONS.UPDATE_USER_STATUS,
      AUDIT_ENTITY_TYPES.USER,
      targetUserId,
      { newStatus: status },
      ipAddress,
      userAgent,
    );

    return updatedUser;
  }
}
