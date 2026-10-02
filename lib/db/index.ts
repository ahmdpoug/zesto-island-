import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const globalForDb = globalThis as unknown as { zestoSslPool?: Pool }

export const pool = globalForDb.zestoSslPool ?? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true } })
if (process.env.NODE_ENV !== 'production') globalForDb.zestoSslPool = pool

export const db = drizzle(pool, { schema })
