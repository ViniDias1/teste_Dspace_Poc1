// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from '../shared/entities/user.entity';
import { DSpaceModule } from '../dspace/dspace.module'; // Importa o DSpaceModule

@Module({
  imports: [TypeOrmModule.forFeature([User]), DSpaceModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}