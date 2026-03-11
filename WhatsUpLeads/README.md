# WhatsUp Leads

Sistema SaaS multi-tenant para automação de campanhas WhatsApp com integração a múltiplos provedores.

## Desenvolvimento

### Pré-requisitos
- Node.js 20+
- pnpm
- PostgreSQL
- Redis (para filas)

### Setup Local

```bash
# Instalar dependências
pnpm install

# Configurar banco de dados
cp .env.example .env
# Edite o .env com suas configurações

# Executar migrações
pnpm db:migrate

# Iniciar servidor de desenvolvimento
pnpm dev
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev                    # Servidor de desenvolvimento
pnpm build                  # Build de produção
pnpm start                  # Servidor de produção

# Banco de dados
pnpm db:migrate             # Migrações (desenvolvimento)
pnpm db:migrate:prod        # Migrações (produção)
pnpm db:generate            # Gerar cliente Prisma
pnpm db:studio              # Interface visual do banco

# Docker
pnpm docker:build           # Build local
pnpm docker:ghcr:latest     # Build e push para GHCR

# Worker (filas)
pnpm worker:start           # Worker de desenvolvimento
pnpm worker:prod            # Worker de produção
```

## Deploy em Produção

### Docker Swarm (Recomendado)

O sistema está configurado para deploy automático com Docker Swarm, incluindo migrações automáticas.

```bash
# Deploy com migração automática (recomendado)
./scripts/deploy-with-migration.sh whatsup

# Ou deploy tradicional com serviço migrate integrado
docker stack deploy -c docker-stack.yml whatsup
```

### Variáveis de Ambiente Obrigatórias

```bash
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=seu-jwt-secret-super-seguro
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=senha-admin
```

### Migrações Automáticas

**Abordagem Recomendada**: O script `deploy-with-migration.sh` executa migrações em duas etapas:

1. **Etapa 1**: Executa migração em serviço temporário
2. **Etapa 2**: Deploy da aplicação com banco já migrado
3. **Logs**: Migração é monitorada com timeout de 5 minutos

**Abordagem Alternativa**: O `docker-stack.yml` inclui serviço `migrate` integrado que roda junto com a stack.

Para mais detalhes, veja: [docs/MIGRATIONS-DEPLOY.md](docs/MIGRATIONS-DEPLOY.md)

### CI/CD

O GitHub Actions está configurado para:
- Build automático da imagem Docker
- Push para GitHub Container Registry
- Deploy via webhook (Portainer)

## Arquitetura

### Componentes
- **App**: Aplicação Next.js principal
- **Worker**: Processamento de filas (BullMQ)
- **Redis**: Cache e filas
- **PostgreSQL**: Banco de dados principal

### Provedores WhatsApp
- **PAPI**: Provider interno
- **UazAPI**: Provider externo
- **WuzAPI**: Provider externo
- **Meta Cloud**: API oficial do WhatsApp

## Documentação

- [Arquitetura SaaS Multi-tenant](docs/ARQUITETURA-SAAS-MULTITENANT-COMPLETA.md)
- [Deploy e Migrações](docs/MIGRATIONS-DEPLOY.md)
- [Planos e Billing](docs/PLANOS-E-BILLING.md)
- [Troubleshooting de Build](docs/BUILD-TROUBLESHOOTING.md)

## Tecnologias

- **Frontend**: Next.js 16, React, TailwindCSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Banco**: PostgreSQL, Redis
- **Filas**: BullMQ
- **Deploy**: Docker Swarm, GitHub Actions
- **Auth**: JWT, Role-based access

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
