import { Migration } from "@mikro-orm/migrations";

export class Migration20211215213717 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table "room" drop constraint if exists "room_invite_id_check";',
    );
    this.addSql(
      'alter table "room" alter column "invite_id" type int4 using ("invite_id"::int4);',
    );
    this.addSql('alter table "room" alter column "invite_id" drop not null;');
  }
}
