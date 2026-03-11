# Guia: Criando Nova Página

Este guia mostra como criar uma nova página no sistema, seja para admin, tenant ou workspace compartilhado.

## 🗺️ Decidindo o Local

| Tipo | Rota | Acesso |
|------|------|--------|
| Admin exclusivo | `/admin/[nome]` | Apenas Super Admin |
| Tenant exclusivo | `/dashboard/[nome]` | Apenas Tenants |
| Workspace compartilhado | `/admin/workspace/[nome]` | Ambos |

## 📁 Estrutura de Pastas

```
app/
├── admin/
│   ├── nova-pagina/          # Exclusiva admin
│   │   ├── page.tsx          # Página principal
│   │   └── [componentes].tsx # Componentes client
│   │
│   └── workspace/
│       └── nova-feature/     # Compartilhada
│           ├── page.tsx
│           ├── [id]/
│           │   └── page.tsx  # Página de detalhe
│           └── [componentes].tsx
│
└── dashboard/
    └── nova-pagina/          # Exclusiva tenant
        └── page.tsx
```

## 🚀 Passo a Passo

### 1. Crie a Estrutura de Pastas

```bash
# Workspace compartilhado
mkdir -p app/admin/workspace/nova-feature

# Ou admin exclusivo
mkdir -p app/admin/nova-pagina

# Ou tenant exclusivo
mkdir -p app/dashboard/nova-pagina
```

### 2. Crie a Página Principal

```tsx
// app/admin/workspace/nova-feature/page.tsx
import { NovaFeatureList } from "./nova-feature-list";

export default function NovaFeaturePage() {
  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header da página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Nova Feature</h1>
        <p className="text-slate-400">Descrição da feature</p>
      </div>

      {/* Conteúdo principal */}
      <NovaFeatureList />
    </div>
  );
}
```

### 3. Crie o Componente Client

```tsx
// app/admin/workspace/nova-feature/nova-feature-list.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import Link from "next/link";

interface Item {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export function NovaFeatureList() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/workspace/nova-feature");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("[NovaFeatureList] Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-600 bg-slate-700 text-sm text-white placeholder-slate-400 focus:border-[#5dbeb4] focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadItems}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/workspace/nova-feature/new"
            className="flex items-center gap-2 bg-[#5dbeb4] hover:bg-[#4da89e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="bg-slate-800 rounded-xl border border-slate-700">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">
              {search ? "Nenhum resultado encontrado" : "Nenhum item cadastrado"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                    Nome
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                    Criado em
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-700/50 hover:bg-slate-700/30"
                  >
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/workspace/nova-feature/${item.id}`}
                        className="text-white hover:text-[#5dbeb4] font-medium"
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. Crie a Página de Detalhe (se necessário)

```tsx
// app/admin/workspace/nova-feature/[id]/page.tsx
import { NovaFeatureDetails } from "./nova-feature-details";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NovaFeatureDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <NovaFeatureDetails id={id} />
    </div>
  );
}
```

### 5. Adicione à Sidebar

#### Para Workspace (acessível por ambos)

```tsx
// components/layout/sidebar.tsx - Tenant sidebar
const workspaceItems = [
  // ... items existentes
  { href: "/admin/workspace/nova-feature", icon: Star, label: "Nova Feature" },
];

// components/admin/sidebar.tsx - Admin sidebar  
const workspaceItems = [
  // ... items existentes
  { href: "/admin/workspace/nova-feature", icon: Star, label: "Nova Feature" },
];
```

#### Para Admin Exclusivo

```tsx
// components/admin/sidebar.tsx
const adminItems = [
  // ... items existentes
  { href: "/admin/nova-pagina", icon: Star, label: "Nova Página" },
];
```

#### Para Tenant Exclusivo

```tsx
// components/layout/sidebar.tsx
const dashboardItems = [
  // ... items existentes
  { href: "/dashboard/nova-pagina", icon: Star, label: "Nova Página" },
];
```

## 🔐 Autenticação

### Página Workspace (usa layout existente)

O layout em `app/admin/workspace/layout.tsx` já cuida da autenticação.

### Página Admin Exclusiva

O layout em `app/admin/layout.tsx` já verifica `isMaster`.

### Página Tenant Exclusiva

O layout em `app/dashboard/layout.tsx` já verifica se é tenant.

## ✅ Checklist

- [ ] Pasta criada no local correto
- [ ] Page.tsx como Server Component (sem "use client")
- [ ] Componentes interativos separados com "use client"
- [ ] Usa tema escuro em todos os elementos
- [ ] Links usam `next/link`
- [ ] Loading state implementado
- [ ] Empty state implementado
- [ ] Adicionado à sidebar correspondente
- [ ] Testado como Super Admin
- [ ] Testado como Tenant (se workspace)

## 📝 Dicas

1. **Mantenha page.tsx simples** - apenas estrutura e importações
2. **Separe lógica em componentes** client quando necessário
3. **Use params com await** no Next.js 15+
4. **Sempre adicione à sidebar** para navegação
5. **Teste os dois tipos de usuário** para workspace
