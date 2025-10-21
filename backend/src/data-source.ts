import "reflect-metadata";
import { DataSource } from "typeorm";
import { Board } from "./entity/Board";

export const AppDataSource = new DataSource({
  type: "sqlite",
  database: "database.sqlite",
  synchronize: true,
  logging: false,
  entities: [Board],
  migrations: [],
  subscribers: [],
});