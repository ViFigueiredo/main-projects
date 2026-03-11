# Guia Rápido: Implementação de Operações/Suboperações

**Data:** 09/12/2025  
**Tempo estimado:** 2-3 dias de desenvolvimento

---

## 🎯 OBJETIVO

Transformar o CRM atual em um sistema multi-operação, permitindo segmentar vendas por:
- **Operações:** VIVO, Claro, TIM, etc.
- **Suboperações:** B2B, B2C, Corporate, etc.

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### ✅ FASE 1: DATABASE (30 minutos)

1. **Executar migration SQL**
   ```bash
   # Conectar ao banco
   psql $DATABASE_URL
   
   # Executar migration
   \i src/lib/migrations/003_operations_suboperations.sql
   
   # Verificar tabelas criadas
   \dt operations
   \dt suboperations
   \dt user_suboperation_access
   ```

2. **Verificar dados migrados**
   ```sql
   -- Ver operação padrão criada
   SELECT * FROM operations;
   
   -- Ver suboperação padrão
   SELECT * FROM suboperations;
   
   -- Verificar se produtos foram migrados
   SELECT COUNT(*) FROM products WHERE suboperation_id IS NOT NULL;
   ```

---

### ✅ FASE 2: BACKEND (4-6 horas)

#### 2.1 Atualizar Schemas (1 hora)

**Arquivo:** `src/lib/schemas/crm.ts`

```typescript
// Adicionar no início do arquivo
export const OperationSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Operation = z.infer<typeof OperationSchema>;

export const SuboperationSchema = z.object({
  id: z.number().optional(),
  operation_id: z.number({ required_error: 'Operação é obrigatória' }),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

export type Suboperation = z.infer<typeof SuboperationSchema>;

// Adicionar suboperation_id em schemas existentes
export const CrmOpportunitySchema = z.object({
  // ... campos existentes ...
  suboperation_id: z.number().optional(),
});

// Repetir para: CrmOrderSchema, CrmPostSalesSchema, ProductSchema, etc.
```

#### 2.2 Criar Actions de Operações (2 horas)

**Arquivo:** `src/lib/actions/operations.actions.ts` (CRIAR NOVO)

```typescript
'use server';

import { getCurrentUser } from '@/lib/auth';
import db from '@/lib/db';
import { Operation, OperationSchema, Suboperation, SuboperationSchema } from '@/lib/schemas/crm';
import { revalidatePath } from 'next/cache';

// --- Operations ---
export async function getOperations() {
  const user = await getCurrentUser();
  if (!user) return [];
  
  try {
    const operations = await db`SELECT * FROM operations WHERE is_active = true ORDER BY name`;
    return operations as unknown as Operation[];
  } catch (error) {
    console.error('Error fetching operations:', error);
    return [];
  }
}

export async function createOperation(data: Operation) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Permissão negada.' };
  }
  
  const validated = OperationSchema.parse(data);
  
  try {
    await db`
      INSERT INTO operations (name, description, is_active)
      VALUES (${validated.name}, ${validated.description || null}, ${validated.is_active})
    `;
    revalidatePath('/crm/operations');
    return { success: true };
  } catch (error) {
    console.error('Error creating operation:', error);
    return { success: false, error: 'Erro ao criar operação.' };
  }
}

// --- Suboperations ---
export async function getSuboperations(operationId?: number) {
  const user = await getCurrentUser();
  if (!user) return [];
  
  try {
    let query = db`
      SELECT s.*, o.name as operation_name
      FROM suboperations s
      JOIN operations o ON s.operation_id = o.id
      WHERE s.is_active = true
      ORDER BY o.name, s.name
    `;
    
    if (operationId) {
      query = db`
        SELECT s.*, o.name as operation_name
        FROM suboperations s
        JOIN operations o ON s.operation_id = o.id
        WHERE s.is_active = true AND s.operation_id = ${operationId}
        ORDER BY s.name
      `;
    }
    
    return await query as any[];
  } catch (error) {
    console.error('Error fetching suboperations:', error);
    return [];
  }
}

export async function createSuboperation(data: Suboperation) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return { success: false, error: 'Permissão negada.' };
  }
  
  const validated = SuboperationSchema.parse(data);
  
  try {
    await db`
      INSERT INTO suboperations (operation_id, name, description, is_active)
      VALUES (${validated.operation_id}, ${validated.name}, ${validated.description || null}, ${validated.is_active})
    `;
    revalidatePath('/crm/operations');
    return { success: true };
  } catch (error) {
    console.error('Error creating suboperation:', error);
    return { success: false, error: 'Erro ao criar suboperação.' };
  }
}

// Adicionar: updateOperation, deleteOperation, updateSuboperation, deleteSuboperation
// Adicionar: getUserSuboperations, assignUserToSuboperation, removeUserFromSuboperation
```

