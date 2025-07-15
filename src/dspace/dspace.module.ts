// src/dspace/dspace.module.ts
import { Module } from '@nestjs/common';
import { DSpaceService } from './dspace.service';

@Module({
  providers: [DSpaceService],
  exports: [DSpaceService], // Exporta para ser usado em outros módulos
})
export class DSpaceModule {}