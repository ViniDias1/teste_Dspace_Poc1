// src/test/test.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestConnection } from './entities/test.entity';
import { TestService } from './test.service';
import { TestController } from './test.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TestConnection])],
  providers: [TestService],
  controllers: [TestController],
})
export class TestModule {}