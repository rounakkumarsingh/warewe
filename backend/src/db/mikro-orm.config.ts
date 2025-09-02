import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";

export default defineConfig({
	driver: PostgreSqlDriver,
	dbName: process.env.DB_NAME,
	password: process.env.DB_PASS,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	entities: ["./src/entities/**/*.ts"],
	entitiesTs: ["./src/entities/**/*.ts"],
	debug: process.env.NODE_ENV !== "production",
	allowGlobalContext: true, // Important for Hono compatibility
	migrations: {
		path: "./src/migrations",
		pathTs: "./src/migrations",
	},
});
