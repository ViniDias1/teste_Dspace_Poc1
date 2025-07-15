// src/shared/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OneToMany } from 'typeorm'; // Importar OneToMany
import { UserGroup } from './user_group.entity'; // Importa a entidade de ligação
@Entity('users') // Nome da tabela no DB
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 }) // typeorm mapeia VARCHAR(255) por padrão com length
  email: string;

  @Column({ name: 'password_hash', length: 255 }) // <--- ATENÇÃO AQUI: explicitamente nomeando a coluna
  password: string; // Essa propriedade armazena o hash

  @Column({ nullable: true, length: 255 })
  firstName: string;

  @Column({ nullable: true, length: 255 })
  lastName: string;

  @Column({ unique: true, nullable: true })
  dspaceEpersonUuid: string; // ID do ePerson no DSpace

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

    // --- NOVO: Relação com user_groups ---
  @OneToMany(() => UserGroup, userGroup => userGroup.user)
  userGroups: UserGroup[];  
}