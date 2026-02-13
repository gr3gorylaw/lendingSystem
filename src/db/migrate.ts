import { Database } from "bun:sqlite";
import { readFileSync } from "fs";
import { resolve } from "path";

const dbPath = resolve("lending.db");
const db = new Database(dbPath);

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

// Read and execute migration SQL
const migrationPath = resolve("src/db/migrations/0000_slow_silhouette.sql");
const sql = readFileSync(migrationPath, "utf-8");

// Split by statement-breakpoint and execute each statement
const statements = sql.split("--> statement-breakpoint");

for (const statement of statements) {
  if (statement.trim()) {
    try {
      db.run(statement);
    } catch (error: any) {
      // Ignore "already exists" errors
      if (!error.message.includes("already exists")) {
        console.error("Migration error:", error.message);
      }
    }
  }
}

console.log("Migration completed!");
db.close();
