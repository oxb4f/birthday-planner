import { Migration } from "@mikro-orm/migrations";

export class Migration20211023234904 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "refresh_token" ("id" serial primary key, "payload" varchar(255) not null, "expires_at" int4 not null, "user_id" int4 null);',
    );

    this.addSql(
      'alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
    );
  }
}
