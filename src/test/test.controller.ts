// src/test/test.controller.ts
import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service';
import { Public } from '../auth/decorators/public.decorator'; // Importe o decorador Public

@Controller('test-db')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Public() // Permite acesso sem autenticação JWT
  @Get('db-connection')
  async testDbConnection(): Promise<string> {
    return this.testService.testDbConnection();
  }
}