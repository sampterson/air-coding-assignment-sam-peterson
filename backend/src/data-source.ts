import "reflect-metadata";
import { DataSource } from "typeorm";
import { Board } from "./entity/Board";
import { CreativeAsset } from "./entity/CreativeAsset";

const isTest = process.env.NODE_ENV === "test";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: isTest ? ":memory:" : "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [Board, CreativeAsset],
  migrations: [],
  subscribers: [],
});