import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToMany,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { Article } from './article.entity';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 10 });

@Entity('tag')
export class Tag {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 10 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uid.rnd();
    }
  }

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
