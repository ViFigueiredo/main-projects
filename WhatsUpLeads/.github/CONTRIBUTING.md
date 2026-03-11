# Guia de Contribuição - WhatsUpLeads

## 📋 Visão Geral do Projeto

WhatsUpLeads é uma plataforma SaaS multi-tenant para gestão de campanhas de WhatsApp, suportando múltiplos provedores (Meta Cloud, WUZAPI, UAZAPI, PAPI).

### Stack Tecnológica
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS (Dark Theme)
- **Auth**: JWT com cookies httpOnly

---

## 🏗️ Arquitetura de Rotas

### Estrutura de Usuários

| Tipo | Rota Base | Descrição |
|------|-----------|-----------|
| Super Admin | `/admin/*` | Gerenciamento global do sistema |
| Tenant Admin | `/dashboard/*` | Área do cliente/empresa |
| Workspace (compartilhado) | `/admin/workspace/*` | Funcionalidades comuns acessíveis por ambos |

### Hierarquia de Acesso

```
Super Admin (isMaster=true)
├── /admin/* (exclusivo)
│   ├── /admin/companies - Gerenciar empresas
│   ├── /admin/billing - Faturamento global
│   ├── /admin/plans - Planos e preços
│   └── /admin/settings - Configurações do sistema
│
└── /admin/workspace/* (compartilhado)
    ├── campaigns, instances, leads, credentials, etc.

Tenant Admin (isMaster=false)
├── /dashboard/* (exclusivo)
│   ├── /dashboard/billing - Meu faturamento
│   ├── /dashboard/plans - Meu plano
│   └── /dashboard/settings - Minhas configurações
│
└── /admin/workspace/* (via sidebar expandível)
    └── Mesmas funcionalidades do super admin
```

---

## 🎨 Padrões de UI/UX

### Tema Escuro (Obrigatório)

```tsx
// ✅ CORRETO - Sempre use tema escuro
<div className="min-h-screen bg-slate-900">
  <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
    <h1 className="text-white">Título</h1>
    <p className="text-slate-400">Descrição</p>
  </div>
</div>

// ❌ INCORRETO - Nunca use cores claras
<div className="bg-white text-gray-900">
```

### Cor da Marca

```tsx
// Cor primária: #5dbeb4 (verde-azulado/teal)
// Hover: #4da89e

// Botões de ação
<button className="bg-[#5dbeb4] hover:bg-[#4da89e] text-white">
  Salvar
</button>

// Estados ativos/selecionados
<div className="bg-[#5dbeb4]/20 text-[#5dbeb4]">
  Item ativo
</div>

// Inputs com foco
<input className="focus:border-[#5dbeb4] focus:ring-[#5dbeb4]" />
```

### Paleta de Cores

| Uso | Classe Tailwind |
|-----|-----------------|
| Fundo página | `bg-slate-900` |
| Fundo cards | `bg-slate-800` |
| Fundo inputs | `bg-slate-700` |
| Bordas | `border-slate-700` |
| Texto principal | `text-white` |
| Texto secundário | `text-slate-400` |
| Texto terciário | `text-slate-500` |
| Cor de destaque | `text-[#5dbeb4]` / `bg-[#5dbeb4]` |
| Erro | `text-red-400` / `bg-red-500/20` |
| Sucesso | `text-green-400` / `bg-green-500/20` |
| Aviso | `text-yellow-400` / `bg-yellow-500/20` |

---

## 📁 Estrutura de Arquivos

### API Routes

```
app/api/
├── admin/                    # APIs exclusivas super admin
│   ├── companies/
│   ├── plans/
│   └── workspace/            # APIs compartilhadas
│       ├── campaigns/
│       ├── instances/
│       ├── leads/
│       └── credentials/
├── dashboard/                # APIs exclusivas tenant
│   ├── billing/
│   └── plans/
└── v1/                       # API pública (com API key)
```

### Componentes

