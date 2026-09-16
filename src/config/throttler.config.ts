import { registerAs } from '@nestjs/config';

export default registerAs('throttler', () => ({
  ttl: parseInt(process.env.THROTTLE_TTLE ?? '60000', 10),
  limit: parseInt(process.env.THROTTLE_LIMIT ?? '10', 10),
}));
