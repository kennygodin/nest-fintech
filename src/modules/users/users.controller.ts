import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UsersService } from 'src/modules/users/users.service';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';
import { USER_MESSAGES } from 'src/modules/users/users.constants';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Register a new user' })
  @ResponseMessage(USER_MESSAGES.CREATED)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
