import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { USER_MESSAGES } from './users.constants';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string) {
    return this.usersRepository.findUserById(id);
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
