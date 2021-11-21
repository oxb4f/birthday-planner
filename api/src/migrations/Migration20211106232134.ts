import { Migration } from "@mikro-orm/migrations";

export class Migration20211106232134 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "user" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "username" varchar(255) null, "password" varchar(255) null, "email" varchar(255) not null, "registered_using_google" bool not null, "birthday_date" int4 null, "first_name" varchar(255) null, "last_name" varchar(255) null);',
    );
    this.addSql('create index "user_username_index" on "user" ("username");');
    this.addSql(
      'alter table "user" add constraint "user_username_unique" unique ("username");',
    );
    this.addSql('create index "user_email_index" on "user" ("email");');
    this.addSql(
      'alter table "user" add constraint "user_email_unique" unique ("email");',
    );

    this.addSql(
      'create table "wishlist" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "description" varchar(255) null, "user_id" int4 not null);',
    );
    this.addSql(
      'create index "wishlist_userId_index" on "wishlist" ("user_id");',
    );

    this.addSql(
      'create table "wishlist_option" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "text" varchar(255) not null, "wishlist_id" int4 not null);',
    );
    this.addSql(
      'create index "wishlist_option_wishlistId_index" on "wishlist_option" ("wishlist_id");',
    );

    this.addSql(
      'create table "friend" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "to_id" int4 not null, "user_id" int4 not null);',
    );
    this.addSql('create index "friend_to_id_index" on "friend" ("to_id");');
    this.addSql('create index "friend_user_id_index" on "friend" ("user_id");');

    this.addSql(
      'create table "friend_request" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "from_id" int4 not null, "to_id" int4 not null, "status" text check ("status" in (\'accepted\', \'rejected\', \'pending\')) not null);',
    );
    this.addSql(
      'create index "friend_request_from_id_index" on "friend_request" ("from_id");',
    );
    this.addSql(
      'create index "friend_request_to_id_index" on "friend_request" ("to_id");',
    );
    this.addSql('create index "status_index" on "friend_request" ("status");');

    this.addSql(
      'create table "notification" ("id" serial primary key, "created_at" int4 not null, "updated_at" int4 not null, "type" text check ("type" in (\'incoming_friend_request_notification\', \'changed_friend_request_status_notification\', \'friend_birthday_notification\')) not null, "to_id" int4 not null, "user_id" int4 null, "friend_request_id" int4 null);',
    );
    this.addSql(
      'create index "notification_type_index" on "notification" ("type");',
    );

    this.addSql(
      'create table "refresh_token" ("id" serial primary key, "payload" varchar(255) not null, "expires_at" int4 not null, "user_id" int4 not null);',
    );
    this.addSql(
      'create index "refresh_token_userId_index" on "refresh_token" ("user_id");',
    );

    this.addSql(
      'alter table "wishlist" add constraint "wishlist_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "wishlist_option" add constraint "wishlist_option_wishlist_id_foreign" foreign key ("wishlist_id") references "wishlist" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "friend" add constraint "friend_to_id_foreign" foreign key ("to_id") references "user" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "friend" add constraint "friend_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "friend_request" add constraint "friend_request_from_id_foreign" foreign key ("from_id") references "user" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "friend_request" add constraint "friend_request_to_id_foreign" foreign key ("to_id") references "user" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "notification" add constraint "notification_to_id_foreign" foreign key ("to_id") references "user" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "notification" add constraint "notification_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
    );
    this.addSql(
      'alter table "notification" add constraint "notification_friend_request_id_foreign" foreign key ("friend_request_id") references "friend_request" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "refresh_token" add constraint "refresh_token_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;',
    );

    this.addSql(
      'alter table "friend" add constraint "friend_user_id_to_id_unique" unique ("user_id", "to_id");',
    );

    this.addSql(
      'alter table "friend_request" add constraint "friend_request_from_id_to_id_unique" unique ("from_id", "to_id");',
    );
  }
}
