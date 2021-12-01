import { Migration } from "@mikro-orm/migrations";

export class Migration20211201203610 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "room" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "title" varchar(255) not null, "owner_id" int4 not null);',
    );
    this.addSql('create index "room_user_id_index" on "room" ("owner_id");');

    this.addSql(
      'alter table "room" add constraint "room_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade;',
    );
  }
}
