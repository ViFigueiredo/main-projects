# Padrões de Código - WhatsUpLeads

## 📝 Convenções Gerais

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Arquivos/Pastas | kebab-case | `campaign-details.tsx` |
| Componentes | PascalCase | `CampaignDetails` |
| Funções | camelCase | `getCampaignById` |
| Constantes | SCREAMING_SNAKE | `MAX_RETRIES` |
| Types/Interfaces | PascalCase | `CampaignRound` |
| API Routes | kebab-case | `/api/admin/workspace/campaigns` |

### Imports

Ordem recomendada:
```typescript
// 1. Módulos do Next.js/React
import { NextRequest, NextResponse } from "next/server";
import { useState, useEffect } from "react";

// 2. Bibliotecas externas
import { DollarSign, Users } from "lucide-react";

// 3. Módulos internos (aliases @/)
import { prisma } from "@/lib/prisma";
import { getWorkspaceCompanyId } from "@/lib/workspace-auth";

// 4. Tipos
import type { CampaignRound } from "@/types";

// 5. Estilos (se houver)
import styles from "./styles.module.css";
```

---

## 🎨 Padrões de UI

### Componentes de Página

```tsx
// app/admin/workspace/campaigns/page.tsx
import { CampaignsList } from "./campaigns-list";

export default async function CampaignsPage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Campanhas</h1>
        <p className="text-slate-400">Gerencie suas campanhas</p>
      </div>
      
      <CampaignsList />
    </div>
  );
}
```

### Componentes Client

```tsx
// components/campaigns/campaigns-list.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  status: string;
}

export function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workspace/campaigns");
      const data = await res.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error("[CampaignsList] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      {/* Conteúdo */}
    </div>
  );
}
```

### Cards

```tsx
// Card padrão
<div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-white">Título</h3>
    <button className="bg-[#5dbeb4] hover:bg-[#4da89e] text-white px-4 py-2 rounded-lg">
      Ação
    </button>
  </div>
  <p className="text-slate-400">Conteúdo do card</p>
</div>
```

