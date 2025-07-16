// src/shared/entities/group.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserGroup } from './user_group.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false, length: 255 })
  name: string;

  @OneToMany(() => UserGroup, userGroup => userGroup.group)
  userGroups: UserGroup[];
}