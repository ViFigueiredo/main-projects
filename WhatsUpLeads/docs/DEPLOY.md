# Deploy Guide - WhatsUp Leads

## Opções de Deploy

| Método | Descrição | Uso |
|--------|-----------|-----|
| Docker Compose | Single server | Desenvolvimento/Staging |
| Docker Swarm | Multi-node cluster | Produção |
| Vercel | Serverless | Produção (sem worker) |

---

## Docker Swarm + Portainer (Recomendado para Produção)

### Pré-requisitos

- Docker instalado
- Domínios configurados (DNS apontando para o servidor)
- Portas 80 e 443 liberadas

### 1. Inicializar Swarm

```bash
# No servidor principal (manager)
docker swarm init

# Para adicionar workers (opcional)
docker swarm join-token worker
```

### 2. Configurar Variáveis

```bash
cp .env.example .env
# Edite o .env com suas configurações
```

Variáveis importantes:
```env
# Domínios
APP_DOMAIN=app.seudominio.com
PORTAINER_DOMAIN=portainer.seudominio.com
TRAEFIK_DOMAIN=traefik.seudominio.com

# Let's Encrypt
ACME_EMAIL=seu@email.com

# GHCR
GITHUB_USER=seu-usuario
GITHUB_TOKEN=ghp_xxx
GITHUB_REPOSITORY=seu-usuario/whatsup-leads

# Database
DATABASE_URL=postgresql://...

# Auth
JWT_SECRET=sua-chave-secreta
ADMIN_PASSWORD=senha-segura
```

### 3. Deploy

```bash
# Deploy completo (Traefik + Portainer + App)
pnpm swarm:all

# Ou passo a passo:
pnpm swarm:init      # Cria networks
pnpm swarm:infra     # Deploy Traefik + Portainer
pnpm swarm:deploy    # Deploy aplicação
```

### 4. Comandos Úteis

```bash
# Ver status
pnpm swarm:status

# Ver logs
pnpm swarm:logs app
pnpm swarm:logs worker

# Atualizar para nova versão
pnpm swarm:update

# Escalar serviços
bash scripts/swarm-deploy.sh scale app 3
bash scripts/swarm-deploy.sh scale worker 2

# Remover tudo
pnpm swarm:remove
```

### 5. Acessos

Após o deploy:
- **App**: https://app.seudominio.com
- **Portainer**: https://portainer.seudominio.com
- **Traefik**: https://traefik.seudominio.com

---

### Configuração de Secrets no GitHub

Vá em **Settings > Secrets and variables > Actions** e adicione:

#### Obrigatórios
| Secret | Descrição |
|--------|-----------|
| `DATABASE_URL_PRODUCTION` | URL do banco PostgreSQL (produção) |
| `DATABASE_URL_DEVELOP` | URL do banco PostgreSQL (desenvolvimento) |

#### Opcionais
| Secret | Descrição |
|--------|-----------|
| `APP_URL_PRODUCTION` | URL pública da aplicação (produção) |
| `APP_URL_DEVELOP` | URL pública da aplicação (desenvolvimento) |

### Tags Geradas

O workflow gera automaticamente as seguintes tags:

| Branch | Tags |
|--------|------|
| `main` | `latest`, `main`, `main-<sha>` |
| `develop` | `develop`, `develop-<sha>` |

### Pull da Imagem

```bash
# Login no GHCR
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull da imagem
docker pull ghcr.io/OWNER/REPO:latest
docker pull ghcr.io/OWNER/REPO:develop
docker pull ghcr.io/OWNER/REPO:main-abc1234
```

## Deploy com Docker Compose

### 1. Criar arquivo .env

```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 2. Variáveis de Ambiente

```env
# Database (obrigatório)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Auth (obrigatório)
JWT_SECRET=sua-chave-secreta-aqui
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=senha-segura

# App
NEXT_PUBLIC_APP_URL=https://seudominio.com

# QStash (opcional - para filas)
QSTASH_ACTIVE=true
QSTASH_TOKEN=seu-token
QSTASH_CURRENT_SIGNING_KEY=sua-key
QSTASH_NEXT_SIGNING_KEY=sua-key
QSTASH_CALLBACK_URL=https://seudominio.com

# OpenRouter (opcional - para IA)
OPENROUTER_API_KEY=sua-key

# AWS S3 (opcional - para uploads)
AWS_S3_BUCKET=seu-bucket
AWS_ACCESS_KEY_ID=sua-key
AWS_SECRET_ACCESS_KEY=sua-secret
```

### 3. Iniciar

```bash
# Usando docker-compose
docker-compose up -d

# Ou usando o script
chmod +x scripts/deploy.sh
./scripts/deploy.sh up
```

### 4. Comandos Úteis

```bash
# Ver logs
./scripts/deploy.sh logs

# Atualizar para última versão
./scripts/deploy.sh update

# Reiniciar
./scripts/deploy.sh restart

# Parar
./scripts/deploy.sh down
```

## Deploy Manual

### Build Local

```bash
docker build \
  --build-arg DATABASE_URL="sua-url" \
  --build-arg NEXT_PUBLIC_APP_URL="https://seudominio.com" \
  -t whatsup-leads:local \
  .
```

### Run

```bash
docker run -d \
  --name whatsup-leads \
  -p 3000:3000 \
  -e DATABASE_URL="sua-url" \
  -e JWT_SECRET="sua-chave" \
  -e ADMIN_EMAIL="admin@email.com" \
  -e ADMIN_PASSWORD="senha" \
  whatsup-leads:local
```

## Health Check

A aplicação expõe um endpoint de health check:

```bash
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

## Troubleshooting

### Erro de Prisma Client

Se aparecer erro relacionado ao Prisma, execute:

```bash
docker exec -it whatsup-leads npx prisma generate
```

### Erro de conexão com banco

Verifique se a `DATABASE_URL` está correta e se o banco aceita conexões do IP do container.

### Logs

```bash
docker logs -f whatsup-leads
```


---

## Arquitetura Swarm

```
┌─────────────────────────────────────────────────────────────┐
│                      TRAEFIK (Load Balancer)                │
│                    Ports: 80, 443 (HTTPS)                   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   App (x2)    │   │   Portainer   │   │    Traefik    │
│   Port 3000   │   │   Port 9000   │   │   Dashboard   │
└───────────────┘   └───────────────┘   └───────────────┘
        │
        ▼
┌───────────────┐   ┌───────────────┐
│    Worker     │◄──│     Redis     │
│   (BullMQ)    │   │   Port 6379   │
└───────────────┘   └───────────────┘
```

## Scaling

```bash
# Escalar app para 3 réplicas
docker service scale whatsup_app=3

# Escalar workers
docker service scale whatsup_worker=2
```

## Monitoramento

O Portainer oferece:
- Visualização de containers/services
- Logs em tempo real
- Métricas de recursos
- Deploy de stacks via UI
- Gerenciamento de secrets

## Rollback

```bash
# Rollback automático em caso de falha
# Configurado no docker-stack.yml

# Rollback manual
docker service rollback whatsup_app
```
