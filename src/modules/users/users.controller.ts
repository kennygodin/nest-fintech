import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

import { Body, Controller, Post, Get, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
    return this.usersService.create(dto.email, dto.password);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated user's profile" })
  me(@Req() req: Request) {
    return req.user;
  }
}
