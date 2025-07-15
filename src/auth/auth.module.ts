// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Para carregar configurações JWT

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../shared/entities/user.entity';
import { JwtStrategy } from './jwt.strategy'; // Sua estratégia JWT
import { LocalStrategy } from './local.strategy'; // Sua estratégia Local (para login)
import { DSpaceModule } from '../dspace/dspace.module'; // Importa o módulo do DSpace

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    DSpaceModule, // Importa o DSpaceModule para usar o DSpaceService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60m' }, // Token expira em 60 minutos
      }),
      inject: [ConfigService],
    }),
    ConfigModule, // Adicione ConfigModule para usar ConfigService
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy], // Adicione suas estratégias
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}