import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Article } from './article.entity';
import { Tag } from './tag.entity';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 10 });

@Entity('category')
export class Category {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 10 })
  id!: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uid.rnd();
    }
  }

  @Column({ name: 'name', length: 100, comment: '分类名称' })
  name!: string;

  @Index({ unique: true })
  @Column({ name: 'slug', length: 100, comment: 'SEO友好唯一路径' })
  slug!: string;

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

  @OneToMany(() => Article, (article: Article) => article.category)
  articles!: Article[];

  @OneToMany(() => Tag, (tag: Tag) => tag.category)
  tags!: Tag[];
}
