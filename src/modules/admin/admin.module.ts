import { Module } from '@nestjs/common';
import { AdminController } from 'src/modules/admin/admin.controller';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AdminController],
  providers: [],
  exports: [],
})
export class AdminModule {}
