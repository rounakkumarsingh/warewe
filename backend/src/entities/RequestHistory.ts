import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class RequestHistory {
  @PrimaryKey()
  id!: number;

  @Property()
  method!: "GET" | "POST" | "PUT" | "DELETE";

  @Property()
  url!: string;

  @Property({ nullable: true })
  owner!: string;

  @Property({ type: "json", nullable: true })
  requestHeaders?: unknown;

  @Property({ type: "json", nullable: true })
  responseHeaders?: unknown;

  @Property({ type: "text", nullable: true })
  requestBody?: string; // long text (JSON.stringify, plain text, base64)

  @Property({ type: "text", nullable: true })
  responseBody?: string; // long text (HTML, JSON, etc.)

  @Property({ type: "text", nullable: true })
  requestBodyType?: "json" | "text" | "binary";

  @Property({ type: "text", nullable: true })
  responseBodyType?: "json" | "text" | "binary" | "html";

  @Property()
  status!: number;

  @Property()
  createdAt: Date = new Date();
}
