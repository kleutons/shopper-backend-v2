import knex from "knex";
import { config } from "./config/knex";

export const db = knex(config);