#### 2.3 Modificar Actions Existentes (2-3 horas)

**Arquivo:** `src/lib/actions/crm.actions.ts`

Adicionar filtro em TODAS as queries:

```typescript
// ANTES
export async function getOpportunities() {
  const opportunities = await db`
    SELECT o.*, c.company_name as client_name, s.name as status_name
    FROM crm_opportunities o
    JOIN client_portfolio c ON o.client_id = c.id
    JOIN crm_statuses s ON o.status_id = s.id
    ORDER BY o.updated_at DESC
  `;
  return opportunities;
}

// DEPOIS
export async function getOpportunities(suboperationId?: number) {
  const user = await getCurrentUser();
  if (!user) return [];
  
  let query = db`
    SELECT o.*, c.company_name as client_name, s.name as status_name
    FROM crm_opportunities o
    JOIN client_portfolio c ON o.client_id = c.id
    JOIN crm_statuses s ON o.status_id = s.id
  `;
  
  if (suboperationId) {
    query = db`
      SELECT o.*, c.company_name as client_name, s.name as status_name
      FROM crm_opportunities o
      JOIN client_portfolio c ON o.client_id = c.id
      JOIN crm_statuses s ON o.status_id = s.id
      WHERE o.suboperation_id = ${suboperationId}
      ORDER BY o.updated_at DESC
    `;
  } else {
    query = db`
      SELECT o.*, c.company_name as client_name, s.name as status_name
      FROM crm_opportunities o
      JOIN client_portfolio c ON o.client_id = c.id
      JOIN crm_statuses s ON o.status_id = s.id
      ORDER BY o.updated_at DESC
    `;
  }
  
  return await query as any[];
}
```

Repetir para:
- `getOrders()`
- `getPostSales()`
- `getProducts()`
- `getCrmStatuses()`
- `getCustomFields()`
- `getClients()` (se existir)

---

### ✅ FASE 3: FRONTEND (6-8 horas)

#### 3.1 Criar Seletor de Suboperação (2 horas)

