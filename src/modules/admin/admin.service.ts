import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { UserStatus, WalletStatus } from 'generated/prisma/enums';
import {
  AUDIT_ACTIONS,
  AUDIT_ENTITY_TYPES,
} from 'src/modules/admin/admin.constants';
import { WalletService } from 'src/modules/wallet/wallet.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
    private readonly walletService: WalletService,
  ) {}

  async getUserById(id: string) {
    return this.usersService.findByIdSafe(id);
  }

  async updateWalletStatus(
    adminId: string,
    walletId: string,
    status: WalletStatus,
    ipAddress?: string,
    userAgent?: string,
  ) {
    await this.walletService.getWalletById(walletId);

    const updatedWallet = await this.walletService.updateStatus(
      walletId,
      status,
    );

    await this.auditLogService.log(
      adminId,
      AUDIT_ACTIONS.UPDATE_WALLET_STATUS,
      AUDIT_ENTITY_TYPES.WALLET,
      walletId,
      { newStatus: status },
      ipAddress,
      userAgent,
    );

    const messages: Record<WalletStatus, string> = {
      [WalletStatus.active]: 'Wallet unfrozen',
      [WalletStatus.frozen]: 'Wallet frozen',
      [WalletStatus.closed]: 'Wallet closed',
    };

    return {
      message: messages[status],
      data: {
        id: updatedWallet.id,
        status: updatedWallet.status,
      },
    };
  }

  async createAdmin(
    adminId: string,
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const newAdmin = await this.usersService.createAdminUser(email, password);

    await this.auditLogService.log(
      adminId,
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
    await this.usersService.findById(targetUserId);

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

    const messages: Record<UserStatus, string> = {
      [UserStatus.active]: 'User activated',
      [UserStatus.suspended]: 'User suspended',
      [UserStatus.deactivated]: 'User deactivated',
    };

    return {
      message: messages[status],
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        status: updatedUser.status,
      },
    };
  }
}
