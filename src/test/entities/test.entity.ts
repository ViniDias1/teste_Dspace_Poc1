// src/test/entities/test.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('test_connections') // Nome da tabela no banco de dados
export class TestConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  message: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;
}