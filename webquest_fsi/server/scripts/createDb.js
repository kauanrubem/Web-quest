import 'dotenv/config'
import pg from 'pg'

const { Client } = pg

function buildAdminConfig() {
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL)
    url.pathname = '/postgres'

    return {
      connectionString: url.toString(),
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    }
  }

  return {
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
    database: process.env.PGBOOTSTRAP_DB || 'postgres',
  }
}

const targetDatabase = process.env.PGDATABASE || 'webquest_fsi'
const client = new Client(buildAdminConfig())

try {
  await client.connect()

  const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDatabase])

  if (result.rowCount > 0) {
    console.log(`Banco "${targetDatabase}" ja existe.`)
  } else {
    await client.query(`CREATE DATABASE "${targetDatabase}"`)
    console.log(`Banco "${targetDatabase}" criado com sucesso.`)
  }
} catch (error) {
  console.error('Falha ao criar/verificar o banco.', error)
  process.exitCode = 1
} finally {
  await client.end()
}
