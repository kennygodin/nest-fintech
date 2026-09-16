import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Request } from 'express';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(@Req() req: Request, @Query() query: PaginationDto) {
    return this.notificationsService.listForUser(
      req.user!.id,
      query.page,
      query.limit,
    );
  }

  @Patch(':id/read')
  async markAsRead(@Req() req: Request, @Param('id') id: string) {
    return this.notificationsService.markAsRead(req.user!.id, id);
  }
}
