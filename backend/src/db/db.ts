import { MikroORM } from "@mikro-orm/postgresql";
import config from "./mikro-orm.config.js";

let orm: MikroORM | undefined;

export const initORM = async () => {
	if (!orm) {
		orm = await MikroORM.init(config);
	}
	return orm;
};

export const getORM = () => {
	if (!orm) {
		throw new Error("ORM not initialized. Call initializeORM() first.");
	}
	return orm;
};

export const closeORM = async () => {
	if (orm) {
		await orm.close();
		orm = undefined;
	}
};
