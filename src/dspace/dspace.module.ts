// src/dspace/dspace.module.ts
import { Module } from '@nestjs/common';
import { DSpaceService } from './dspace.service';

@Module({
  providers: [DSpaceService],
  exports: [DSpaceService],
})
export class DSpaceModule {}