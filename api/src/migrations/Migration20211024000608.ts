import { Migration } from "@mikro-orm/migrations";

export class Migration20211024000608 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "refresh_token" drop constraint if exists "refresh_token_user_id_check";');
    this.addSql('alter table "refresh_token" alter column "user_id" type int4 using ("user_id"::int4);');
    this.addSql('alter table "refresh_token" alter column "user_id" set not null;');
  }
}
