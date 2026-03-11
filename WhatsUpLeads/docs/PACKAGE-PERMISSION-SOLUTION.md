# 🚨 Solução para Erro 403 Forbidden - GitHub Container Registry

## Problema Identificado
```
ERROR: failed to push ghcr.io/vifigueiredo/whatsupleads:main: 
unexpected status from HEAD request: 403 Forbidden
```

## 🎯 Causa
O package `whatsupleads` existe mas não está conectado ao repositório atual, ou o GITHUB_TOKEN não tem permissões suficientes.

## ✅ Soluções (em ordem de preferência)

### 🥇 SOLUÇÃO 1: Conectar Package Existente (RECOMENDADO)
**Mais simples e mantém o nome desejado**

1. **Acesse o package:**
   - URL: https://github.com/ViFigueiredo/WhatsUpLeads/pkgs/container/whatsupleads
   - Ou vá em: Repositório → Packages → whatsupleads

2. **Configure as permissões:**
   - Clique no ícone de engrenagem (Package settings)
   - Na seção **"Connect repository"**:
     - Conecte ao repositório `ViFigueiredo/WhatsUpLeads`
   - Na seção **"Manage Actions access"**:
     - Adicione o repositório `ViFigueiredo/WhatsUpLeads`
     - Defina permissão como **"Write"**

3. **Teste:**
   ```bash
   git commit --allow-empty -m "test: after connecting package"
   git push
   ```

### 🥈 SOLUÇÃO 2: Personal Access Token
**Se a Solução 1 não funcionar**

1. **Gere um PAT:**
   - Acesse: https://github.com/settings/tokens
   - Clique em "Generate new token (classic)"
   - Selecione scopes: `write:packages`, `read:packages`
   - Copie o token gerado

2. **Adicione como Secret:**
   - Vá em: Repositório → Settings → Secrets and variables → Actions
   - Clique em "New repository secret"
   - Nome: `GHCR_TOKEN`
   - Valor: cole o PAT gerado

3. **O workflow já está configurado** para usar o PAT se disponível

### 🥉 SOLUÇÃO 3: Novo Package (Backup)
**Se as outras não funcionarem**

Já criei um branch `test-new-package` que usa `whatsupleads-test`:
```bash
git checkout test-new-package
git push
# Aguarde o workflow executar
```

## 🔍 Como Verificar se Funcionou

Após aplicar qualquer solução:

1. **Monitore o workflow:**
   - https://github.com/ViFigueiredo/WhatsUpLeads/actions

2. **Verifique a imagem:**
   ```powershell
   .\scripts\check-image.ps1
   ```

3. **Teste pull manual:**
   ```bash
   docker pull ghcr.io/vifigueiredo/whatsupleads:latest
   ```

## 📊 Status Atual

- ✅ Workflows configurados com fallback para PAT
- ✅ Branch de teste criada como backup
- ⏳ Aguardando configuração de permissões

## 🎯 Recomendação

**Tente a Solução 1 primeiro** - é a mais limpa e mantém o nome do package que você quer usar. Se não funcionar em 5 minutos, passe para a Solução 2.