import { registerAs } from '@nestjs/config';

export default registerAs('refreshToken', () => ({
  ttlDays: parseInt(process.env.REFRESH_TOKEN_TTL_DAYS ?? '1', 10),
}));
