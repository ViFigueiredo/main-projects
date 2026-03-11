# Configuração do Ambiente de Desenvolvimento

## 📋 Pré-requisitos

- Node.js 18+ (recomendado 20+)
- pnpm 8+
- PostgreSQL 14+
- Git

---

## 🚀 Setup Inicial

### 1. Clone e Instale Dependências

```bash
git clone <repo-url>
cd WhatsUpLeads
pnpm install
```

### 2. Configure Variáveis de Ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Preencha as variáveis obrigatórias:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/whatsup_leads"

# Auth
JWT_SECRET="sua-chave-secreta-aqui"

# Meta Cloud (opcional, para instâncias Meta)
META_ACCESS_TOKEN=""
META_PHONE_NUMBER_ID=""
META_WABA_ID=""

# Providers Self-hosted (opcional)
WUZAPI_BASE_URL=""
UAZAPI_BASE_URL=""
PAPI_BASE_URL=""
```

### 3. Configure o Banco de Dados

```bash
# Gera o cliente Prisma
pnpm prisma generate

# Executa migrations
pnpm prisma migrate dev

# (Opcional) Popula dados iniciais
pnpm prisma db seed
```

### 4. Inicie o Servidor de Desenvolvimento

```bash
pnpm dev
```

Acesse: http://localhost:3000

---

## 👤 Credenciais Iniciais

| Tipo | Email | Senha |
|------|-------|-------|
| Super Admin | admin@whatsup.com | admin123 |
| Tenant | tenant@example.com | tenant123 |

> ⚠️ O sistema força troca de senha no primeiro login.

---

## 🛠️ Comandos Disponíveis

### Desenvolvimento

```bash
pnpm dev          # Inicia servidor dev (hot reload)
pnpm build        # Build de produção
pnpm start        # Inicia servidor de produção
pnpm lint         # Executa linter
pnpm format       # Formata código com Prettier
```

### Database

```bash
pnpm prisma studio         # Interface visual do banco
pnpm prisma generate       # Gera cliente Prisma
pnpm prisma migrate dev    # Executa migrations (dev)
pnpm prisma migrate deploy # Executa migrations (prod)
pnpm prisma db push        # Sincroniza schema sem migration
pnpm prisma db seed        # Popula dados iniciais
```

### TypeScript

```bash
pnpm tsc --noEmit          # Verifica tipos sem compilar
pnpm tsc --watch           # Verifica tipos em modo watch
```

---

## 📁 Estrutura de Branches

```
main              # Produção (deploy automático)
├── develop       # Desenvolvimento (staging)
│   ├── feature/* # Novas features
│   ├── fix/*     # Correções de bugs
│   └── refactor/*# Refatorações
```

### Workflow

1. Crie branch a partir de `develop`:
   ```bash
   git checkout develop
   git pull
   git checkout -b feature/nome-da-feature
   ```

2. Desenvolva e commite:
   ```bash
   git add .
   git commit -m "feat: descrição da feature"
   ```

3. Antes do PR, execute:
   ```bash
   pnpm lint
   pnpm build
   ```

4. Crie PR para `develop`

---

## 🔧 Configurações de Editor

### VS Code (Recomendado)

Instale as extensões:
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma

Configurações recomendadas (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["className=\"([^\"]*)", "([^\"]+)"],
    ["class=\"([^\"]*)", "([^\"]+)"]
  ]
}
```

---

## 🐛 Debugging

### Debug no VS Code

Crie `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "pnpm dev",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    }
  ]
}
```

### Logs Úteis

```typescript
// API Route
console.log("[API_NAME] Context:", { companyId, userId });

// Component
console.log("[COMPONENT_NAME] Render:", { props, state });

// Provider
console.log("[PROVIDER] Request:", { url, body });
console.log("[PROVIDER] Response:", { status, data });
```

---

## 🧪 Testando Localmente

### Como Super Admin

1. Acesse http://localhost:3000/login
2. Use credenciais de admin
3. Navegue por `/admin/*`

### Como Tenant

1. Crie uma empresa em `/admin/companies`
2. Crie um usuário para a empresa
3. Faça logout
4. Faça login com credenciais do tenant
5. Navegue por `/dashboard/*`

### Testando Workspace

1. Como admin, acesse `/admin/workspace/*`
2. Verifique funcionalidades
3. Como tenant, acesse via sidebar expandível
4. Verifique que vê apenas dados da sua empresa

---

## 📦 Docker (Opcional)

### Desenvolvimento com Docker

```bash
# Sobe apenas o banco de dados
docker-compose -f docker-compose.dev.yml up -d postgres

# Ou sobe todo o ambiente
docker-compose -f docker-compose.dev.yml up -d
```

### Variáveis para Docker

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/whatsup_leads"
```

---

## ⚠️ Troubleshooting

### Erro: "Cannot find module '@prisma/client'"

```bash
pnpm prisma generate
```

### Erro: Database connection failed

1. Verifique se PostgreSQL está rodando
2. Verifique DATABASE_URL no .env
3. Verifique credenciais e porta

### Erro: Build failed with TypeScript errors

```bash
# Verifique erros específicos
pnpm tsc --noEmit

# Comum: falta non-null assertion
# where: { companyId }  →  where: { companyId: companyId! }
```

### Erro: White background em componentes

Verifique se componentes usam tema escuro:
- Container pai tem `bg-slate-900`
- Cards têm `bg-slate-800`
- Não há `bg-white` hardcoded

### Erro: Preços calculados errados

1. Verifique se API `/api/meta-pricing` retorna valores corretos
2. Confirme que componente busca preços da API
3. Não use valores hardcoded para cálculos

---

## 📞 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons/)
