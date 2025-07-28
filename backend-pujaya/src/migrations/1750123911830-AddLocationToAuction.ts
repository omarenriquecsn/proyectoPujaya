import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationToAuction1750123911830 implements MigrationInterface {
    name = 'AddLocationToAuction1750123911830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" ADD "latitude" numeric(10,7)`);
        await queryRunner.query(`ALTER TABLE "auctions" ADD "longitude" numeric(10,7)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "auctions" DROP COLUMN "latitude"`);
    }

}
