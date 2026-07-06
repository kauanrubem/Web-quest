import { initializeDatabase, pool } from '../db.js'

try {
  await initializeDatabase()
  console.log('Banco inicializado com sucesso.')
} catch (error) {
  console.error('Falha ao inicializar o banco.', error)
  process.exitCode = 1
} finally {
  await pool.end()
}
