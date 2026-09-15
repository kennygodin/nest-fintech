import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Role } from 'generated/prisma/enums';
import { UsersService } from 'src/modules/users/users.service';
import { UpdateUserStatusDto } from 'src/modules/admin/dto/update-user-status.dto';
import { AdminService } from 'src/modules/admin/admin.service';
import { Request } from 'express';
import { CreateAdminDto } from 'src/modules/admin/dto/create-admin.dto';
import { UpdateWalletStatusDto } from 'src/modules/admin/dto/update-wallet-status.dto';
import { AuditLogService } from 'src/modules/audit-log/audit-log.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.admin, Role.superadmin)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard metrics' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get a single user by id' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'View the admin audit trail' })
  async listAuditLogs(@Query() query: PaginationDto) {
    return this.auditLogService.listAuditLogs(query.page, query.limit);
  }

  @Patch('wallets/:id/status')
  @ApiOperation({ summary: 'Suspend, activate or deactivate a wallet' })
  async updateWalletStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateWalletStatusDto,
  ) {
    return this.adminService.updateWalletStatus(
      req.user!.id,
      id,
      dto.status,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('admins')
  @Roles(Role.superadmin)
  @ApiOperation({ summary: 'Create a new admin account (superadmin only)' })
  async createAdmin(@Req() req: Request, @Body() dto: CreateAdminDto) {
    return this.adminService.createAdmin(
      req.user!.id,
      dto.email,
      dto.password,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: "Suspend or reactivate a user's account" })
  async updateUserStatus(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(
      req.user!.id,
      id,
      dto.status,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Get('users')
  findAllUsers() {
    return this.usersService.findAll();
  }
}
