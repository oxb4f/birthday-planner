import { Migration } from "@mikro-orm/migrations";

export class Migration20211218184203 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "room" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "title" varchar(255) not null, "owner_id" int4 null, "invite_id" int4 null);',
    );
    this.addSql('create index "room_user_id_index" on "room" ("owner_id");');
    this.addSql(
      'alter table "room" add constraint "room_invite_id_unique" unique ("invite_id");',
    );

    this.addSql(
      'create table "room_invite" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "token" varchar(255) not null, "room_id" int4 not null);',
    );
    this.addSql(
      'alter table "room_invite" add constraint "room_invite_room_id_unique" unique ("room_id");',
    );

    this.addSql(
      'create table "room_participant" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "roles" text[] not null default \'{participant}\', "user_id" int4 not null, "room_id" int4 not null);',
    );

    this.addSql(
      'alter table "room" add constraint "room_owner_id_foreign" foreign key ("owner_id") references "user" ("id") on update cascade on delete set null;',
    );
    this.addSql(
      'alter table "room" add constraint "room_invite_id_foreign" foreign key ("invite_id") references "room_invite" ("id") on update cascade on delete set null;',
    );

    this.addSql(
      'alter table "room_invite" add constraint "room_invite_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "room_participant" add constraint "room_participant_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "room_participant" add constraint "room_participant_room_id_foreign" foreign key ("room_id") references "room" ("id") on update cascade on delete cascade;',
    );
  }
}
