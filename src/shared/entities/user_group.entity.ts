// src/shared/entities/user_group.entity.ts
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Group } from './group.entity';

@Entity('user_groups')
export class UserGroup {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')

  @ManyToOne(() => User, user => user.userGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Group, group => group.userGroups, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;
}