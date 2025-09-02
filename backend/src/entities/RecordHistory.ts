import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class RequestHistory {
	@PrimaryKey()
	id!: number;

	@Property()
	method!: "GET" | "POST" | "PUT" | "DELETE";

	@Property()
	url!: string;

	@Property({ type: "json", nullable: true })
	requestHeaders?: unknown;

	@Property({ type: "json", nullable: true })
	responseHeaders?: unknown;

	@Property({ nullable: true })
	requestBody?: string; // JSON.stringify, plain text, or base64

	@Property({ nullable: true })
	responseBody?: string; // JSON.stringify, plain text, or base64

	@Property({ nullable: true })
	requestBodyType?: "json" | "text" | "binary";

	@Property({ nullable: true })
	responseBodyType?: "json" | "text" | "binary";

	@Property()
	status!: number;

	@Property()
	createdAt: Date = new Date();
}
