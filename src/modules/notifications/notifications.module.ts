import { Module } from '@nestjs/common';
import { NotificationsController } from 'src/modules/notifications/notifications.controller';
import { NotificationsRepository } from 'src/modules/notifications/notifications.repository';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsProcessor } from 'src/modules/notifications/notifications.processor';
import { NotificationsProducer } from 'src/modules/notifications/notifications.producer';

@Module({
  imports: [BullModule.registerQueue({ name: 'notifications' })],
  exports: [NotificationsService, NotificationsProducer],
  controllers: [NotificationsController],
  providers: [
    NotificationsRepository,
    NotificationsService,
    NotificationsProcessor,
    NotificationsProducer,
  ],
})
export class NotificationsModule {}
