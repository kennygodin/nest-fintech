import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
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

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.admin, Role.superadmin)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminService: AdminService,
  ) {}

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
