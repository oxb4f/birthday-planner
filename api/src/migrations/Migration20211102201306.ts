import { Migration } from "@mikro-orm/migrations";

export class Migration20211102201306 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "friend" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "to_id" int4 not null, "user_id" int4 not null);',
    );
    this.addSql('create index "friend_to_id_index" on "friend" ("to_id");');
    this.addSql('create index "friend_user_id_index" on "friend" ("user_id");');

    this.addSql(
      'create table "friend_request" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "from_id" int4 not null, "to_id" int4 not null, "status" text check ("status" in (\'accepted\', \'rejected\', \'pending\')) not null);',
    );
    this.addSql('create index "friend_request_from_id_index" on "friend_request" ("from_id");');
    this.addSql('create index "friend_request_to_id_index" on "friend_request" ("to_id");');
    this.addSql('create index "status_index" on "friend_request" ("status");');

    this.addSql(
      'alter table "friend" add constraint "friend_to_id_foreign" foreign key ("to_id") references "user" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "friend" add constraint "friend_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "friend_request" add constraint "friend_request_from_id_foreign" foreign key ("from_id") references "user" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "friend_request" add constraint "friend_request_to_id_foreign" foreign key ("to_id") references "user" ("id") on update cascade;',
    );

    this.addSql('alter table "friend" add constraint "friend_user_id_to_id_unique" unique ("user_id", "to_id");');

    this.addSql(
      'alter table "friend_request" add constraint "friend_request_from_id_to_id_unique" unique ("from_id", "to_id");',
    );
  }
}
