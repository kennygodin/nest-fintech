import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NotificationsService } from 'src/modules/notifications/notifications.service';
import { Job } from 'bullmq';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  constructor(private readonly notificationService: NotificationsService) {
    super();
  }

  async process(
    job: Job<{ userId: string; type: string; title: string; message: string }>,
  ) {
    const { userId, type, title, message } = job.data;

    await this.notificationService.create(userId, type, title, message);
  }
}
