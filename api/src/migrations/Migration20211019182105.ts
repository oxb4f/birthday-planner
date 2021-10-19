import { Migration } from "@mikro-orm/migrations";

export class Migration20211019182105 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "user" add column "birthday_date" varchar(255) not null;');
  }
}
