# Guia: Criando Novo Componente

Este guia mostra como criar um novo componente seguindo os padrões visuais e de código do WhatsUpLeads.

## 📁 Onde Criar

| Tipo de Componente | Pasta |
|-------------------|-------|
| Reutilizável (UI genérico) | `components/ui/` |
| Feature específica | `components/[feature]/` |
| Admin exclusivo | `components/admin/` |
| Layout | `components/layout/` |

## 🎨 Template Base

### Componente Client (com estado/interatividade)

```tsx
// components/[feature]/meu-componente.tsx
"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Plus, Trash2, Settings } from "lucide-react";

// 1. Defina interfaces
interface Item {
  id: string;
  name: string;
  status: "active" | "inactive";
  createdAt: string;
}

interface MeuComponenteProps {
  initialData?: Item[];
  onItemSelect?: (item: Item) => void;
}

// 2. Exporte o componente
export function MeuComponente({ initialData, onItemSelect }: MeuComponenteProps) {
  // 3. Estados
  const [items, setItems] = useState<Item[]>(initialData || []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  // 4. Efeitos
  useEffect(() => {
    if (!initialData) {
      loadItems();
    }
  }, [initialData]);

  // 5. Funções
  const loadItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/workspace/items");
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro ao carregar");
      }
      
      setItems(data.items || []);
    } catch (err) {
      console.error("[MeuComponente] Load error:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // 6. Estados de loading/error
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30">
        <p className="text-sm text-red-400">{error}</p>
        <button 
          onClick={loadItems}
          className="mt-2 text-sm text-red-400 hover:text-red-300"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // 7. Render principal
  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Título</h3>
          <p className="text-sm text-slate-400">Descrição do componente</p>
        </div>
        <button className="flex items-center gap-2 bg-[#5dbeb4] hover:bg-[#4da89e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      {/* Lista vazia */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400">Nenhum item encontrado</p>
        </div>
      )}

      {/* Lista de items */}
      {items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <div 
              key={item.id}
              onClick={() => onItemSelect?.(item)}
              className="flex items-center justify-between p-4 bg-slate-900 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
            >
              <div>
                <p className="font-medium text-white">{item.name}</p>
                <p className="text-sm text-slate-500">
                  {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                item.status === "active" 
                  ? "bg-green-500/20 text-green-400" 
                  : "bg-slate-500/20 text-slate-400"
              }`}>
                {item.status === "active" ? "Ativo" : "Inativo"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Componente Server (sem estado)

```tsx
// components/[feature]/info-card.tsx
import { LucideIcon, Info } from "lucide-react";

interface InfoCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  variant?: "default" | "success" | "warning" | "error";
}

const variantStyles = {
  default: "bg-slate-800 border-slate-700",
  success: "bg-green-500/10 border-green-500/30",
  warning: "bg-yellow-500/10 border-yellow-500/30",
  error: "bg-red-500/10 border-red-500/30",
};

const iconColors = {
  default: "text-slate-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  error: "text-red-400",
};

export function InfoCard({ 
  title, 
  value, 
  description, 
  icon: Icon = Info,
  variant = "default" 
}: InfoCardProps) {
  return (
    <div className={`rounded-xl border p-6 ${variantStyles[variant]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${iconColors[variant]}`} />
        <span className="text-sm font-medium text-slate-400">{title}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {description && (
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      )}
    </div>
  );
}
```

## 🎨 Padrões de Estilo

### Containers

```tsx
// Container de página
<div className="min-h-screen bg-slate-900 p-6">

// Card principal
<div className="bg-slate-800 rounded-xl border border-slate-700 p-6">

// Card interno/secundário
<div className="bg-slate-900 rounded-lg p-4">

// Card com hover
<div className="bg-slate-900 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
```

### Textos

```tsx
// Títulos
<h1 className="text-2xl font-bold text-white">Título Principal</h1>
<h2 className="text-lg font-semibold text-white">Subtítulo</h2>
<h3 className="text-base font-medium text-white">Título de seção</h3>

// Descrições
<p className="text-slate-400">Descrição normal</p>
<p className="text-sm text-slate-500">Descrição secundária</p>

// Labels
<label className="block text-sm font-medium text-slate-300 mb-1">
```

### Botões

```tsx
// Primário
<button className="bg-[#5dbeb4] hover:bg-[#4da89e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">

// Secundário
<button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">

// Ghost
<button className="text-slate-400 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors">

// Danger
<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">

// Com ícone
<button className="flex items-center gap-2 ...">
  <Plus className="h-4 w-4" />
  Texto
</button>
```

### Inputs

```tsx
// Text input
<input
  type="text"
  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white placeholder-slate-400 focus:border-[#5dbeb4] focus:outline-none"
/>

// Select
<select className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-sm text-white focus:border-[#5dbeb4] focus:outline-none">

// Checkbox
<input 
  type="checkbox" 
  className="rounded border-slate-600 bg-slate-700 text-[#5dbeb4] focus:ring-[#5dbeb4]"
/>
```

## ✅ Checklist

- [ ] Nome do arquivo em kebab-case
- [ ] Nome do componente em PascalCase
- [ ] `"use client"` se tem estado/interatividade
- [ ] Interfaces definidas antes do componente
- [ ] Props tipadas com TypeScript
- [ ] Estados de loading e error tratados
- [ ] Usa cores do tema escuro (sem bg-white)
- [ ] Usa cor da marca (#5dbeb4) para destaques
- [ ] Ícones de lucide-react
- [ ] Transitions suaves (transition-colors)
- [ ] Logs com prefixo `[NomeComponente]`

## 📝 Dicas

1. **Sempre exporte named exports**, não default exports
2. **Separe lógica complexa** em hooks customizados
3. **Use composição** para componentes grandes
4. **Prefira props opcionais** com valores default
5. **Documente props** com comentários JSDoc se necessário
