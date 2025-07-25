// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module'; // Importe o PrismaModule

@Module({
  imports: [UsersModule, PrismaModule], // Adicione PrismaModule aqui
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}