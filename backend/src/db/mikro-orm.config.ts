import { defineConfig } from "@mikro-orm/postgresql";
import { RequestHistory } from "../entities/RequestHistory";

export default defineConfig({
  entities: [RequestHistory],
  dbName: process.env.DB_NAME || "warewe",
  user: process.env.DB_USER || "neondb_owner",
  password: process.env.DB_PASS || "npg_6MCo4nYtzUra",
  host: process.env.DB_HOST || "ep-green-sun-a1opvzj5-pooler.ap-southeast-1.aws.neon.tech",
  port: 5432,
  allowGlobalContext: true,
  debug: process.env.NODE_ENV !== "production",
  migrations: {
    path: "./src/migrations",   // relative to project root
    pathTs: "./src/migrations",
  },
  driverOptions: {
    connection: {
      ssl: { require: true, rejectUnauthorized: false },
    },
  },
});
