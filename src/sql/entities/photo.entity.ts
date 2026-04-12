import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('photo')
export class Photo {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id!: string;

  // public/uploads/original/
  @Column({ name: 'original_url', length: 255, comment: '图片URL' })
  originalUrl!: string;

  @Column({ name: 'width', type: 'int', comment: '图片宽度' })
  width!: number;

  @Column({ name: 'height', type: 'int', comment: '图片高度' })
  height!: number;

  @Column({ name: 'ratio', type: 'float', comment: '图片比例' })
  ratio!: number;

  @Column({
    name: 'mimetype',
    type: 'varchar',
    length: 255,
    comment: '图片类型',
  })
  mimetype!: string;

  // 其他非核心元数据存入 JSONB
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata!: {
    mediumUrl?: string;
    thumbnailUrl?: string;
  };

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
