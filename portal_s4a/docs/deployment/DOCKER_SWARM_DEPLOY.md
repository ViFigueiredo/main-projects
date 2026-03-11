# Deploy Docker Swarm + Portainer

## Visao geral

Este projeto utiliza um unico arquivo de stack para deploy em Docker Swarm + Portainer:

- `docker-stack.yaml`

Redes obrigatorias do ambiente:

- `internal`
- `databases`
- `tunnel`
- `public`

## Pre-requisitos

- Docker Swarm inicializado
- Portainer configurado
- Registro de imagens GHCR acessivel
- Redes externas criadas no Swarm

## 1) Criacao das redes externas

```bash
docker network create --driver overlay --attachable internal
docker network create --driver overlay --attachable databases
docker network create --driver overlay --attachable tunnel
docker network create --driver overlay --attachable public
```

## 2) Deploy pela CLI

```bash
docker stack deploy -c docker-stack.yaml portal-s4a
```

## 3) Deploy pelo Portainer

1. Acesse Stacks > Add stack.
2. Nome da stack: `portal-s4a`.
3. Cole o conteudo de `docker-stack.yaml`.
4. Configure variaveis de ambiente.
5. Clique em Deploy the stack.

## 4) Variaveis minimas

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

## 5) Operacao

```bash
docker stack services portal-s4a
docker service logs portal-s4a_app -f
docker service scale portal-s4a_app=3
docker stack rm portal-s4a
```

## 6) Regra de governanca

Se o modelo de deploy, redes ou variaveis obrigatorias mudarem, atualize na mesma entrega:

- `docker-stack.yaml`
- este guia (`docs/deployment/DOCKER_SWARM_DEPLOY.md`)
- `AGENTS.md`
- `README.md` (quando impactar onboarding)
