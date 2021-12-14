import { Migration } from "@mikro-orm/migrations";

export class Migration20211214201046 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "room_invite" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "token" varchar(255) not null, "room_id" int4 not null);',
    );
    this.addSql(
      'alter table "room_invite" add constraint "room_invite_room_id_unique" unique ("room_id");',
    );

    this.addSql('alter table "room" add column "invite_id" int4 not null;');
    this.addSql(
      'alter table "room" add constraint "room_invite_id_unique" unique ("invite_id");',
    );

    this.addSql(
      'create table "room_participant" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "role" text check ("role" in (\'owner\', \'participant\')) not null, "user_id" int4 not null, "room_id" int4 not null);',
    );

    this.addSql(
      'alter table "room_invite" add constraint "room_invite_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "room" add constraint "room_invite_id_foreign" foreign key ("invite_id") references "room_invite" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "room_participant" add constraint "room_participant_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "room_participant" add constraint "room_participant_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade;',
    );
  }
}
