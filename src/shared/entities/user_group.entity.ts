// src/shared/entities/user_group.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity('user_groups')
export class UserGroup {
  @PrimaryColumn('uuid') // user_id é parte da chave primária composta
  userId: string;

  @PrimaryColumn('uuid') // group_id é parte da chave primária composta
  groupId: string;

  @ManyToOne(() => User, user => user.userGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Group, group => group.userGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;
}