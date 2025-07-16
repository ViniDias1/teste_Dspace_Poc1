// src/shared/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OneToMany } from 'typeorm';
import { UserGroup } from './user_group.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  password: string;

  @Column({ nullable: true, length: 255 })
  firstName: string;

  @Column({ nullable: true, length: 255 })
  lastName: string;

  @Column({ unique: true, nullable: true })
  dspaceEpersonUuid: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => UserGroup, userGroup => userGroup.user)
  userGroups: UserGroup[];  
}