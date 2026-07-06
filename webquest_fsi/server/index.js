import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { initializeDatabase, pool } from './db.js'

export const app = express()
const PORT = Number(process.env.PORT || 3001)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'monitor-fsi-local'
let initializationPromise

const submissionSchema = z.object({
  semesterId: z.coerce.number().int().positive().optional(),
  groupName: z.string().trim().min(3).max(120),
  workTitle: z.string().trim().min(3).max(180),
  workType: z.enum(['youtube', 'drive', 'link', 'slides', 'podcast', 'outro']),
  url: z.url(),
  members: z.string().trim().min(3).max(500),
  submittedBy: z.string().trim().min(3).max(120),
  description: z.string().trim().max(700).optional().default(''),
})

const deleteSubmissionSchema = z.object({
  deletedBy: z.string().trim().min(2).max(120).optional(),
  reason: z.string().trim().max(400).optional().default(''),
})

const semesterCreateSchema = z.object({
  code: z.string().trim().regex(/^\d{4}\.[12]$/, 'Use o formato 2026.1 ou 2026.2'),
  title: z.string().trim().min(3).max(120),
  theme: z.string().trim().min(3).max(160),
  description: z.string().trim().max(400).optional().default(''),
  status: z.enum(['open', 'archived']).optional().default('open'),
  isActive: z.boolean().optional().default(false),
})

const semesterUpdateSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  theme: z.string().trim().min(3).max(160).optional(),
  description: z.string().trim().max(400).optional(),
  status: z.enum(['open', 'archived']).optional(),
  isActive: z.boolean().optional(),
})

app.use(cors())
app.use(express.json())

function normalizeMemberNames(membersText) {
  const seen = new Set()

  return membersText
    .split(/[\n,;]+/)
    .map((member) => member.trim())
    .filter(Boolean)
    .filter((member) => {
      const key = member.toLowerCase()

      if (seen.has(key)) {
        return false
      }

      seen.add(key)
      return true
    })
}