### Tabelas

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    <thead>
      <tr className="border-b border-slate-700">
        <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
          Coluna
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map((item) => (
        <tr key={item.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
          <td className="py-3 px-4 text-sm text-white">
            {item.name}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### Inputs e Forms

```tsx
<div className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1">
      Nome
    </label>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white placeholder-slate-400 focus:border-[#5dbeb4] focus:outline-none"
      placeholder="Digite o nome"
    />
  </div>
  
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1">
      Status
    </label>
    <select className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white focus:border-[#5dbeb4] focus:outline-none">
      <option value="active">Ativo</option>
      <option value="inactive">Inativo</option>
    </select>
  </div>
</div>
```

### Botões

```tsx
// Botão primário
<button className="flex items-center gap-2 bg-[#5dbeb4] hover:bg-[#4da89e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  <Plus className="h-4 w-4" />
  Criar
</button>

// Botão secundário
<button className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  <Settings className="h-4 w-4" />
  Configurar
</button>

// Botão de perigo
<button className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
  <Trash2 className="h-4 w-4" />
  Excluir
</button>

// Botão desabilitado
<button 
  disabled={loading}
  className="... disabled:opacity-50 disabled:cursor-not-allowed"
>
  {loading ? "Carregando..." : "Salvar"}
</button>
```

### Alertas e Feedback

```tsx
// Erro
<div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
  <p className="text-sm text-red-400">
    <strong>Erro:</strong> Mensagem de erro
  </p>
</div>

// Sucesso
<div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30">
  <p className="text-sm text-green-400">
    <strong>Sucesso!</strong> Operação realizada
  </p>
</div>

// Aviso
<div className="p-4 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
  <p className="text-sm text-yellow-400">
    <strong>⚠️ Atenção:</strong> Mensagem de aviso
  </p>
</div>

// Info
<div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/30">
  <p className="text-sm text-blue-400">
    <strong>ℹ️ Info:</strong> Informação importante
  </p>
</div>
```

---

## 🔌 Padrões de API

### Estrutura de API Route

```typescript
// app/api/admin/workspace/[resource]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceCompanyId } from "@/lib/workspace-auth";

// GET: Lista recursos
export async function GET(request: NextRequest) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  try {
    const items = await prisma.model.findMany({
      where: { companyId: companyId! },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[API_NAME] GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}

// POST: Cria recurso
export async function POST(request: NextRequest) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  try {
    const body = await request.json();
    const { name, ...rest } = body;

    // Validação
    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const item = await prisma.model.create({
      data: {
        name,
        companyId: companyId!,
        ...rest,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("[API_NAME] POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar" },
      { status: 500 }
    );
  }
}
```

### API Route com Parâmetros

```typescript
// app/api/admin/workspace/[resource]/[id]/route.ts
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  const { id } = await params;

  const item = await prisma.model.findFirst({
    where: { id, companyId: companyId! },
  });

  if (!item) {
    return NextResponse.json(
      { error: "Não encontrado" },
      { status: 404 }
    );
  }

  return NextResponse.json({ item });
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  // Similar ao GET + update
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  // Similar ao GET + delete
}
```

### Respostas Padrão

```typescript
// Sucesso (200)
return NextResponse.json({ data });

// Criado (201)
return NextResponse.json({ data }, { status: 201 });

// Sem conteúdo (204)
return new NextResponse(null, { status: 204 });

// Erro de validação (400)
return NextResponse.json(
  { error: "Dados inválidos" },
  { status: 400 }
);

// Não autenticado (401)
return NextResponse.json(
  { error: "Não autenticado" },
  { status: 401 }
);

// Não autorizado (403)
return NextResponse.json(
  { error: "Acesso negado" },
  { status: 403 }
);

// Não encontrado (404)
return NextResponse.json(
  { error: "Recurso não encontrado" },
  { status: 404 }
);

// Erro interno (500)
return NextResponse.json(
  { error: "Erro interno do servidor" },
  { status: 500 }
);
```

---

## 🔐 Padrões de Autenticação

### API Workspace (compartilhada)

```typescript
import { getWorkspaceCompanyId } from "@/lib/workspace-auth";

const { companyId, error, status } = await getWorkspaceCompanyId(request);
if (error) {
  return NextResponse.json({ error }, { status: status || 403 });
}
```

### API Exclusiva Admin

```typescript
import { getSessionFromRequest } from "@/lib/auth";

const session = await getSessionFromRequest(request);
if (!session?.isMaster) {
  return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
}
```

### API Exclusiva Tenant

```typescript
import { getSessionFromRequest } from "@/lib/auth";

const session = await getSessionFromRequest(request);
if (!session || session.isMaster) {
  return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
}

const companyId = session.companyId;
```

---

## 📊 Padrões de Dados

### Valores Monetários

```typescript
// Sempre em centavos (inteiros)
const priceInCents = 3400; // R$ 34,00

// Formatação para exibição
const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

// Uso
<span>{formatCurrency(priceInCents)}</span> // "R$ 34,00"
```

### Datas

```typescript
// Formatação para exibição
const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateTime = (date: Date | string): string => {
  return new Date(date).toLocaleString("pt-BR");
};
```

### Status

```typescript
// Mapeamento de cores por status
const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500",
  PENDING: "bg-yellow-500",
  RUNNING: "bg-blue-500",
  PAUSED: "bg-orange-500",
  COMPLETED: "bg-green-500",
  FAILED: "bg-red-500",
};

// Badge de status
<span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${statusColors[status]}`}>
  {status}
</span>
```

---

## ✅ Checklist de Código

### Antes de Commitar

- [ ] Código segue padrões de nomenclatura
- [ ] Imports organizados na ordem correta
- [ ] Componentes usam tema escuro (sem bg-white)
- [ ] APIs usam autenticação apropriada
- [ ] Valores monetários em centavos
- [ ] Erros tratados com try/catch
- [ ] Console.logs com prefixo identificável
- [ ] TypeScript sem erros (`pnpm tsc --noEmit`)
- [ ] Build passa sem erros (`pnpm build`)
- [ ] Lint passa (`pnpm lint`)

### Revisão de PR

- [ ] Feature funciona como super admin
- [ ] Feature funciona como tenant
- [ ] Dados isolados por empresa (multi-tenant)
- [ ] UI consistente com resto do sistema
- [ ] Performance aceitável
- [ ] Sem console.logs de debug esquecidos
