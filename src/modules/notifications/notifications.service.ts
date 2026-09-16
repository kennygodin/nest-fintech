import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { NOTIFICATION_MESSAGE } from './notifications.constant';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  async create(userId: string, type: string, title: string, message: string) {
    return this.notificationsRepository.create(userId, type, title, message);
  }

  async listForUser(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const { notifications, total } =
      await this.notificationsRepository.findManyForUser(userId, skip, limit);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification =
      await this.notificationsRepository.findById(notificationId);

    if (!notification || notification.userId !== userId) {
      throw new NotFoundException(NOTIFICATION_MESSAGE.NOT_FOUND);
    }

    return this.notificationsRepository.markAsRead(notificationId);
  }
}
