export const schemaSql = `
  CREATE TABLE IF NOT EXISTS semesters (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    theme VARCHAR(160) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT semesters_status_check CHECK (status IN ('open', 'archived'))
  );

  CREATE TABLE IF NOT EXISTS works (
    id BIGSERIAL PRIMARY KEY,
    legacy_submission_id BIGINT UNIQUE,
    semester_id BIGINT NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    group_name VARCHAR(120) NOT NULL,
    work_title VARCHAR(180) NOT NULL,
    work_type VARCHAR(30) NOT NULL,
    url TEXT NOT NULL,
    url_host VARCHAR(255),
    submitted_by VARCHAR(120) NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    deleted_at TIMESTAMPTZ,
    deleted_by VARCHAR(120),
    deleted_reason TEXT NOT NULL DEFAULT '',
    CONSTRAINT works_work_type_check CHECK (
      work_type IN ('youtube', 'drive', 'link', 'slides', 'podcast', 'outro')
    ),
    CONSTRAINT works_status_check CHECK (
      status IN ('active', 'deleted')
    )
  );

  CREATE TABLE IF NOT EXISTS work_members (
    id BIGSERIAL PRIMARY KEY,
    work_id BIGINT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    member_name VARCHAR(120) NOT NULL,
    member_order SMALLINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT work_members_order_check CHECK (member_order > 0),
    CONSTRAINT work_members_unique_order UNIQUE (work_id, member_order)
  );

  CREATE TABLE IF NOT EXISTS work_activity_logs (
    id BIGSERIAL PRIMARY KEY,
    work_id BIGINT NOT NULL REFERENCES works(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL,
    actor VARCHAR(120) NOT NULL DEFAULT '',
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT work_activity_logs_action_check CHECK (
      action IN ('created', 'updated', 'deleted', 'restored', 'migrated')
    )
  );

  CREATE INDEX IF NOT EXISTS idx_works_semester_status
    ON works (semester_id, status, created_at DESC);

  CREATE INDEX IF NOT EXISTS idx_works_url_host
    ON works (url_host);

  CREATE INDEX IF NOT EXISTS idx_work_members_work_id
    ON work_members (work_id, member_order);

  CREATE INDEX IF NOT EXISTS idx_work_activity_logs_work_id
    ON work_activity_logs (work_id, created_at DESC);

  ALTER TABLE semesters
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

  ALTER TABLE works
    ADD COLUMN IF NOT EXISTS legacy_submission_id BIGINT UNIQUE,
    ADD COLUMN IF NOT EXISTS url_host VARCHAR(255),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS deleted_by VARCHAR(120),
    ADD COLUMN IF NOT EXISTS deleted_reason TEXT NOT NULL DEFAULT '';

  DO $$
  BEGIN
    IF to_regclass('public.submissions') IS NOT NULL THEN
      INSERT INTO works (
        legacy_submission_id,
        semester_id,
        group_name,
        work_title,
        work_type,
        url,
        url_host,
        submitted_by,
        description,
        created_at,
        updated_at,
        status
      )
      SELECT
        s.id,
        s.semester_id,
        s.group_name,
        s.work_title,
        s.work_type,
        s.url,
        CASE
          WHEN POSITION('://' IN s.url) > 0 THEN SPLIT_PART(SPLIT_PART(s.url, '://', 2), '/', 1)
          ELSE NULL
        END,
        s.submitted_by,
        s.description,
        s.created_at,
        s.created_at,
        'active'
      FROM submissions s
      ON CONFLICT (legacy_submission_id) DO NOTHING;

      DELETE FROM work_members wm
      USING works w, submissions s
      WHERE wm.work_id = w.id
        AND w.legacy_submission_id = s.id
        AND wm.member_name ~ E'[\\n,;]';

      INSERT INTO work_members (work_id, member_name, member_order)
      SELECT
        w.id,
        BTRIM(member_parts.member_name),
        member_parts.member_order::SMALLINT
      FROM submissions s
      INNER JOIN works w ON w.legacy_submission_id = s.id
      CROSS JOIN LATERAL REGEXP_SPLIT_TO_TABLE(s.members, E'[\\n,;]+')
        WITH ORDINALITY AS member_parts(member_name, member_order)
      LEFT JOIN work_members wm ON wm.work_id = w.id
      WHERE wm.id IS NULL
        AND NULLIF(BTRIM(member_parts.member_name), '') IS NOT NULL;

      INSERT INTO work_activity_logs (work_id, action, actor, details)
      SELECT
        w.id,
        'migrated',
        'system',
        jsonb_build_object(
          'legacySubmissionId', s.id,
          'migratedAt', NOW()
        )
      FROM submissions s
      INNER JOIN works w ON w.legacy_submission_id = s.id
      LEFT JOIN work_activity_logs wal
        ON wal.work_id = w.id
       AND wal.action = 'migrated'
      WHERE wal.id IS NULL;
    END IF;
  END $$;
`;

export const seedSql = `
  INSERT INTO semesters (code, title, theme, description, status, is_active)
  SELECT
    '2026.1',
    'FSI 2026.1',
    'TI Verde e Computacao Sustentavel',
    'Semestre inicial do WebQuest da disciplina Fundamentos de Sistemas de Informacao.',
    'open',
    TRUE
  WHERE NOT EXISTS (SELECT 1 FROM semesters);
`;
