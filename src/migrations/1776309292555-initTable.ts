import { MigrationInterface, QueryRunner } from "typeorm";

export class InitTable1776309292555 implements MigrationInterface {
    name = 'InitTable1776309292555'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "photo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "original_url" character varying(255) NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "ratio" double precision NOT NULL, "mimetype" character varying(255) NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_723fa50bf70dcfd06fb5a44d4ff" PRIMARY KEY ("id")); COMMENT ON COLUMN "photo"."original_url" IS '图片URL'; COMMENT ON COLUMN "photo"."width" IS '图片宽度'; COMMENT ON COLUMN "photo"."height" IS '图片高度'; COMMENT ON COLUMN "photo"."ratio" IS '图片比例'; COMMENT ON COLUMN "photo"."mimetype" IS '图片类型'`);
        await queryRunner.query(`CREATE TABLE "sys_user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying(20) NOT NULL, "password" character varying NOT NULL, "is_update_password" boolean NOT NULL DEFAULT false, "name" character varying(255), "email" character varying(255), "github" character varying(255), "slogan" character varying(255), "avatar" character varying(255), "avatar_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_9e7164b2f1ea1348bc0eb0a7da4" UNIQUE ("username"), CONSTRAINT "PK_b286272b5d723fa76dca97a159e" PRIMARY KEY ("id")); COMMENT ON COLUMN "sys_user"."name" IS '用户名称'; COMMENT ON COLUMN "sys_user"."email" IS '用户邮箱'; COMMENT ON COLUMN "sys_user"."github" IS '用户github'; COMMENT ON COLUMN "sys_user"."slogan" IS '用户座右铭'; COMMENT ON COLUMN "sys_user"."avatar" IS '用户头像'`);
        await queryRunner.query(`CREATE TABLE "page_module" ("id" character varying(10) NOT NULL, "title" character varying(100) NOT NULL, "type" character varying(100) NOT NULL, "intro" text, "style_type" character varying(255) NOT NULL, "sort_order" integer NOT NULL DEFAULT '0', "content" json NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_4288f33ee83ed4a77cf41e24537" PRIMARY KEY ("id")); COMMENT ON COLUMN "page_module"."title" IS '模块名称'; COMMENT ON COLUMN "page_module"."type" IS '模块类型'; COMMENT ON COLUMN "page_module"."intro" IS '模块介绍'; COMMENT ON COLUMN "page_module"."style_type" IS '模块样式类型'; COMMENT ON COLUMN "page_module"."sort_order" IS '模块排序'; COMMENT ON COLUMN "page_module"."content" IS '模块内容'; COMMENT ON COLUMN "page_module"."is_active" IS '是否启用'`);
        await queryRunner.query(`CREATE TABLE "tag" ("id" character varying(10) NOT NULL, "name" character varying(50) NOT NULL, "category_id" character varying(10) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id")); COMMENT ON COLUMN "tag"."name" IS '标签名称'; COMMENT ON COLUMN "tag"."category_id" IS '分类ID'`);
        await queryRunner.query(`CREATE TABLE "article" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "content" text NOT NULL, "summary" character varying(500), "banner_url" character varying(255), "banner_id" uuid, "view_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "category_id" character varying, CONSTRAINT "PK_40808690eb7b915046558c0f81b" PRIMARY KEY ("id")); COMMENT ON COLUMN "article"."title" IS '文章标题'; COMMENT ON COLUMN "article"."content" IS 'Markdown内容'; COMMENT ON COLUMN "article"."summary" IS '文章摘要'; COMMENT ON COLUMN "article"."banner_url" IS '封面海报'; COMMENT ON COLUMN "article"."banner_id" IS '封面海报id'; COMMENT ON COLUMN "article"."view_count" IS '浏览量'`);
        await queryRunner.query(`CREATE INDEX "IDX_cdd234ef147c8552a8abd42bd2" ON "article" ("category_id") `);
        await queryRunner.query(`CREATE TABLE "category" ("id" character varying(10) NOT NULL, "name" character varying(100) NOT NULL, "slug" character varying(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id")); COMMENT ON COLUMN "category"."name" IS '分类名称'; COMMENT ON COLUMN "category"."slug" IS 'SEO友好唯一路径'`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cb73208f151aa71cdd78f662d7" ON "category" ("slug") `);
        await queryRunner.query(`CREATE TABLE "article_tags" ("article_id" uuid NOT NULL, "tag_id" character varying(10) NOT NULL, CONSTRAINT "PK_dd79accc42e2f122f6f3ff7588a" PRIMARY KEY ("article_id", "tag_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f8c9234a4c4cb37806387f0c9e" ON "article_tags" ("article_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1325dd0b98ee0f8f673db6ce19" ON "article_tags" ("tag_id") `);
        await queryRunner.query(`ALTER TABLE "sys_user" ADD CONSTRAINT "FK_488e98a383c0d563a55df397e17" FOREIGN KEY ("avatar_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "FK_3249fd70734f41f513a1d5d3ef7" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_47c5095cedb7abb39090e02427b" FOREIGN KEY ("banner_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_cdd234ef147c8552a8abd42bd29" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article_tags" ADD CONSTRAINT "FK_f8c9234a4c4cb37806387f0c9e9" FOREIGN KEY ("article_id") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "article_tags" ADD CONSTRAINT "FK_1325dd0b98ee0f8f673db6ce194" FOREIGN KEY ("tag_id") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article_tags" DROP CONSTRAINT "FK_1325dd0b98ee0f8f673db6ce194"`);
        await queryRunner.query(`ALTER TABLE "article_tags" DROP CONSTRAINT "FK_f8c9234a4c4cb37806387f0c9e9"`);
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_cdd234ef147c8552a8abd42bd29"`);
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_47c5095cedb7abb39090e02427b"`);
        await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "FK_3249fd70734f41f513a1d5d3ef7"`);
        await queryRunner.query(`ALTER TABLE "sys_user" DROP CONSTRAINT "FK_488e98a383c0d563a55df397e17"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1325dd0b98ee0f8f673db6ce19"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f8c9234a4c4cb37806387f0c9e"`);
        await queryRunner.query(`DROP TABLE "article_tags"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb73208f151aa71cdd78f662d7"`);
        await queryRunner.query(`DROP TABLE "category"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cdd234ef147c8552a8abd42bd2"`);
        await queryRunner.query(`DROP TABLE "article"`);
        await queryRunner.query(`DROP TABLE "tag"`);
        await queryRunner.query(`DROP TABLE "page_module"`);
        await queryRunner.query(`DROP TABLE "sys_user"`);
        await queryRunner.query(`DROP TABLE "photo"`);
    }

}
