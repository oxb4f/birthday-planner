import { Migration } from '@mikro-orm/migrations';

export class Migration20211124154711 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "avatar" varchar(255) null;');

    this.addSql('alter table "refresh_token" add column "created_at" int4 not null, add column "updated_at" int4 not null;');
  }

}
