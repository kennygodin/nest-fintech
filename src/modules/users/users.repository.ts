import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Role, UserStatus } from 'generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { USER_MESSAGES } from 'src/modules/users/users.constants';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAdminUser(email: string, passwordHash: string, role: Role) {
    try {
      return await this.prisma.user.create({
        data: { email, passwordHash, role },
        select: { id: true, email: true, role: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(USER_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      throw error;
    }
  }

  async updateStatus(id: string, status: UserStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { status },
    });
  }

  async findAllUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async createUser(email: string, passwordHash: string) {
    try {
      return await this.prisma.user.create({
        data: { email, passwordHash, wallet: { create: {} } },
        select: { id: true, email: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(USER_MESSAGES.EMAIL_ALREADY_EXISTS);
      }
      throw error;
    }
  }
}
