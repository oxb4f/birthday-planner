import { Migration } from "@mikro-orm/migrations";

export class Migration20211025164155 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "wishlist" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "description" varchar(255) null, "user_id" int4 not null);',
    );

    this.addSql(
      'create table "wishlist_option" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "text" varchar(255) not null, "wishlist_id" int4 not null);',
    );

    this.addSql(
      'alter table "wishlist" add constraint "wishlist_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "wishlist_option" add constraint "wishlist_option_wishlist_id_foreign" foreign key ("wishlist_id") references "wishlist" ("id") on update cascade on delete cascade;',
    );
  }
}
