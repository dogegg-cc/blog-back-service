import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  ManyToMany,
  UpdateDateColumn,
  BeforeInsert,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { Category } from './category.entity';
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

  @Column({ name: 'category_id', length: 10, comment: '分类ID' })
  categoryId!: string;

  @ManyToOne(() => Category, (category: Category) => category.tags, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

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
