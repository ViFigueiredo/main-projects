# Configuração do GitHub API para System Updates em Produção

## 🎯 Objetivo

O módulo de "Atualizações do Sistema" precisa funcionar tanto em **desenvolvimento** (usando Git local) quanto em **produção** (Vercel, sem acesso a `.git`). Este documento detalha como configurar para funcionar em ambos os ambientes.

## ⚙️ Configuração Necessária na Vercel

### 1. Criar Personal Access Token no GitHub

1. Acesse [GitHub Settings > Tokens > Personal access tokens (classic)](https://github.com/settings/tokens)
2. Clique em **"Generate new token (classic)"**
3. Configure com os seguintes detalhes:
   - **Token name**: `vercel-intranet-api`
   - **Expiration**: 90 dias (ou conforme sua preferência)
   - **Scopes**: Marque apenas `public_repo` (lê repositórios públicos)
4. Clique em **"Generate token"**
5. **Copie o token** (aparece só uma vez!)

### 2. Adicionar Token na Vercel

1. Acesse o painel da Vercel
2. Vá para o projeto `intranet_basic`
3. Acesse **Settings > Environment Variables**
4. Clique em **"Add"** e configure:
   - **Name**: `GITHUB_TOKEN`
   - **Value**: Cole o token gerado no GitHub
   - **Environments**: Marque `Production` e `Preview`
5. Clique em **"Save"**

### 3. Deploy

Após adicionar a variável de ambiente, faça um **redeploy** do projeto:

1. Na página do projeto na Vercel, clique em **"Deployments"**
2. Clique em **"Redeploy"** no commit mais recente
3. Aguarde o deploy terminar
4. Abra o site em produção e verifique se os commits aparecem no dashboard

## 🔍 Como Funciona

### Em Desenvolvimento (Local)

```
getSystemUpdates()
  ↓
Tenta: Git local (execSync)
  ↓
✅ Sucesso: Retorna commits do .git
```

**Vantagem**: Instantâneo, não usa API, sem rate limit

### Em Produção (Vercel)

```
getSystemUpdates()
  ↓
Tenta: Git local (execSync)
  ↓
❌ Erro: Vercel não tem .git
  ↓
Fallback: GitHub API
  ↓
✅ Sucesso: Retorna commits da API
```

## 📊 Rate Limits da GitHub API

### Sem Token

- 60 requisições por hora
- **Recomendado apenas para teste**

### Com Token (GITHUB_TOKEN)

- 5000 requisições por hora
- **Recomendado para produção**

## 🐛 Debug/Troubleshooting

### Verificar Logs na Vercel

Se os commits não aparecerem, verifique os logs:

1. No projeto da Vercel, acesse **Deployments**
2. Selecione o deployment
3. Clique em **"Functions"** → **"View logs"**
4. Procure por mensagens como:
   - `Git local não disponível, usando GitHub API...`
   - `GITHUB_TOKEN não configurado...`
   - `Buscando commits do GitHub...`
   - `Erro ao buscar commits do GitHub:`

### Problemas Comuns

#### ❌ "GITHUB_TOKEN não configurado"

**Solução**: Adicione o token nas Environment Variables da Vercel (veja seção 2 acima)

#### ❌ "GitHub API error: 401"

**Solução**: Token inválido ou expirado. Gere um novo token no GitHub

#### ❌ "GitHub API error: 403"

**Solução**: Token sem permissão. Verifique se o scope `public_repo` está marcado

#### ❌ "GitHub API error: 404"

**Solução**: Repositório não encontrado. Verifique se `owner` e `repo` estão corretos no código

## 🔐 Segurança

- ✅ Token usa scope `public_repo` (apenas leitura de repositórios públicos)
- ✅ Token é armazenado com segurança na Vercel
- ✅ Token **não** é incluído no repositório (env secret)
- ✅ Token pode ser rotacionado/revogado a qualquer tempo no GitHub

## ✅ Verificação Final

Após configuração, você deve ver no dashboard:

```
[Dashboard]
  ├─ Commits: 42 ✅ (vindo da GitHub API)
  ├─ Branches: 1
  ├─ Última atualização: há 2 horas
  └─ Timeline com 8 últimos commits
```

Se ver "Nenhum commit encontrado", verifique os logs conforme seção de debug.

## 📝 Variáveis de Ambiente

| Variável       | Obrigatória?     | Onde Usar | Valor Exemplo              |
| -------------- | ---------------- | --------- | -------------------------- |
| `GITHUB_TOKEN` | ❌ (recomendado) | Vercel    | `ghp_xxxxxxxxxxxxxxxxxxxx` |

**Nota**: Local não precisa de `GITHUB_TOKEN` pois usa Git local

---

**Última atualização**: 11 de novembro de 2025