import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
} from 'typeorm';
import ShortUniqueId from 'short-unique-id';

const uid = new ShortUniqueId({ length: 10 });

@Entity('page_module')
export class PageModule {
  @PrimaryColumn({ name: 'id', type: 'varchar', length: 10 })
  id!: string;
  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = uid.rnd();
    }
  }

  @Column({ name: 'title', length: 100, comment: '模块名称' })
  title!: string;

  // POST_LIST（文章列表）和 PHOTO_GALLERY（照片集）
  @Column({ name: 'type', length: 100, comment: '模块类型' })
  type!: string;

  @Column({ name: 'intro', type: 'text', nullable: true, comment: '模块介绍' })
  intro!: string | null;

  @Column({ name: 'style_type', length: 255, comment: '模块样式类型' })
  styleType!: string;

  @Column({
    name: 'sort_order',
    type: 'int',
    default: 0,
    comment: '模块排序',
  })
  sortOrder!: number;

  /**
   * 核心：JSON 字段
   * 在 MySQL/PostgreSQL 中直接使用 'json' 类型
   * TypeORM 会自动帮你进行 JSON.parse 和 JSON.stringify
   */
  @Column({ name: 'content', type: 'json', comment: '模块内容' })
  content!: {
    articleIds?: string[]; // 需要按照文章id,读取文章信息
    imageUrls?: string[];
    /**
     * 新增：图片模型引用
     * 存储 Photo 實体的 UUID 数组
     */
    photoIds?: string[];
  };

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
    comment: '是否启用',
  })
  isActive!: boolean;

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