```
components/
├── admin/                    # Componentes exclusivos admin
│   └── sidebar.tsx
├── layout/                   # Componentes de layout
│   └── sidebar.tsx           # Sidebar do tenant
├── ui/                       # Componentes reutilizáveis
└── campaigns/                # Componentes por feature
```

---

## 🔐 Autenticação e Autorização

### Helper de Workspace

Sempre use `getWorkspaceCompanyId` para APIs compartilhadas:

```typescript
import { getWorkspaceCompanyId } from "@/lib/workspace-auth";

export async function GET(request: NextRequest) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  // companyId é garantido não-null aqui, mas TypeScript não infere
  // Use companyId! quando necessário
  const data = await prisma.model.findMany({
    where: { companyId: companyId! },
  });

  return NextResponse.json({ data });
}
```

### Verificação de Master

```typescript
import { getSessionFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  
  if (!session?.isMaster) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }
  
  // Lógica exclusiva para super admin
}
```

---

## 💰 Sistema de Custos Meta

### Estrutura de Preços

Os preços são armazenados em **centavos** para evitar problemas de ponto flutuante:

```typescript
// Preços em centavos BRL
const prices = {
  MARKETING: 34,      // R$ 0,34
  UTILITY: 4,         // R$ 0,04  
  AUTHENTICATION: 4,  // R$ 0,04
};

// Formatação para exibição
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};
```

### Cálculo de Custos

Sempre busque preços atualizados da API:

```typescript
// ❌ INCORRETO - Preços hardcoded
const estimatedCost = totalLeads * 31;

// ✅ CORRETO - Buscar preços da API
const prices = await fetch("/api/meta-pricing").then(r => r.json());
const estimatedCost = totalLeads * prices.MARKETING;
```

---

## 🧪 Checklist de Implementação

### Nova Feature

- [ ] Definir se é exclusiva (admin/dashboard) ou compartilhada (workspace)
- [ ] Criar API route com autenticação apropriada
- [ ] Criar componente com tema escuro
- [ ] Usar cor da marca (#5dbeb4) para destaques
- [ ] Adicionar à sidebar correspondente
- [ ] Testar como super admin E como tenant
- [ ] Executar `pnpm build` antes do commit

### Nova API

- [ ] Usar `getWorkspaceCompanyId` para workspace
- [ ] Usar `getSessionFromRequest` + verificação manual para exclusivas
- [ ] Adicionar `companyId!` (non-null assertion) onde necessário
- [ ] Retornar erros com status codes apropriados
- [ ] Documentar no OpenAPI spec se for pública

### Novo Componente

- [ ] Usar `"use client"` se tiver interatividade
- [ ] Seguir paleta de cores do tema escuro
- [ ] Usar classes Tailwind consistentes
- [ ] Importar ícones de `lucide-react`

---

## 🚀 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev

# Build de produção
pnpm build

# Lint
pnpm lint

# Verificar tipos
pnpm tsc --noEmit

# Gerar cliente Prisma
pnpm prisma generate

# Executar migrations
pnpm prisma migrate dev
```

---

## ⚠️ Erros Comuns

### 1. TypeScript: `Type 'string | null' is not assignable`

```typescript
// Problema: companyId pode ser null segundo o TypeScript
const data = await prisma.model.findFirst({
  where: { companyId }, // ❌ Erro
});

// Solução: Use non-null assertion após verificar erro
const data = await prisma.model.findFirst({
  where: { companyId: companyId! }, // ✅ OK
});
```

### 2. Tema claro vazando

Se cards aparecerem com fundo branco, verifique:
- Container tem `bg-slate-900` ou `bg-slate-800`
- Componentes filhos não têm `bg-white` hardcoded
- Props como `isMaster` não estão alterando tema condicionalmente

### 3. Preços desatualizados

Se custos não batem com tabela de preços:
- Verificar se está buscando preços da API `/api/meta-pricing`
- Não usar valores salvos no banco (podem estar desatualizados)
- Sempre recalcular com preços atuais

---

## 📞 Contato

Para dúvidas sobre arquitetura ou padrões, consulte a documentação em `/docs` ou abra uma issue.
