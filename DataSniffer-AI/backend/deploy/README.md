# DataSniffer AI - Docker Swarm Deployment

## Pré-requisitos

1. Docker instalado (versão 20.10+)
2. Docker Swarm inicializado
3. Acesso a um registry (GitHub Container Registry, Docker Hub, etc.)
4. Variáveis de ambiente configuradas

## Configuração Rápida

### 1. Inicializar Docker Swarm (se ainda não estiver)

```bash
# No nó manager
docker swarm init

# Para adicionar workers (execute o comando mostrado após o init)
docker swarm join --token <token> <manager-ip>:2377
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend/`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-min-32-chars
```

### 3. Build e Deploy

#### Opção A: Script Python (Recomendado para GHCR)

```bash
cd backend

# Instalar dependências (se necessário)
pip install python-dotenv

# Deploy para GitHub Container Registry
python deploy/deploy_ghcr.py

# Com tag específica
python deploy/deploy_ghcr.py --tag v1.0.0

# Sem cache (rebuild completo)
python deploy/deploy_ghcr.py --no-cache

# Apenas push (sem rebuild)
python deploy/deploy_ghcr.py --push-only
```

Credenciais necessárias no `.env`:
```env
USER_GITHUB=seu-usuario-github
GITHUB_GHCR_KEY=ghp_seu_token_com_write_packages
```

#### Opção B: Script Bash

```bash
cd backend

# Dar permissão ao script
chmod +x deploy/swarm-deploy.sh

# Build da imagem
./deploy/swarm-deploy.sh build

# Push para registry (opcional, necessário para multi-node)
./deploy/swarm-deploy.sh build --push

# Deploy do stack
./deploy/swarm-deploy.sh deploy
```

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `build` | Constrói a imagem Docker |
| `build --push` | Constrói e envia para o registry |
| `deploy` | Faz deploy do stack no Swarm |
| `update` | Atualização rolling (build + push + update) |
| `logs` | Mostra logs do serviço |
| `status` | Mostra status do stack |
| `scale N` | Escala para N réplicas |
| `remove` | Remove o stack |
| `secrets` | Cria os secrets do Docker |

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Swarm                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │                 Traefik (Load Balancer)          │    │
│  │                 api.yourdomain.com               │    │
│  └─────────────────────────────────────────────────┘    │
│                          │                               │
│            ┌─────────────┼─────────────┐                │
│            ▼             ▼             ▼                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │   Backend    │ │   Backend    │ │   Backend    │    │
│  │  Replica 1   │ │  Replica 2   │ │  Replica N   │    │
│  │   :5000      │ │   :5000      │ │   :5000      │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│            │             │             │                │
│            └─────────────┼─────────────┘                │
│                          ▼                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Supabase (External)                 │    │
│  │              PostgreSQL + Auth                   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Configuração com Traefik

O `docker-stack.yml` já inclui labels para Traefik. Para usar:

1. Certifique-se que o Traefik está rodando no Swarm
2. Edite o `docker-stack.yml` e altere `api.yourdomain.com` para seu domínio
3. Configure o DNS para apontar para seu cluster

### Deploy do Traefik (se necessário)

```bash
docker network create --driver=overlay --attachable traefik-public

docker service create \
  --name traefik \
  --constraint=node.role==manager \
  --publish 80:80 \
  --publish 443:443 \
  --mount type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock \
  --network traefik-public \
  traefik:v2.10 \
  --providers.docker \
  --providers.docker.swarmMode=true \
  --providers.docker.exposedbydefault=false \
  --entrypoints.web.address=:80 \
  --entrypoints.websecure.address=:443 \
  --certificatesresolvers.letsencrypt.acme.httpchallenge=true \
  --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web \
  --certificatesresolvers.letsencrypt.acme.email=your@email.com \
  --certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json
```

## Monitoramento

### Ver logs em tempo real
```bash
./deploy/swarm-deploy.sh logs
```

### Ver status dos serviços
```bash
./deploy/swarm-deploy.sh status
```

### Escalar serviço
```bash
# Escalar para 3 réplicas
./deploy/swarm-deploy.sh scale 3
```

## Troubleshooting

### Serviço não inicia
```bash
# Ver logs detalhados
docker service logs datasniffer_backend --tail 100

# Ver tasks com erros
docker service ps datasniffer_backend --no-trunc
```

### Secrets não encontrados
```bash
# Listar secrets
docker secret ls

# Recriar secrets
docker secret rm supabase_url supabase_service_role_key jwt_secret
./deploy/swarm-deploy.sh secrets
```

### Health check falhando
```bash
# Testar endpoint manualmente
curl http://localhost:5000/status

# Ver logs do container
docker logs $(docker ps -q -f name=datasniffer_backend)
```

## Variáveis de Ambiente

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `SUPABASE_URL` | URL do projeto Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Key do Supabase | Sim |
| `JWT_SECRET` | Secret para tokens JWT (min 32 chars) | Sim |
| `PORT` | Porta do servidor (default: 5000) | Não |
| `DOCKER_REGISTRY` | Registry para imagens | Não |
| `TAG` | Tag da imagem (default: latest) | Não |

## Segurança

- Nunca commite o arquivo `.env` no repositório
- Use Docker Secrets em produção (já configurado)
- Mantenha as imagens atualizadas
- Configure HTTPS via Traefik
- Limite recursos por container (já configurado no stack)
