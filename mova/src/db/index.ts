import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

function client() {
  // postgres() connects lazily, so a missing URL only fails when a query actually runs.
  const url = process.env.DATABASE_URL || "postgres://missing-database-url@localhost:5432/unset";
  // prepare:false keeps us compatible with Supabase's transaction pooler (pgbouncer)
  return postgres(url, { max: 10, prepare: false, idle_timeout: 20 });
}

const pg = globalForDb.pg ?? client();
if (process.env.NODE_ENV !== "production") globalForDb.pg = pg;

export const db = drizzle(pg, { schema });
export * from "./schema";
