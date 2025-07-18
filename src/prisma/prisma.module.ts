// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Torna o PrismaService disponível em todo o aplicativo
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporta para que outros módulos possam usá-lo
})
export class PrismaModule {}