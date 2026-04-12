import { MigrationInterface, QueryRunner } from "typeorm";

export class PhotoCreate1775982134329 implements MigrationInterface {
    name = 'PhotoCreate1775982134329'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "photo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "original_url" character varying(255) NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "ratio" double precision NOT NULL, "mimetype" character varying(255) NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_723fa50bf70dcfd06fb5a44d4ff" PRIMARY KEY ("id")); COMMENT ON COLUMN "photo"."original_url" IS '图片URL'; COMMENT ON COLUMN "photo"."width" IS '图片宽度'; COMMENT ON COLUMN "photo"."height" IS '图片高度'; COMMENT ON COLUMN "photo"."ratio" IS '图片比例'; COMMENT ON COLUMN "photo"."mimetype" IS '图片类型'`);
        await queryRunner.query(`ALTER TABLE "sys_user" ADD "avatar_id" uuid`);
        await queryRunner.query(`ALTER TABLE "article" ADD "banner_id" uuid`);
        await queryRunner.query(`COMMENT ON COLUMN "article"."banner_id" IS '封面海报id'`);
        await queryRunner.query(`ALTER TABLE "sys_user" ADD CONSTRAINT "FK_488e98a383c0d563a55df397e17" FOREIGN KEY ("avatar_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "article" ADD CONSTRAINT "FK_47c5095cedb7abb39090e02427b" FOREIGN KEY ("banner_id") REFERENCES "photo"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article" DROP CONSTRAINT "FK_47c5095cedb7abb39090e02427b"`);
        await queryRunner.query(`ALTER TABLE "sys_user" DROP CONSTRAINT "FK_488e98a383c0d563a55df397e17"`);
        await queryRunner.query(`COMMENT ON COLUMN "article"."banner_id" IS '封面海报id'`);
        await queryRunner.query(`ALTER TABLE "article" DROP COLUMN "banner_id"`);
        await queryRunner.query(`ALTER TABLE "sys_user" DROP COLUMN "avatar_id"`);
        await queryRunner.query(`DROP TABLE "photo"`);
    }

}
