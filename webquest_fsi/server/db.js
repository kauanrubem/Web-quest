import 'dotenv/config'
import pg from 'pg'
import { schemaSql, seedSql } from './schema.js'

const { Pool } = pg

function createPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGDATABASE || 'webquest_fsi',
  }
}

export const pool = new Pool(createPoolConfig())

export async function initializeDatabase() {
  await pool.query(schemaSql)
  await pool.query(seedSql)
}
