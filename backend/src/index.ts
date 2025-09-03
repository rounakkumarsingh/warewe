// biome-ignore assist/source/organizeImports: Who Cares
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { z } from "zod";
import { initORM, closeORM, getORM } from "./db/db";
import type { MikroORM } from "@mikro-orm/postgresql";
import { RequestHistory } from "./entities/RequestHistory";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { cors } from "hono/cors";

const app = new Hono<{
	Variables: {
		orm: MikroORM;
		owner: string;
	};
}>();

app.use(logger());
app.use(cors({
	origin: "*",
}))

app.use(async (c, next) => {
	const start = Date.now();
	await next();
	const end = Date.now();
	c.res.headers.set("X-Response-Time", `${end - start}`);
});

app.use(async (c, next) => {
	const cookieSecret = process.env.COOKIE_SECRET;
	if (!cookieSecret) throw new Error("Missing COOKIE_SECRET");

	const cookie = await getSignedCookie(c, cookieSecret, 'loginToken');
	if (cookie === undefined) {
		await setSignedCookie(c, 'loginToken', crypto.randomUUID(), cookieSecret, {
			httpOnly: true,
			secure: true,       // only over HTTPS
			sameSite: 'Strict', // or 'Lax' depending on your app
			path: '/',
			maxAge: 60 * 60 * 24 * 30 // (optional) 30 days
		});
	}
	c.set("owner", await getSignedCookie(c, cookieSecret, 'loginToken') as string);
	await next();
})

app.use(async (c, next) => {
	const orm = getORM();
	c.set("orm", orm);
	await next();
});

app.post(
	"/api/request",
	zValidator(
		"json",
		z.object({
			method: z.enum(["GET", "POST", "PUT", "DELETE"]).default("GET"),
			url: z.url(),
			body: z.any().optional(),
			headers: z.record(z.string(), z.string()).optional(),
		}),
	),
	async (c) => {
		try {
			const validatedData = c.req.valid("json");

			const options: RequestInit = {
				method: validatedData.method,
				headers: validatedData.headers,
			};

			if (validatedData.body && validatedData.method !== "GET") {
				options.body = JSON.stringify(validatedData.body);
			}

			const res = await fetch(validatedData.url, options);

			const status = res.status;
			const headers: Record<string, string> = {};
			res.headers.forEach((value, key) => {
				headers[key] = value;
			});
			const contentType = res.headers.get("content-type") ?? "";

			let body: string;
			let type: "json" | "text" | "binary" | "html" = "text";

			if (contentType.includes("application/json")) {
				body = JSON.stringify(await res.json());
				type = "json";
			} else if (contentType.startsWith("text/")) {
				body = await res.text();
				if (contentType.includes("html")) {
					type = "html";
				} else if (contentType.includes("plain")) {
					type = "text";
				}
			} else {
				const buffer = await res.arrayBuffer();
				body = Buffer.from(buffer).toString("base64"); // safe for transport
				type = "binary";
			}

			const orm = c.get("orm");
			const em = orm.em.fork();
			let requestBodyType: "json" | "text" | "binary" = "text";
			let requestBody: string | undefined;

			const reqContentType = validatedData?.headers?.["content-type"] ?? "";

			if (validatedData.body && validatedData.method !== "GET") {
				if (reqContentType.includes("application/json")) {
					requestBody = JSON.stringify(validatedData.body);
					requestBodyType = "json";
				} else if (reqContentType.startsWith("text/")) {
					requestBody = String(validatedData.body);
					requestBodyType = "text";
				} else {
					// For binary or unknown types, encode as base64
					if (typeof validatedData.body === "string") {
						requestBody = Buffer.from(validatedData.body).toString("base64");
					} else if (validatedData.body instanceof Uint8Array) {
						requestBody = Buffer.from(validatedData.body).toString("base64");
					} else {
						requestBody = Buffer.from(
							JSON.stringify(validatedData.body),
						).toString("base64");
					}
					requestBodyType = "binary";
				}
			}

			const record = em.create(RequestHistory, {
				createdAt: new Date(),
				owner: c.get("owner"),
				method: validatedData.method,
				url: validatedData.url,
				status,
				requestHeaders: validatedData.headers,
				responseHeaders: headers,
				requestBodyType,
				requestBody,
				responseBodyType: type,
				responseBody: body,
			});
			await em.persistAndFlush(record);
			return c.json(record, 200);
		} catch (error) {
			console.error(error);
			return c.text("Error occurred while processing request", 500);
		}
	},
);

app.get("/api/history", async (c) => {
	try {
		const orm = c.get("orm");
		const em = orm.em.fork();

		const page = parseInt(c.req.query("page") ?? "1", 10);
		const limit = parseInt(c.req.query("limit") ?? "20", 10);
		const offset = (page - 1) * limit;

		const [records, total] = await em.findAndCount(
			RequestHistory,
			{ owner: { $eq: c.get("owner") } },
			{
				orderBy: { id: "desc" },
				limit,
				offset,
			},
		);

		return c.json({ records, total, page, limit }, 200);
	} catch (error) {
		console.error(error);
		return c.text("Error occurred while fetching request history", 500);
	}
});

app.onError((err, c) => {
	console.error(`${err}`);
	return c.text("Custom Error Message", 500);
});

app.get("/", (c) => {
	return c.text("Server is up!!");
});

process.on("SIGINT", async () => {
	console.log("Shutting down gracefully...");
	await closeORM();
	process.exit(0);
});

const startServer = async () => {
	try {
		await initORM();
		console.log("ORM Initialized successfully");
		process.on("SIGINT", async () => {
			console.log("Shutting down gracefully...");
			await closeORM();
			process.exit(0);
		});
		return app;
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

export default await startServer();
