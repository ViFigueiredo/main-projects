# GitHub Copilot Instructions

Este arquivo contém instruções para o GitHub Copilot entender o contexto do projeto WhatsUpLeads.

## 📋 Sobre o Projeto

WhatsUpLeads é uma plataforma SaaS multi-tenant para disparo de mensagens WhatsApp em massa. O sistema suporta múltiplos providers de WhatsApp (WuzAPI, UazAPI, PAPI) e Meta Cloud API oficial.

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 16+ com App Router
- **Linguagem**: TypeScript (strict mode)
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Fila**: Redis + BullMQ
- **Estilização**: Tailwind CSS 4
- **Autenticação**: JWT via cookies (jose library)
- **Runtime**: Node.js 20+

## 🎨 Padrões de UI

### Tema Obrigatório (Dark Mode)

```typescript
// Backgrounds
bg-slate-900  // Fundo principal
bg-slate-800  // Cards e containers
bg-slate-700  // Inputs e elementos interativos

// Textos
text-white      // Títulos e texto principal
text-slate-400  // Texto secundário
text-slate-300  // Labels

// Cor da marca
#5dbeb4  // Botões primários, links, bordas de foco

// Bordas
border-slate-700  // Bordas padrão
border-slate-600  // Bordas de inputs
```

### Estrutura de Componentes

```tsx
// Componente Client
"use client";

import { useState, useEffect } from "react";

export function MeuComponente() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TipoData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workspace/recurso");
      const json = await res.json();
      setData(json.items || []);
    } catch (error) {
      console.error("[MeuComponente] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      {/* Conteúdo com tema escuro */}
    </div>
  );
}
```

## 🔐 Sistema de Autenticação

### Arquitetura Multi-tenant

```
Super Admin (isMaster: true)
    └─> Acessa TUDO
    └─> Rotas: /admin/*
    └─> Pode ver dados de qualquer empresa

Tenant Admin (isMaster: false)  
    └─> Acessa apenas sua empresa
    └─> Rotas: /dashboard/*
    └─> Dados filtrados por companyId

Workspace Compartilhado
    └─> Rotas: /admin/workspace/*
    └─> Funciona para ambos
    └─> Usa getWorkspaceCompanyId()
```

### Helper de Autenticação Workspace

```typescript
// lib/workspace-auth.ts
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getWorkspaceCompanyId(): Promise<string | null> {
  const session = await getSession();
  if (!session) return null;

  // Super Admin: usa company selecionada ou primeira disponível
  if (session.isMaster) {
    if (session.selectedCompanyId) {
      return session.selectedCompanyId;
    }
    const firstCompany = await prisma.company.findFirst({
      select: { id: true },
    });
    return firstCompany?.id || null;
  }

  // Tenant: usa sua própria company
  return session.companyId || null;
}
```

### Uso em APIs

```typescript
// app/api/admin/workspace/[recurso]/route.ts
import { NextResponse } from "next/server";
import { getWorkspaceCompanyId } from "@/lib/workspace-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const companyId = await getWorkspaceCompanyId();
  
  if (!companyId) {
    return NextResponse.json(
      { error: "Não autorizado" },
      { status: 403 }
    );
  }

  const items = await prisma.recurso.findMany({
    where: { companyId },  // SEMPRE filtrar por companyId
  });

  return NextResponse.json({ items });
}
```

## 💰 Sistema de Custos Meta

### Valores em Centavos

```typescript
// SEMPRE armazene valores monetários em centavos (inteiros)
const precoEmCentavos = 72;  // R$ 0,72

// Converta apenas para exibição
const formatCurrency = (centavos: number) => {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};
```

### Funções de Custo (Async)

```typescript
import { calculateEstimatedCost, calculateActualCost } from "@/lib/meta-cost-tracker";

// Estimativa ANTES do envio
const estimated = await calculateEstimatedCost(leadCount);

// Custo real DEPOIS do envio
const actual = await calculateActualCost(marketingCount, utilityCount, authCount);
```

## 📁 Estrutura de Arquivos

```
app/
├── admin/           # Rotas exclusivas Super Admin
│   ├── layout.tsx   # Verifica isMaster
│   └── workspace/   # Compartilhado Admin + Tenant
│       └── layout.tsx
├── dashboard/       # Rotas exclusivas Tenant
│   └── layout.tsx   # Verifica !isMaster
├── api/
│   └── admin/
│       └── workspace/  # APIs compartilhadas
│           └── [recurso]/route.ts

components/
├── admin/           # Componentes admin
├── dashboard/       # Componentes dashboard
├── layout/          # Sidebars, headers
└── ui/              # Componentes reutilizáveis

lib/
├── auth.ts          # getSession()
├── workspace-auth.ts # getWorkspaceCompanyId()
├── prisma.ts        # Cliente Prisma
├── meta-cost-tracker.ts # Custos Meta
└── providers/       # Providers WhatsApp
```

## ⚡ Padrões de Código

### Server vs Client Components

```typescript
// page.tsx - SEMPRE Server Component (sem "use client")
export default function Page() {
  return <ClientComponent />;
}

// client-component.tsx - Client quando necessário
"use client";
export function ClientComponent() {
  const [state, setState] = useState();
  // ...
}
```

### Params no Next.js 15+

```typescript
// CORRETO - params é Promise
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // ...
}
```

### Tratamento de Erros

```typescript
// Em APIs
try {
  // operação
} catch (error) {
  console.error("[NomeAPI] Error:", error);
  return NextResponse.json(
    { error: "Mensagem amigável" },
    { status: 500 }
  );
}

// Em componentes
try {
  // operação
} catch (error) {
  console.error("[NomeComponente] Error:", error);
  // Mostrar toast ou mensagem de erro
}
```

## 🚫 NÃO FAZER

1. **Nunca usar tema claro** - Sempre usar classes de tema escuro
2. **Nunca hardcodar preços** - Sempre buscar do banco via API
3. **Nunca esquecer companyId** - Sempre filtrar dados por empresa
4. **Nunca usar "use client" em page.tsx** - Separar em componentes
5. **Nunca usar cores diferentes de #5dbeb4** para elementos primários
6. **Nunca ignorar TypeScript errors** - Resolver todos antes de commit

## ✅ SEMPRE FAZER

1. **Usar getWorkspaceCompanyId()** em APIs workspace
2. **Implementar loading states** em componentes
3. **Implementar empty states** em listas
4. **Usar await com params** no Next.js 15+
5. **Logar erros com contexto** [NomeDoArquivo]
6. **Testar como Admin e Tenant** para workspace

## 📚 Documentação Adicional

- [.github/CONTRIBUTING.md](.github/CONTRIBUTING.md) - Guia de contribuição
- [.github/ARCHITECTURE.md](.github/ARCHITECTURE.md) - Arquitetura completa
- [.github/CODING_STANDARDS.md](.github/CODING_STANDARDS.md) - Padrões detalhados
- [.github/guides/](.github/guides/) - Guias de implementação