function getUrlHost(url) {
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

function formatSemester(row) {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    theme: row.theme,
    description: row.description,
    status: row.status,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function formatSubmission(row) {
  const memberNames = Array.isArray(row.member_names) ? row.member_names.filter(Boolean) : []

  return {
    id: row.id,
    semesterId: row.semester_id,
    groupName: row.group_name,
    workTitle: row.work_title,
    workType: row.work_type,
    url: row.url,
    urlHost: row.url_host,
    members: memberNames.join(', '),
    memberNames,
    submittedBy: row.submitted_by,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    deletedAt: row.deleted_at,
  }
}

function requireAdmin(req, res, next) {
  if (req.header('x-admin-key') !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Chave administrativa invalida.' })
  }

  return next()
}

async function getCatalog() {
  const semesterResult = await pool.query(
    `
      SELECT
        s.*,
        COUNT(w.id) FILTER (WHERE w.status = 'active') AS submission_count
      FROM semesters s
      LEFT JOIN works w ON w.semester_id = s.id
      GROUP BY s.id
      ORDER BY s.is_active DESC, s.code DESC
    `,
  )

  const workResult = await pool.query(
    `
      SELECT
        w.*,
        COALESCE(
          ARRAY_AGG(wm.member_name ORDER BY wm.member_order)
          FILTER (WHERE wm.member_name IS NOT NULL),
          '{}'
        ) AS member_names
      FROM works w
      LEFT JOIN work_members wm ON wm.work_id = w.id
      WHERE w.status = 'active'
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `,
  )

  const semesters = semesterResult.rows.map((row) => ({
    ...formatSemester(row),
    submissionCount: Number(row.submission_count),
    submissions: [],
  }))

  const semesterMap = new Map(semesters.map((semester) => [semester.id, semester]))

  for (const row of workResult.rows) {
    const semester = semesterMap.get(row.semester_id)

    if (semester) {
      semester.submissions.push(formatSubmission(row))
    }
  }

  const activeSemester =
    semesters.find((semester) => semester.isActive && semester.status === 'open') || null

  return {
    activeSemester,
    semesters,
    adminConfigured: Boolean(ADMIN_SECRET),
  }
}

app.get('/api/health', async (_req, res) => {
  const result = await pool.query('SELECT NOW() AS now')
  res.json({ ok: true, now: result.rows[0].now })
})

app.get('/api/catalog', async (_req, res) => {
  res.json(await getCatalog())
})

app.post('/api/submissions', async (req, res) => {
  const data = submissionSchema.parse(req.body)
  const memberNames = normalizeMemberNames(data.members)

  if (memberNames.length === 0) {
    return res.status(400).json({ error: 'Informe pelo menos um integrante do grupo.' })
  }

  let semesterId = data.semesterId

  if (!semesterId) {
    const activeResult = await pool.query(
      'SELECT id FROM semesters WHERE is_active = TRUE AND status = $1 LIMIT 1',
      ['open'],
    )

    if (activeResult.rowCount === 0) {
      return res.status(400).json({ error: 'Nao existe semestre aberto para receber trabalhos.' })
    }

    semesterId = activeResult.rows[0].id
  }

  const semesterCheck = await pool.query(
    'SELECT id, status FROM semesters WHERE id = $1 LIMIT 1',
    [semesterId],
  )

  if (semesterCheck.rowCount === 0) {
    return res.status(404).json({ error: 'Semestre nao encontrado.' })
  }

  if (semesterCheck.rows[0].status !== 'open') {
    return res.status(400).json({ error: 'Este semestre esta arquivado e nao aceita novos envios.' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const insertResult = await client.query(
      `
        INSERT INTO works (
          semester_id,
          group_name,
          work_title,
          work_type,
          url,
          url_host,
          submitted_by,
          description
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `,
      [
        semesterId,
        data.groupName,
        data.workTitle,
        data.workType,
        data.url,
        getUrlHost(data.url),
        data.submittedBy,
        data.description ?? '',
      ],
    )

    const work = insertResult.rows[0]

    for (const [index, memberName] of memberNames.entries()) {
      await client.query(
        `
          INSERT INTO work_members (work_id, member_name, member_order)
          VALUES ($1, $2, $3)
        `,
        [work.id, memberName, index + 1],
      )
    }

    await client.query(
      `
        INSERT INTO work_activity_logs (work_id, action, actor, details)
        VALUES ($1, 'created', $2, $3::jsonb)
      `,
      [
        work.id,
        data.submittedBy,
        JSON.stringify({
          semesterId,
          memberNames,
          urlHost: getUrlHost(data.url),
        }),
      ],
    )

    const createdResult = await client.query(
      `
        SELECT
          w.*,
          COALESCE(
            ARRAY_AGG(wm.member_name ORDER BY wm.member_order)
            FILTER (WHERE wm.member_name IS NOT NULL),
            '{}'
          ) AS member_names
        FROM works w
        LEFT JOIN work_members wm ON wm.work_id = w.id
        WHERE w.id = $1
        GROUP BY w.id
      `,
      [work.id],
    )

    await client.query('COMMIT')
    return res.status(201).json(formatSubmission(createdResult.rows[0]))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})

app.post('/api/admin/semesters', requireAdmin, async (req, res) => {
  const data = semesterCreateSchema.parse(req.body)
  const client = await pool.connect()
  const isActive = data.status === 'archived' ? false : data.isActive

  try {
    await client.query('BEGIN')

    if (isActive) {
      await client.query('UPDATE semesters SET is_active = FALSE WHERE is_active = TRUE')
    }

    const result = await client.query(
      `
        INSERT INTO semesters (code, title, theme, description, status, is_active)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [data.code, data.title, data.theme, data.description, data.status, isActive],
    )

    await client.query('COMMIT')
    res.status(201).json(formatSemester(result.rows[0]))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})

app.patch('/api/admin/semesters/:id', requireAdmin, async (req, res) => {
  const semesterId = Number(req.params.id)
  const data = semesterUpdateSchema.parse(req.body)

  if (!Number.isInteger(semesterId) || semesterId <= 0) {
    return res.status(400).json({ error: 'Identificador do semestre invalido.' })
  }

  const existingResult = await pool.query('SELECT * FROM semesters WHERE id = $1', [semesterId])

  if (existingResult.rowCount === 0) {
    return res.status(404).json({ error: 'Semestre nao encontrado.' })
  }

  const current = existingResult.rows[0]
  const requestedStatus = data.status ?? current.status
  const requestedIsActive = data.isActive ?? current.is_active
  const normalizedIsActive = requestedStatus === 'archived' ? false : requestedIsActive
  const nextValues = {
    title: data.title ?? current.title,
    theme: data.theme ?? current.theme,
    description: data.description ?? current.description,
    status: requestedStatus,
    isActive: normalizedIsActive,
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    if (nextValues.isActive) {
      await client.query('UPDATE semesters SET is_active = FALSE WHERE is_active = TRUE')
    }

    const result = await client.query(
      `
        UPDATE semesters
        SET
          title = $1,
          theme = $2,
          description = $3,
          status = $4,
          is_active = $5,
          updated_at = NOW()
        WHERE id = $6
        RETURNING *
      `,
      [
        nextValues.title,
        nextValues.theme,
        nextValues.description,
        nextValues.status,
        nextValues.isActive,
        semesterId,
      ],
    )

    await client.query('COMMIT')
    res.json(formatSemester(result.rows[0]))
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})

app.delete('/api/admin/semesters/:id', requireAdmin, async (req, res) => {
  const semesterId = Number(req.params.id)

  if (!Number.isInteger(semesterId) || semesterId <= 0) {
    return res.status(400).json({ error: 'Identificador do semestre invalido.' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existingResult = await client.query(
      `
        SELECT s.*, COUNT(w.id) FILTER (WHERE w.status = 'active') AS submission_count
        FROM semesters s
        LEFT JOIN works w ON w.semester_id = s.id
        WHERE s.id = $1
        GROUP BY s.id
      `,
      [semesterId],
    )

    if (existingResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Semestre nao encontrado.' })
    }

    const semester = existingResult.rows[0]

    await client.query('DELETE FROM semesters WHERE id = $1', [semesterId])

    if (semester.is_active) {
      const replacementResult = await client.query(
        `
          SELECT id
          FROM semesters
          WHERE status = 'open'
          ORDER BY code DESC
          LIMIT 1
        `,
      )

      if (replacementResult.rowCount > 0) {
        await client.query('UPDATE semesters SET is_active = TRUE, updated_at = NOW() WHERE id = $1', [
          replacementResult.rows[0].id,
        ])
      }
    }

    await client.query('COMMIT')
    return res.json({
      id: semester.id,
      code: semester.code,
      deleted: true,
      deletedWorkCount: Number(semester.submission_count),
    })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})

app.delete('/api/admin/submissions/:id', requireAdmin, async (req, res) => {
  const submissionId = Number(req.params.id)
  const data = deleteSubmissionSchema.parse(req.body ?? {})

  if (!Number.isInteger(submissionId) || submissionId <= 0) {
    return res.status(400).json({ error: 'Identificador do trabalho invalido.' })
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existingResult = await client.query(
      `
        SELECT id, status, submitted_by
        FROM works
        WHERE id = $1
        LIMIT 1
      `,
      [submissionId],
    )

    if (existingResult.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Trabalho nao encontrado.' })
    }

    if (existingResult.rows[0].status === 'deleted') {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Este trabalho ja foi excluido.' })
    }

    const deletedBy = data.deletedBy || req.header('x-admin-key') || 'monitor'

    const result = await client.query(
      `
        UPDATE works
        SET
          status = 'deleted',
          deleted_at = NOW(),
          deleted_by = $1,
          deleted_reason = $2,
          updated_at = NOW()
        WHERE id = $3
        RETURNING *
      `,
      [deletedBy, data.reason ?? '', submissionId],
    )

    await client.query(
      `
        INSERT INTO work_activity_logs (work_id, action, actor, details)
        VALUES ($1, 'deleted', $2, $3::jsonb)
      `,
      [
        submissionId,
        deletedBy,
        JSON.stringify({
          reason: data.reason ?? '',
        }),
      ],
    )

    await client.query('COMMIT')
    return res.json({
      id: result.rows[0].id,
      status: result.rows[0].status,
      deletedAt: result.rows[0].deleted_at,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
})

app.use((error, _req, res, next) => {
  void next
  console.error(error)

  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Dados invalidos.',
      details: error.issues.map((issue) => issue.message),
    })
  }

  return res.status(500).json({ error: 'Erro interno do servidor.' })
})

async function startServer() {
  await ensureInitialized()

  app.listen(PORT, () => {
    console.log(`API do WebQuest rodando na porta ${PORT}.`)
  })
}

export function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase()
  }

  return initializationPromise
}

if (!process.env.VERCEL) {
  startServer().catch((error) => {
    console.error('Falha ao iniciar a API.', error)
    process.exit(1)
  })
}