**Arquivo:** `src/components/crm/suboperation-selector.tsx` (CRIAR NOVO)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getOperations, getSuboperations } from '@/lib/actions/operations.actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function SuboperationSelector() {
  const [operations, setOperations] = useState([]);
  const [suboperations, setSuboperations] = useState([]);
  const [selectedSubop, setSelectedSubop] = useState<number | null>(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const ops = await getOperations();
    const subops = await getSuboperations();
    setOperations(ops);
    setSuboperations(subops);
    
    // Carregar seleção do localStorage
    const saved = localStorage.getItem('selected_suboperation');
    if (saved) setSelectedSubop(parseInt(saved));
  };
  
  const handleChange = (value: string) => {
    const subopId = parseInt(value);
    setSelectedSubop(subopId);
    localStorage.setItem('selected_suboperation', value);
    window.location.reload(); // Recarregar página para aplicar filtro
  };
  
  return (
    <Select value={selectedSubop?.toString()} onValueChange={handleChange}>
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Selecione operação/suboperação" />
      </SelectTrigger>
      <SelectContent>
        {suboperations.map((subop: any) => (
          <SelectItem key={subop.id} value={subop.id.toString()}>
            {subop.operation_name} → {subop.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

#### 3.2 Adicionar Seletor no Layout (30 minutos)

**Arquivo:** `src/components/layout/dashboard-layout.tsx`

```typescript
import { SuboperationSelector } from '@/components/crm/suboperation-selector';

// Adicionar no header/sidebar
<div className="flex items-center gap-4">
  <SuboperationSelector />
  {/* ... outros elementos ... */}
</div>
```

#### 3.3 Criar Tela de Gerenciamento (3-4 horas)

**Arquivo:** `src/app/crm/operations/page.tsx` (CRIAR NOVO)

```typescript
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { OperationsManager } from '@/components/crm/operations/operations-manager';

export default function OperationsPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold">Operações e Suboperações</h1>
        <OperationsManager />
      </div>
    </DashboardLayout>
  );
}
```

**Arquivo:** `src/components/crm/operations/operations-manager.tsx` (CRIAR NOVO)

Criar componente com:
- Listagem de operações
- CRUD de operações
- Listagem de suboperações por operação
- CRUD de suboperações
- Atribuição de usuários

#### 3.4 Atualizar Formulários (1-2 horas)

Adicionar campo `suboperation_id` (oculto) em:
- `opportunity-form.tsx`
- `order-form.tsx`
- `post-sales-form.tsx`
- `product-form.tsx`
- `client-portfolio-form.tsx`

```typescript
// Pegar suboperação selecionada
const selectedSubop = localStorage.getItem('selected_suboperation');

// Adicionar ao form
<input type="hidden" name="suboperation_id" value={selectedSubop} />
```

---

### ✅ FASE 4: TESTES (2-3 horas)

1. **Criar operações de teste**
   - VIVO, Claro, TIM
   - Suboperações: B2B, B2C

2. **Testar isolamento**
   - Criar produtos em VIVO B2B
   - Verificar que não aparecem em Claro B2B
   - Criar oportunidade em VIVO B2B
   - Verificar que só mostra produtos de VIVO B2B

3. **Testar permissões**
   - Criar usuário com acesso apenas a VIVO B2B
   - Verificar que não vê dados de outras suboperações

4. **Testar performance**
   - Verificar tempo de queries
   - Confirmar que índices estão sendo usados

---

## 🚀 COMANDOS ÚTEIS

```bash
# Executar migration
psql $DATABASE_URL -f src/lib/migrations/003_operations_suboperations.sql

# Verificar tabelas
psql $DATABASE_URL -c "\dt operations"

# Ver dados
psql $DATABASE_URL -c "SELECT * FROM operations;"
psql $DATABASE_URL -c "SELECT * FROM suboperations;"

# Build do projeto
pnpm build

# Rodar em dev
pnpm dev
```

---

## 📚 ARQUIVOS CRIADOS/MODIFICADOS

### Novos Arquivos
- ✅ `src/lib/migrations/003_operations_suboperations.sql`
- ✅ `src/lib/actions/operations.actions.ts`
- ✅ `src/components/crm/suboperation-selector.tsx`
- ✅ `src/app/crm/operations/page.tsx`
- ✅ `src/components/crm/operations/operations-manager.tsx`

### Arquivos Modificados
- ✅ `src/lib/schemas/crm.ts` (adicionar schemas)
- ✅ `src/lib/actions/crm.actions.ts` (adicionar filtros)
- ✅ `src/components/layout/dashboard-layout.tsx` (adicionar seletor)
- ✅ Todos os formulários CRM (adicionar suboperation_id)

---

## ⚠️ PONTOS DE ATENÇÃO

1. **Backup do banco antes da migration**
2. **Testar migration em ambiente de dev primeiro**
3. **Verificar permissões de usuários**
4. **Atualizar documentação de API**
5. **Treinar usuários no novo sistema**

---

## 🎉 RESULTADO FINAL

Após implementação, o CRM terá:
- ✅ Segmentação completa por operação/suboperação
- ✅ Isolamento total de dados
- ✅ Controle de acesso granular
- ✅ Relatórios segmentados
- ✅ Interface intuitiva com seletor

---

**Guia criado por:** Kiro AI  
**Data:** 09/12/2025  
**Tempo estimado total:** 2-3 dias
