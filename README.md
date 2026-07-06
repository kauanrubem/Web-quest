# WebQuest FSI

Projeto WebQuest para a disciplina **Fundamentos de Sistemas de Informacao**, com:

- frontend em `React + Vite + Tailwind CSS`
- backend em `Express`
- persistencia em `Postgres`
- acervo de trabalhos organizado por semestre
- painel simples do monitor para criar, ativar e arquivar semestres

## Funcionalidades

- exibe o roteiro do WebQuest baseado na atividade de TI Verde
- recebe envios de trabalhos por link do YouTube, Drive ou URL externa
- salva os links no banco para consulta futura
- organiza os envios por semestre, como `2026.1` e `2026.2`
- mantem historico de semestres anteriores acessivel para novas turmas
- controla exclusao de trabalhos diretamente no banco, com rastreio administrativo

## Estrutura

- `src/`: interface React
- `server/`: API Express e inicializacao do banco
- `server/schema.js`: schema SQL e seed inicial

## Modelo de banco

O banco foi modelado para tratar cada trabalho como uma entidade completa:

- `semesters`: semestres letivos e estado do periodo
- `works`: trabalho enviado, link, tipo, grupo, responsavel, status e metadados
- `work_members`: integrantes normalizados por trabalho
- `work_activity_logs`: trilha de auditoria para criacao, migracao e exclusao

Detalhes importantes:

- os trabalhos nao ficam apenas como texto solto, e sim como registros relacionais
- os integrantes ficam em tabela propria, o que melhora busca, manutencao e evolucao futura
- a exclusao de trabalhos e feita por `soft delete`, marcando o status como `deleted`
- o acervo exibe apenas trabalhos ativos, mas o historico administrativo permanece no banco

## Requisitos

- Node.js 20+
- Postgres 14+

## Configuracao

1. Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Ajuste as credenciais do Postgres em `.env`.

3. Com o servidor PostgreSQL ja instalado e em execucao, crie o banco:

```bash
npm run db:create
```

4. Inicialize as tabelas:

```bash
npm run db:init
```

Se preferir, voce tambem pode criar o banco manualmente:

```sql
CREATE DATABASE webquest_fsi;
```

## Rodando em desenvolvimento

```bash
npm install
npm run db:create
npm run db:init
npm run dev
```

O comando sobe:

- frontend Vite em `http://localhost:5173`
- API Express em `http://localhost:3001`

## Rodando com Docker Desktop

O projeto tambem pode ser executado via containers, com servicos separados para frontend, API e Postgres.

```bash
docker compose up -d --build
```

Containers criados:

- `webquest-frontend`
- `webquest-api`
- `webquest-postgres`

Portas expostas:

- `5173`: frontend
- `3001`: API
- `5435`: Postgres

Para acompanhar logs:

```bash
docker compose logs -f
```

Para parar os containers:

```bash
docker compose down
```

Para remover tambem o volume do banco:

```bash
docker compose down -v
```

## Variaveis de ambiente

- `PORT`: porta da API
- `ADMIN_SECRET`: chave usada no painel do monitor
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: conexao com Postgres
- `DATABASE_URL`: alternativa para string completa de conexao
- `PGSSL`: use `true` se o Postgres exigir SSL

## Fluxo recomendado de uso

1. Mantenha um semestre ativo e aberto para novos envios.
2. Ao finalizar o periodo, arquive esse semestre no painel.
3. Crie o novo semestre e marque-o como ativo.
4. Os trabalhos antigos continuam disponiveis na listagem por semestre.

## Endpoints principais

- `GET /api/catalog`: retorna semestres, semestre ativo e trabalhos
- `POST /api/submissions`: registra um novo trabalho
- `DELETE /api/admin/submissions/:id`: exclui logicamente um trabalho do acervo
- `POST /api/admin/semesters`: cria semestre
- `PATCH /api/admin/semesters/:id`: atualiza status e semestre ativo

## Observacoes

- O projeto cria automaticamente um semestre inicial `2026.1` ao inicializar o banco pela primeira vez.
- O painel do monitor exige a chave configurada em `ADMIN_SECRET`.
- Neste ambiente de edicao, o servidor PostgreSQL nao pode ser instalado automaticamente por falta de privilegios de sistema. Na sua maquina, basta iniciar o Postgres local e executar os scripts acima.
