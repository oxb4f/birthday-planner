import { Migration } from "@mikro-orm/migrations";

export class Migration20211104123750 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "notification" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "type" text check ("type" in (\'incoming_friend_request_notification\', \'changed_friend_request_status_notification\', \'friend_birthday_notification\')) not null, "to_id" int4 not null, "user_id" int4 null, "friend_request_id" int4 null);',
    );
    this.addSql('create index "notification_type_index" on "notification" ("type");');

    this.addSql(
      'alter table "notification" add constraint "notification_to_id_foreign" foreign key ("to_id") references "user" ("id") on update cascade;',
    );
    this.addSql(
      'alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete set null;',
    );
    this.addSql(
      'alter table "notification" add constraint "notification_friend_request_id_foreign" foreign key ("friend_request_id") references "friend_request" ("id") on update cascade on delete set null;',
    );
  }
}
