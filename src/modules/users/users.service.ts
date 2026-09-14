import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_MESSAGES } from './users.constants';
import { UsersRepository } from './users.repository';
import { Role, UserStatus } from 'generated/prisma/enums';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createAdminUser(email: string, password: string) {
    const existingUser = await this.usersRepository.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException(USER_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return this.usersRepository.createAdminUser(
      email,
      passwordHash,
      Role.admin,
    );
  }

  async updateStatus(id: string, status: UserStatus) {
    return this.usersRepository.updateStatus(id, status);
  }

  async findAll() {
    return this.usersRepository.findAllUsers();
  }

  async findById(id: string) {
    const user = await this.usersRepository.findUserById(id);

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.NOT_FOUND);
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.usersRepository.findUserByEmail(email);
  }

  async create(email: string, password: string) {
    const emailExist = await this.usersRepository.findUserByEmail(email);

    if (emailExist) {
      throw new ConflictException(USER_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return this.usersRepository.createUser(email, passwordHash);
  }
}
