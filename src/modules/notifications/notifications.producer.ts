import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsProducer {
  constructor(@InjectQueue('notifications') private readonly queue: Queue) {}

  async notify(userId: string, type: string, title: string, message: string) {
    await this.queue.add('notify', { userId, type, title, message });
  }
}
