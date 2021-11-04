import { Migration } from "@mikro-orm/migrations";

export class Migration20211031123828 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "user" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "username" varchar(255) not null, "password" varchar(255) not null, "birthday_date" varchar(255) not null, "first_name" varchar(255) null, "last_name" varchar(255) null);',
    );
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');

    this.addSql(
      'create table "refresh_token" ("id" serial primary key, "payload" varchar(255) not null, "expires_at" int4 not null, "user_id" int4 not null);',
    );
    this.addSql('create index "refresh_token_userId_index" on "refresh_token" ("user_id");');

    this.addSql(
      'create table "wishlist" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "description" varchar(255) null, "user_id" int4 not null);',
    );
    this.addSql('create index "wishlist_userId_index" on "wishlist" ("user_id");');

    this.addSql(
      'create table "wishlist_option" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "text" varchar(255) not null, "wishlist_id" int4 not null);',
    );
    this.addSql('create index "wishlist_option_wishlistId_index" on "wishlist_option" ("wishlist_id");');

    this.addSql(
      'alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "wishlist" add constraint "wishlist_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;',
    );

    this.addSql(
      'alter table "wishlist_option" add constraint "wishlist_option_wishlist_id_foreign" foreign key ("wishlist_id") references "wishlist" ("id") on update cascade on delete cascade;',
    );
  }
}
