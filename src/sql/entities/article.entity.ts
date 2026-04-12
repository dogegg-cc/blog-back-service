import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Index,
} from 'typeorm';
import { Category } from './category.entity';
import { Tag } from './tag.entity';
import { Photo } from './photo.entity';

@Entity('article')
export class Article {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  @Column({ name: 'title', length: 255, comment: '文章标题' })
  title!: string;

  @Column({ name: 'content', type: 'text', comment: 'Markdown内容' })
  content!: string;

  @Column({
    name: 'summary',
    length: 500,
    nullable: true,
    comment: '文章摘要',
  })
  summary?: string;

  /**
   * @deprecated 请使用 bannerItem 替代
   */
  @Column({
    name: 'banner_url',
    length: 255,
    nullable: true,
    comment: '封面海报',
  })
  bannerUrl?: string;

  @ManyToOne(() => Photo, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'banner_id' })
  bannerItem!: Photo;

  @Column({ name: 'banner_id', nullable: true, comment: '封面海报id' })
  bannerId!: string;

  @Column({
    name: 'view_count',
    type: 'int',
    default: 0,
    comment: '浏览量',
  })
  viewCount!: number;

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

  @Index() // 用于加速分类查询
  @Column({ name: 'category_id', nullable: true })
  categoryId!: string;

  @ManyToOne(() => Category, (category: Category) => category.articles, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category!: Category;

  @ManyToMany(() => Tag, (tag: Tag) => tag.articles, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'article_tags',
    joinColumn: {
      name: 'article_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  tags!: Tag[];
}
