# 🔄 Guia: Renomear Repositório para portal_s4a

## 📋 Passos para Atualização

### 1. Execute o Script de Atualização

```powershell
# Execute o script PowerShell
.\update-repo-name.ps1
```

### 2. Atualize o Remote do Git

```bash
# Atualizar URL do repositório remoto
git remote set-url origin https://github.com/ViFigueiredo/portal_s4a.git

# Verificar se foi atualizado
git remote -v
```

### 3. Commit e Push das Alterações

```bash
# Adicionar todas as alterações
git add .

# Fazer commit
git commit -m "chore: update repository name to portal_s4a"

# Push para o novo repositório
git push origin main
```

## 🔍 Arquivos Atualizados

### ✅ Arquivos de Configuração Docker

- `README-DOCKER.md`
- `docker-stack.yaml`
- `scripts/deploy-production.ps1`
- `scripts/deploy-production.sh`
- `scripts/docker-build.js`

### ✅ Documentação

- `docs/DOCKER_GITHUB_ACTIONS_GUIDE.md`
- `DOCKER_IMPLEMENTATION_SUMMARY.md`
- `README.md`
- `.kiro/steering/github-api-setup.md`
- `.kiro/steering/docker-swarm-deploy.md`

### ✅ Código da Aplicação

- `src/lib/actions/system-updates.actions.ts`

## 🐳 Novas URLs das Imagens Docker

### Antes

```
ghcr.io/vifigueiredo/intranet_basic:latest
```

### Depois

```
ghcr.io/vifigueiredo/portal_s4a:latest
```

## 🔗 Novos Links

### GitHub Repository

```
https://github.com/ViFigueiredo/portal_s4a
```

### GitHub Container Registry

```
https://github.com/ViFigueiredo/portal_s4a/pkgs/container/portal_s4a
```

### GitHub Actions

```
https://github.com/ViFigueiredo/portal_s4a/actions
```

## ⚠️ Importante

### No GitHub.com

1. Vá para o repositório antigo: `https://github.com/ViFigueiredo/intranet_basic`
2. Clique em **Settings**
3. Role até **Repository name**
4. Altere para `portal_s4a`
5. Clique em **Rename**

### Vercel (se aplicável)

1. Acesse o projeto no Vercel
2. Vá em **Settings** → **Git**
3. Reconecte com o novo repositório `portal_s4a`

## 🚀 Teste Final

Após as alterações:

```bash
# Testar build local
pnpm build:docker

# Testar deploy (se Docker Swarm configurado)
pnpm deploy:production

# Verificar GitHub Actions
# Acesse: https://github.com/ViFigueiredo/portal_s4a/actions
```

## 🎯 Resultado Esperado

Após executar todos os passos:

- ✅ Repositório renomeado para `portal_s4a`
- ✅ Todas as referências atualizadas
- ✅ GitHub Actions funcionando com novo nome
- ✅ Docker images sendo publicadas em `ghcr.io/vifigueiredo/portal_s4a`
- ✅ Scripts de deploy atualizados
- ✅ Documentação atualizada

---

**🔄 Execute os comandos na ordem e tudo funcionará perfeitamente!**
