import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'name', length: 50, unique: true, comment: '标签名称' })
  name!: string;

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

  @ManyToMany(() => Article, (article: Article) => article.tags, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  articles!: Article[];
}
