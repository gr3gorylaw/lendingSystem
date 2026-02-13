import Database from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import * as schema from "./schema";
import path from "path";

// Use absolute path for database
const dbPath = path.resolve(process.cwd(), "lending.db");
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.exec("PRAGMA journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
