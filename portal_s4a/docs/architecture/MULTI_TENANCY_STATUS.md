# Status Multi-Tenancy do Portal Avantti

## Visão Geral

O sistema utiliza `company_id` para isolamento de dados entre tenants (empresas). Este documento resume o status atual de cada módulo.

**Data da Análise:** Janeiro/2026
**Última Atualização:** 20/01/2026

---

## 🔐 Sistema de Seleção de Empresa (Super Admin)

### Funcionalidade Implementada ✅

- Super admin pode trocar de empresa via dropdown na sidebar
- Cookie `selected_company_id` armazena a empresa selecionada
- `getCurrentUser()` retorna `companyId` efetivo (selecionado ou padrão)
- Componente `CompanySelector` na sidebar

### Empresas no Sistema

| ID  | Nome                                        | Status             |
| --- | ------------------------------------------- | ------------------ |
| 1   | EDF SERVICOS DE TELECOMUNICACOES LTDA - EPP | Tenant Principal   |
| 2   | Sistema Global (Super Admin)                | Tenant Super Admin |

---

## 📊 Status por Módulo

### ✅ Configurações (Settings)

**Status: COMPLETO**

| Tabela            | company_id | Filtro | Status   |
| ----------------- | ---------- | ------ | -------- |
| `themes`          | ✅         | ✅     | Completo |
| `system_settings` | ✅         | ✅     | Completo |
| `users`           | ✅         | ✅     | Completo |

**Arquivos:**

- [theme.actions.ts](../src/lib/actions/theme.actions.ts) - Filtra por company_id
- [system-settings.actions.ts](../src/lib/actions/system-settings.actions.ts) - Filtra por company_id

---

### ✅ Intranet (Apps/Links)

**Status: COMPLETO**

| Tabela           | company_id | Filtro | Status   |
| ---------------- | ---------- | ------ | -------- |
| `app_links`      | ✅         | ✅     | Completo |
| `app_categories` | ✅         | ✅     | Completo |

**Arquivos:**

- [app.actions.ts](../src/lib/actions/app.actions.ts) - Todas funções filtram por company_id

---

### ✅ Relatórios (Power BI)

**Status: COMPLETO**

| Tabela            | company_id | Filtro | Status   |
| ----------------- | ---------- | ------ | -------- |
| `powerbi_reports` | ✅         | ✅     | Completo |

**Arquivos:**

- [powerbi.actions.ts](../src/lib/actions/powerbi.actions.ts) - Todas funções filtram por company_id

---

### ✅ RH (Human Resources)

**Status: COMPLETO**

| Tabela        | company_id | Filtro | Status                    |
| ------------- | ---------- | ------ | ------------------------- |
| `employees`   | ✅         | ✅     | Completo                  |
| `occurrences` | ✅         | ✅     | Completo (via employee)   |
| `notes`       | ✅         | ✅     | Completo                  |
| `departments` | ✅         | ✅     | Completo (via operations) |
| `operations`  | ✅         | ✅     | Completo                  |

**Arquivos:**

- [occurrence.actions.ts](../src/lib/actions/occurrence.actions.ts) - Filtra por company_id via employee
- [notes/route.ts](../src/app/api/notes/route.ts) - Filtra por company_id

---

### ✅ CRM

**Status: COMPLETO**

| Tabela               | company_id | Filtro | Status   |
| -------------------- | ---------- | ------ | -------- |
| `client_portfolio`   | ✅         | ✅     | Completo |
| `product_categories` | ✅         | ✅     | Completo |
| `crm_opportunities`  | ✅         | ✅     | Completo |
| `crm_orders`         | ✅         | ✅     | Completo |
| `crm_post_sales`     | ✅         | ✅     | Completo |
| `crm_statuses`       | ✅         | ✅     | Completo |
| `products`           | ✅         | ✅     | Completo |

**Arquivos:**

- [client-portfolio.actions.ts](../src/lib/actions/client-portfolio.actions.ts) - Filtros implementados
- [crm.actions.ts](../src/lib/actions/crm.actions.ts) - Todas funções filtram por company_id

---

### ✅ Centro de Aprendizagem (CMS/Learning)

**Status: COMPLETO**

| Tabela               | company_id | Filtro | Status   |
| -------------------- | ---------- | ------ | -------- |
| `content`            | ✅         | ✅     | Completo |
| `content_categories` | ✅         | ✅     | Completo |

**Arquivos:**

- [content.actions.ts](../src/lib/actions/content.actions.ts) - Todas funções filtram por company_id
- [categories.actions.ts](../src/lib/actions/categories.actions.ts) - Todas funções filtram por company_id

