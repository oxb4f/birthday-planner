import { Migration } from "@mikro-orm/migrations";

export class Migration20211016085657 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "user" ("id" serial primary key, "username" varchar(255) not null, "password" varchar(255) not null, "first_name" varchar(255) null, "last_name" varchar(255) null, "created_at" int4 not null, "updated_at" int4 not null);',
    );
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
  }
}
