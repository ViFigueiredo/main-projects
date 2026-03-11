# CI/CD Simplificado

Este documento explica como funciona o sistema de CI/CD simplificado do WhatsUpLeads.

## Como Funciona

1. **Push para `main` ou `develop`**: Dispara o workflow do GitHub Actions
2. **Build da Imagem**: Cria e publica a imagem Docker no GitHub Container Registry
3. **Deploy Manual**: Use as imagens geradas para atualizar manualmente no Portainer

## Workflow Automático

### Branches

- **`main`**: Gera imagens para produção
- **`develop`**: Gera imagens para desenvolvimento
- **Pull Requests**: Apenas build (sem publicação)

### Tags Geradas

Para cada push, são geradas as seguintes tags:

```bash
# Branch main
ghcr.io/usuario/whatsup-leads:main
ghcr.io/usuario/whatsup-leads:main-abc1234
ghcr.io/usuario/whatsup-leads:latest

# Branch develop  
ghcr.io/usuario/whatsup-leads:develop
ghcr.io/usuario/whatsup-leads:develop-abc1234
```

## Deploy Manual no Portainer

### 1. Acesse seu Stack no Portainer

1. Vá para **Stacks** no Portainer
2. Selecione seu stack do WhatsUpLeads
3. Clique em **Editor**

### 2. Atualize a Tag da Imagem

No seu `docker-compose.yml`, atualize a tag:

```yaml
version: '3.8'
services:
  app:
    image: ghcr.io/vifigueiredo/whatsup-leads:latest  # Para produção
    # ou
    image: ghcr.io/vifigueiredo/whatsup-leads:develop  # Para desenvolvimento
    # ou uma versão específica
    image: ghcr.io/vifigueiredo/whatsup-leads:main-abc1234
```

### 3. Faça o Deploy

1. Clique em **Update the stack**
2. Marque **Re-pull image and redeploy**
3. Clique em **Update**

## Verificando se o Deploy foi Realizado

### Método 1: Script Automático

Use o script para verificar se a imagem foi publicada:

```bash
# Linux/Mac
./scripts/check-image.sh

# Windows (PowerShell)
.\scripts\check-image.ps1

# Verificar tag específica
./scripts/check-image.sh main-abc1234
```

### Método 2: GitHub Actions

1. Acesse: https://github.com/ViFigueiredo/WhatsUpLeads/actions
2. Procure pelo workflow **"Build and Deploy"** mais recente
3. Status:
   - ✅ **Verde**: Build realizado com sucesso
   - ❌ **Vermelho**: Build falhou
   - 🟡 **Amarelo**: Ainda executando

4. Clique no workflow para ver detalhes
5. No **Summary**, você verá as tags geradas:

```
🐳 Docker Image Built Successfully

Environment: production
Registry: ghcr.io
Repository: vifigueiredo/whatsup-leads
SHA: abc1234

🏷️ Image Tags:
ghcr.io/vifigueiredo/whatsup-leads:main
ghcr.io/vifigueiredo/whatsup-leads:main-abc1234
ghcr.io/vifigueiredo/whatsup-leads:latest
```

### Método 3: GitHub Container Registry

1. Acesse: https://github.com/ViFigueiredo/WhatsUpLeads/pkgs/container/whatsup-leads
2. Veja a lista de tags disponíveis
3. Verifique a data de publicação da tag `latest`

### Método 4: Docker CLI

```bash
# Verifica se a imagem existe
docker manifest inspect ghcr.io/vifigueiredo/whatsup-leads:latest

# Faz pull da imagem
docker pull ghcr.io/vifigueiredo/whatsup-leads:latest
```

## Monitoramento

### GitHub Actions

- Acesse **Actions** no repositório GitHub
- Veja os logs de build
- Copie as tags geradas no **Summary**

### Exemplo de Summary

Após cada build bem-sucedido, você verá:

```
🐳 Docker Image Built Successfully

Environment: production
Registry: ghcr.io
Repository: vifigueiredo/whatsup-leads
SHA: abc1234

🏷️ Image Tags:
ghcr.io/vifigueiredo/whatsup-leads:main
ghcr.io/vifigueiredo/whatsup-leads:main-abc1234
ghcr.io/vifigueiredo/whatsup-leads:latest

📦 Pull Commands:
# Latest image for this branch:
docker pull ghcr.io/vifigueiredo/whatsup-leads:main

# Specific SHA:
docker pull ghcr.io/vifigueiredo/whatsup-leads:main-abc1234
```

## Configuração de Secrets

Configure os seguintes secrets no GitHub:

```
DATABASE_URL_PRODUCTION=postgresql://...
DATABASE_URL_DEVELOP=postgresql://...
APP_URL_PRODUCTION=https://app.whatsup.leads
APP_URL_DEVELOP=https://dev.whatsup.leads
```

## Exemplo de Uso

### Desenvolvimento

```bash
git checkout develop
git add .
git commit -m "feat: nova funcionalidade"
git push origin develop
```

1. GitHub Actions builda a imagem
2. Acesse o Portainer
3. Atualize para `ghcr.io/vifigueiredo/whatsup-leads:develop`

### Produção

```bash
git checkout main
git merge develop
git push origin main
```

1. GitHub Actions builda a imagem
2. Acesse o Portainer
3. Atualize para `ghcr.io/vifigueiredo/whatsup-leads:latest`

## Troubleshooting

### Build falha

1. Verifique os secrets `DATABASE_URL_*` e `APP_URL_*`
2. Confirme se o Dockerfile está correto
3. Verifique se há erros de sintaxe no código

### Imagem não atualiza

1. Confirme se usou **Re-pull image and redeploy**
2. Verifique se a tag está correta
3. Aguarde alguns minutos para propagação

### Permissões

1. Verifique se o repositório é público ou se tem acesso ao GHCR
2. Configure autenticação no Portainer se necessário:
   ```bash
   docker login ghcr.io -u USERNAME -p TOKEN
   ```

## Vantagens

- ✅ **Simples**: Sem webhooks complexos
- ✅ **Confiável**: Deploy manual controlado
- ✅ **Flexível**: Escolha quando fazer deploy
- ✅ **Seguro**: Controle total sobre atualizações
- ✅ **Rastreável**: Histórico completo no GitHub Actions