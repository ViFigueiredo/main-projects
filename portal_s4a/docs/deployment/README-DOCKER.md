# Docker Deployment (Resumo)

## Stack unico

O deploy Docker em producao e staging e centralizado em:

- `docker-stack.yaml`

Comando canonico:

```bash
docker stack deploy -c docker-stack.yaml portal-s4a
```

## Redes obrigatorias

- `internal`
- `databases`
- `tunnel`
- `public`

## Variaveis obrigatorias minimas

```env
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
AUTH_SESSION_SECRET=troque-por-um-segredo-forte
ADMIN_EMAIL=admin@empresa.com
ADMIN_PASSWORD=senha-segura
STORAGE_BUCKET_NAME=...
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_REGION=...
STORAGE_ENDPOINT=...
```

## Guias relacionados

- `docs/deployment/DOCKER_SWARM_DEPLOY.md`
- `docs/deployment/DOCKER_GITHUB_ACTIONS_GUIDE.md`

## Regra de manutencao

Sempre que o fluxo de deploy Docker mudar, atualizar na mesma entrega:

- `docker-stack.yaml`
- `docs/deployment/README-DOCKER.md`
- `docs/deployment/DOCKER_SWARM_DEPLOY.md`
- `AGENTS.md`
