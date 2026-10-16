/* Create or reset an admin: npm run admin:create -- email@x.com "StrongPassword" */
import "dotenv/config";
import bcrypt from "bcryptjs";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { adminUsers } from "./schema";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error('Usage: npm run admin:create -- you@brand.in "a-strong-password (10+ chars)"');
  process.exit(1);
}
const pg = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false });
const db = drizzle(pg);
(async () => {
  const hash = await bcrypt.hash(password, 12);
  await db.insert(adminUsers).values({ email: email.toLowerCase(), passwordHash: hash, name: "Admin" })
    .onConflictDoUpdate({ target: adminUsers.email, set: { passwordHash: hash } });
  console.log(`✅ Admin ready: ${email}`);
  await pg.end();
})();