**Funções atualizadas:**

- `uploadContent` - INSERT com company_id
- `getAccessibleContent` - Filtro por company_id
- `getContentById` - Filtro por company_id
- `updateContent` - Filtro por company_id
- `deleteContent` - Filtro por company_id
- `getContentByCategory` - Filtro por company_id
- `getPopularContent` - Filtro por company_id
- `getRecentContent` - Filtro por company_id
- `getContentStats` - Filtro por company_id
- `getDetailedContentStats` - Filtro por company_id
- `getCategories` - Filtro por company_id
- `getCategoryById` - Filtro por company_id
- `createCategory` - INSERT com company_id
- `searchCategories` - Filtro por company_id

---

### ❌ Tarefas Pessoais

**Status: SEM SUPORTE (por user_id)**

| Tabela             | company_id | Filtro | Status             |
| ------------------ | ---------- | ------ | ------------------ |
| `personal_tasks`   | ❌         | -      | Filtro por user_id |
| `task_templates`   | ❌         | -      | Precisa coluna     |
| `task_reminders`   | ❌         | -      | Precisa coluna     |
| `task_attachments` | ❌         | -      | Precisa coluna     |

**Nota:** Tarefas pessoais são isoladas por user_id, mas company_id pode ser útil para templates compartilhados.

---

### ❌ Estoque (Inventory)

**Status: SEM SUPORTE**

| Tabela                   | company_id | Filtro | Status         |
| ------------------------ | ---------- | ------ | -------------- |
| `suppliers`              | ❌         | -      | Precisa coluna |
| `inventory_movements`    | ❌         | -      | Precisa coluna |
| `inventory_alerts`       | ❌         | -      | Precisa coluna |
| `inventory_locations`    | ❌         | -      | Precisa coluna |
| `inventory_reservations` | ❌         | -      | Precisa coluna |
| `unique_items`           | ❌         | -      | Precisa coluna |

---

### ❌ Chat Interno

**Status: SEM SUPORTE**

| Tabela              | company_id | Filtro | Status         |
| ------------------- | ---------- | ------ | -------------- |
| `chats`             | ❌         | -      | Precisa coluna |
| `chat_messages`     | ❌         | -      | Precisa coluna |
| `chat_participants` | ❌         | -      | Precisa coluna |

**Nota:** Chat pode depender indiretamente de employees que já tem company_id.

---

## 📋 Resumo Consolidado

| Módulo                     | Estrutura (DB) | Filtro (Actions) | Status Final        |
| -------------------------- | -------------- | ---------------- | ------------------- |
| **Configurações**          | ✅             | ✅               | ✅ Completo         |
| **Intranet**               | ✅             | ✅               | ✅ Completo         |
| **Relatórios**             | ✅             | ✅               | ✅ Completo         |
| **RH**                     | ✅             | ✅               | ✅ Completo         |
| **CRM**                    | ✅             | ✅               | ✅ Completo         |
| **Centro de Aprendizagem** | ✅             | ✅               | ✅ Completo         |
| **Tarefas Pessoais**       | ❌             | ❌               | ❌ Não Implementado |
| **Estoque**                | ❌             | ❌               | ❌ Não Implementado |
| **Chat**                   | ❌             | ❌               | ❌ Não Implementado |

---

## 🔧 Próximos Passos Recomendados

### Média Prioridade

1. Adicionar company_id em tabelas de estoque

### Baixa Prioridade

1. Avaliar necessidade de company_id em tarefas pessoais
2. Avaliar necessidade de company_id em chat

---

## 📝 Como Implementar Multi-Tenancy

### 1. Adicionar coluna no banco (SQL)

```sql
ALTER TABLE nome_tabela ADD COLUMN company_id INTEGER REFERENCES companies(id);
UPDATE nome_tabela SET company_id = 1; -- Define empresa padrão
```

### 2. Adicionar filtro nas actions (TypeScript)

```typescript
export async function getItems() {
  const user = await getCurrentUser();
  if (!user) return [];

  // Super admin sem empresa selecionada vê tudo
  if (user.isSuperAdmin && !user.companyId) {
    return await db`SELECT * FROM items`;
  }

  // Filtra por company_id
  return await db`
    SELECT * FROM items 
    WHERE company_id = ${user.companyId}
  `;
}
```

### 3. Passar company_id ao criar registros

```typescript
export async function createItem(data: ItemData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Não autorizado' };

  return await db`
    INSERT INTO items (name, company_id)
    VALUES (${data.name}, ${user.companyId})
  `;
}
```

---

_Documento atualizado em 20/01/2026_
