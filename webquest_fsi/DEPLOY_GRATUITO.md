# Deploy Gratuito com Docker

Este projeto ja esta preparado para deploy usando os containers de producao:

- `frontend`: React compilado e servido por `nginx`
- `api`: Express em modo producao
- `postgres`: banco persistente em volume Docker

## Melhor rota gratuita

Se voce quer aproveitar os containers que ja existem, a melhor rota e usar uma VM gratuita e subir o `docker compose` nela.

Recomendacao pratica:

- Oracle Cloud Always Free

Motivo:

- permite rodar Docker o tempo inteiro
- aceita varios containers no mesmo host
- nao obriga separar frontend, API e banco em plataformas diferentes

## Arquivos de deploy

Use estes arquivos:

- `docker-compose.deploy.yml`
- `Dockerfile.frontend.prod`
- `Dockerfile.api.prod`
- `nginx.conf`

## Passo a passo resumido

### 1. Suba uma VM Ubuntu

Na Oracle Cloud, crie uma VM Ubuntu com IP publico.

### 2. Libere a porta 80

Abra a porta `80` na regra de entrada da VM.

### 3. Instale Docker e Compose

No servidor:

```bash
sudo apt update
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
docker --version
docker compose version
```

### 4. Clone o repositorio

```bash
git clone https://github.com/kauanrubem/Web-quest.git
cd Web-quest/webquest_fsi
```

### 5. Crie o arquivo de ambiente

```bash
cp .env.deploy.example .env.deploy
```

Edite o arquivo e deixe pelo menos:

```env
ADMIN_SECRET=troque-por-uma-chave-forte
PGUSER=postgres
PGPASSWORD=troque-por-uma-senha-forte
PGDATABASE=webquest_fsi
```

Observacao:

- nao exponha a porta do banco na internet
- o compose de deploy ja mantem o banco somente na rede interna dos containers

### 6. Suba o projeto

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml up -d --build
```

### 7. Verifique os containers

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml ps
docker compose --env-file .env.deploy -f docker-compose.deploy.yml logs -f
```

### 8. Acesse no navegador

Abra:

```text
http://IP_DA_SUA_VM
```

## Como funciona esse deploy

- o `frontend` responde na porta `80`
- o `nginx` encaminha `/api/*` para o container `api`
- a `api` conecta no `postgres` pela rede interna do Docker
- o banco fica persistido no volume `webquest_postgres_data`

## Atualizar depois de uma mudanca

Depois de subir novos commits:

```bash
git pull origin main
docker compose --env-file .env.deploy -f docker-compose.deploy.yml up -d --build
```

## Backup basico do banco

Para gerar backup:

```bash
docker compose --env-file .env.deploy -f docker-compose.deploy.yml exec postgres \
  pg_dump -U postgres webquest_fsi > backup_webquest.sql
```

## Observacoes importantes

- os containers atuais de desenvolvimento continuam existindo em `docker-compose.yml`
- o deploy usa o arquivo separado `docker-compose.deploy.yml`
- para HTTPS e dominio proprio, o passo seguinte recomendado e colocar um proxy reverso com SSL na frente
