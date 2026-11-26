import { BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { AUTH_MESSAGES } from './auth.constants';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

jest.mock('@nestjs/jwt', () => ({
  JwtService: jest.fn(),
}));

jest.mock('@nestjs/config', () => ({
  ConfigService: jest.fn(),
}));

jest.mock('generated/prisma/client', () => ({
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {},
  },
  Role: { user: 'user', admin: 'admin', superadmin: 'superadmin' },
  UserStatus: {
    active: 'active',
    suspended: 'suspended',
    deactivated: 'deactivated',
  },
}));

jest.mock('src/prisma/prisma.service', () => ({
  PrismaService: jest.fn(),
}));

describe('AuthService - OTP', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };
  let authRepository: {
    createOtp: jest.Mock;
    findOtpByHash: jest.Mock;
    markOtpUsed: jest.Mock;
    markAllOtpsUsedForUser: jest.Mock;
  };
  let mailService: { send: jest.Mock };

  beforeEach(() => {
    usersService = { findByEmail: jest.fn() };
    authRepository = {
      createOtp: jest.fn(),
      findOtpByHash: jest.fn(),
      markOtpUsed: jest.fn(),
      markAllOtpsUsedForUser: jest.fn(),
    };
    mailService = { send: jest.fn() };

    service = new AuthService(
      usersService as unknown as UsersService,
      {} as JwtService,
      authRepository as unknown as AuthRepository,
      {
        get: jest.fn(),
        getOrThrow: jest.fn(),
      } as unknown as ConfigService,
      mailService as unknown as MailService,
    );
  });

  describe('sendOtp', () => {
    it('should send a 6-digit OTP and store its hash for an existing user', async () => {
      const user = { id: 'user-1', email: 'user@example.com' };
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.sendOtp('user@example.com');

      expect(result).toEqual({ message: AUTH_MESSAGES.SEND_OTP_GENERIC });
      expect(authRepository.createOtp).toHaveBeenCalledTimes(1);

      const [userId, otpHash, expiresAt] = authRepository.createOtp.mock
        .calls[0] as [string, string, Date];
      expect(userId).toBe('user-1');
      expect(otpHash).toHaveLength(64);
      expect(expiresAt.getTime()).toBeGreaterThan(Date.now() + 9 * 60 * 1000);
      expect(expiresAt.getTime()).toBeLessThanOrEqual(
        Date.now() + 10 * 60 * 1000 + 5,
      );

      expect(mailService.send).toHaveBeenCalledTimes(1);
      expect(mailService.send).toHaveBeenCalledWith(
        'user@example.com',
        'Your OTP code',
        expect.stringMatching(/^Your OTP code is \d{6}$/),
      );
    });

    it('should not send an OTP when the user does not exist', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.sendOtp('unknown@example.com');

      expect(result).toEqual({ message: AUTH_MESSAGES.SEND_OTP_GENERIC });
      expect(authRepository.createOtp).not.toHaveBeenCalled();
      expect(authRepository.markAllOtpsUsedForUser).not.toHaveBeenCalled();
      expect(mailService.send).not.toHaveBeenCalled();
    });

    it('should invalidate any previous unused OTP before creating a new one', async () => {
      const user = { id: 'user-1', email: 'user@example.com' };
      usersService.findByEmail.mockResolvedValue(user);

      await service.sendOtp('user@example.com');

      expect(authRepository.markAllOtpsUsedForUser).toHaveBeenCalledTimes(1);
      expect(authRepository.markAllOtpsUsedForUser).toHaveBeenCalledWith(
        'user-1',
      );
      expect(authRepository.createOtp).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyOtp', () => {
    it('should verify a valid and unexpired OTP', async () => {
      authRepository.findOtpByHash.mockResolvedValue({
        id: 'otp-1',
        usedAt: null,
        expiresAt: new Date(Date.now() + 60 * 1000),
      });

      const result = await service.verifyOtp('123456');

      expect(result).toEqual({ message: AUTH_MESSAGES.OTP_VERIFIED });
      expect(authRepository.findOtpByHash).toHaveBeenCalledWith(
        crypto.createHash('sha256').update('123456').digest('hex'),
      );
      expect(authRepository.markOtpUsed).toHaveBeenCalledWith('otp-1');
    });

    it('should reject an OTP that was already used', async () => {
      authRepository.findOtpByHash.mockResolvedValue({
        id: 'otp-1',
        usedAt: new Date(),
        expiresAt: new Date(Date.now() + 60 * 1000),
      });

      await expect(service.verifyOtp('123456')).rejects.toThrow(
        BadRequestException,
      );
      expect(authRepository.markOtpUsed).not.toHaveBeenCalled();
    });

    it('should reject an expired OTP', async () => {
      authRepository.findOtpByHash.mockResolvedValue({
        id: 'otp-1',
        usedAt: null,
        expiresAt: new Date(Date.now() - 60 * 1000),
      });

      await expect(service.verifyOtp('123456')).rejects.toThrow(
        BadRequestException,
      );
      expect(authRepository.markOtpUsed).not.toHaveBeenCalled();
    });

    it('should reject an invalid OTP', async () => {
      authRepository.findOtpByHash.mockResolvedValue(null);

      await expect(service.verifyOtp('000000')).rejects.toThrow(
        BadRequestException,
      );
      expect(authRepository.markOtpUsed).not.toHaveBeenCalled();
    });
  });
});
