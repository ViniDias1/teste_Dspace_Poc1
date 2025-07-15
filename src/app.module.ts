// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DSpaceModule } from './dspace/dspace.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { User } from './shared/entities/user.entity'; // Sua entidade User
import { TestModule } from './test/test.module'; // <--- Importe o módulo de teste
import { TestConnection } from './test/entities/test.entity'; // <--- Importe a entidade de teste

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, TestConnection], // <--- Adicione sua entidade de teste aqui
        synchronize: true, // Use em desenvolvimento
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DSpaceModule,
    TestModule, // <--- Adicione o módulo de teste aqui
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}