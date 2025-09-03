import { Migration } from '@mikro-orm/migrations';

export class Migration20250902175553 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table "request_history" add column "owner" varchar(255) null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "request_history" drop column "owner";`);
  }

}
