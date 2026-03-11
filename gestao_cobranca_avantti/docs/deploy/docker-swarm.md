# Deploy no Docker Swarm

Este projeto possui suporte para deploy em Docker Swarm via `docker-stack.yml`.

## 1. Pré-requisitos

- Docker Engine 24+ em todos os nós
- Swarm inicializado no manager (`docker swarm init`)
- Registry acessível pelos nós (Docker Hub, GHCR, ECR, Harbor, etc.)

## 2. Preparar variáveis

1. Copie o arquivo de exemplo:

```bash
cp .env.swarm.example .env.swarm
```

2. Preencha os valores obrigatórios em `.env.swarm`:
- `DATABASE_URL`
- `NUXT_SECRET`
- `JWT_SECRET`
- `SUPER_ADMIN_EMAIL`
- `SUPER_ADMIN_PASSWORD`
- Variáveis `NUXT_S3_*` quando usar anexos
- Variáveis do Sentry, se habilitado
- Variáveis de rate limit (`NUXT_SECURITY_RATE_LIMITER_ENABLED`, `NUXT_SECURITY_RATE_LIMIT_TOKENS_PER_INTERVAL`, `NUXT_SECURITY_RATE_LIMIT_INTERVAL_MS`) para ambientes com proxy

Exemplo recomendado para Swarm + proxy:

```env
NUXT_ENABLE_DEV_LOGIN_BYPASS=false
JWT_SECRET=troque-por-um-segredo-forte
NUXT_SECURITY_RATE_LIMITER_ENABLED=true
NUXT_SECURITY_RATE_LIMIT_TOKENS_PER_INTERVAL=1200
NUXT_SECURITY_RATE_LIMIT_INTERVAL_MS=300000
```

Se o proxy/WAF externo ja aplicar rate limit global, voce pode delegar totalmente para ele:

```env
NUXT_SECURITY_RATE_LIMITER_ENABLED=false
```

## 3. Build e push da imagem

`docker stack deploy` não faz build local, então a imagem precisa estar no registry antes.

```bash
docker build -t registry.example.com/avantticob:2026-03-05 .
docker push registry.example.com/avantticob:2026-03-05
```

Se o build falhar por falta de memÃ³ria no `nuxt build`, aumente o limite:

```bash
docker build --build-arg NODE_OPTIONS_BUILD=--max-old-space-size=6144 -t registry.example.com/avantticob:2026-03-05 .
```

Atualize no `.env.swarm`:

```env
AVANTTICOB_IMAGE=registry.example.com/avantticob:2026-03-05
```

## 4. Deploy da stack

```bash
docker stack deploy -c docker-stack.yml avantticob
```

## 5. Verificação

```bash
docker stack services avantticob
docker service ps avantticob_avantticob
docker service logs -f avantticob_avantticob
```

## 6. Comportamento de migração Prisma

- O container executa `pnpm prisma migrate deploy` no startup.
- Controle via `RUN_MIGRATIONS`:
  - `true` (padrão): aplica migrações automaticamente
  - `false`: sobe a aplicação sem rodar migrações

## 7. Update e rollback

Novo release:

```bash
docker build -t registry.example.com/avantticob:2026-03-06 .
docker push registry.example.com/avantticob:2026-03-06
```

Atualize `AVANTTICOB_IMAGE` no `.env.swarm` e reaplique:

```bash
docker stack deploy -c docker-stack.yml avantticob
```

Rollback manual:

```bash
docker service rollback avantticob_avantticob
```

## 8. Deploy direto via GHCR (script)

Com as variaveis abaixo no `.env`:

```env
GITHUB_USER=
GITHUB_TOKEN=
GITHUB_REPOSITORY=
IMAGE_TAG=
```

Execute:

```bash
pnpm deploy:ghcr
```

O script `scripts/deploy-ghcr.ps1` faz login no GHCR, build/push da imagem e `docker stack deploy`.

## 9. Troubleshooting: "500 Too Many Requests" no login

1. Confirme que o dominio esta apontando para o Swarm (e nao para a Vercel):

```bash
nslookup cobranca.grupoavantti.com.br
```

2. Confirme `JWT_SECRET` definido na stack. O login e validacao de sessao usam `JWT_SECRET`.

3. Se houver proxy na frente (Traefik/Nginx/Cloudflare), aumente o limite no app ou desabilite o rate limiter do app e mantenha no proxy.

4. Reaplique a stack e valide logs:

```bash
docker stack deploy -c docker-stack.yml avantticob
docker service logs -f avantticob_avantticob
```
