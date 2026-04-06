import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('sys_user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({
    name: 'username',
    length: 20,
    unique: true,
  })
  username!: string;

  @Column({
    name: 'password',
    select: false,
  })
  password!: string;

  @Column({
    name: 'is_update_password',
    type: 'boolean',
    default: false,
  })
  isUpdatePassword!: boolean;

  @Column({ name: 'name', length: 255, comment: '用户名称', nullable: true })
  name!: string;

  @Column({ name: 'email', length: 255, comment: '用户邮箱', nullable: true })
  email!: string;

  @Column({
    name: 'github',
    length: 255,
    comment: '用户github',
    nullable: true,
  })
  github!: string;

  @Column({
    name: 'slogan',
    length: 255,
    comment: '用户座右铭',
    nullable: true,
  })
  slogan!: string;

  @Column({ name: 'avatar', length: 255, comment: '用户头像', nullable: true })
  avatar!: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt!: Date;
}
