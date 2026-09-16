import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  send(to: string, subject: string, body: string) {
    this.logger.log(`Would send email to ${to}: ${subject} - ${body}`);
  }
}
