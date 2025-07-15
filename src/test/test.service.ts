// src/test/test.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestConnection } from './entities/test.entity';

@Injectable()
export class TestService {
  private readonly logger = new Logger(TestService.name);

  constructor(
    @InjectRepository(TestConnection)
    private testConnectionRepository: Repository<TestConnection>,
  ) {}

  async testDbConnection(): Promise<string> {
    try {
      // Tenta salvar um registro simples
      const testEntry = this.testConnectionRepository.create({
        message: `Conexão PostgreSQL bem-sucedida em ${new Date().toISOString()}`,
      });
      await this.testConnectionRepository.save(testEntry);

      // Tenta buscar registros existentes
      const totalRecords = await this.testConnectionRepository.count();

      this.logger.log('Conexão PostgreSQL OK! Registro salvo e contagem realizada.');
      return `Conexão PostgreSQL bem-sucedida! Total de registros de teste: ${totalRecords}`;
    } catch (error) {
      this.logger.error('Falha na conexão PostgreSQL:', error.message);
      return `Falha na conexão PostgreSQL: ${error.message}. Verifique suas variáveis de ambiente DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE e se o container 'dspace-db' está rodando e com a porta 5432 mapeada.`;
    }
  }
}