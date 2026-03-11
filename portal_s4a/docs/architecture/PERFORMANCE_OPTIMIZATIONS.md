# Otimizações de Performance

Documento das otimizações implementadas para melhorar a performance das rotas `/`, `/login`, `/hr/teams` e `/hr/hierarchies`.

## Problemas Identificados

1. **Erro intermitente "Permissão negada"** nas rotas `/hr/teams` e `/hr/hierarchies`
2. **Lentidão no carregamento** das páginas principais
3. **Múltiplas consultas ao banco** sem cache

## Soluções Implementadas

### 1. Remoção do `cache()` do React em `getCurrentUser()`

**Arquivo:** `src/lib/auth.ts`

O uso de `cache()` do React causava retornos `null` intermitentes em produção na Vercel. Removido para garantir consistência.

### 2. Cache com `unstable_cache` para Dados Estáticos

**Arquivos:**
- `src/lib/actions/theme.actions.ts` - `getThemeConfigs()`
- `src/lib/actions/system-settings.actions.ts` - `getSystemSettings()`

```typescript
export const getThemeConfigs = unstable_cache(
  fetchThemeConfigs,
  ['theme-configs'],
  { tags: ['theme-configs'] }
);
```

### 3. Loading States com Suspense e Skeletons

**Arquivos criados:**
- `src/app/loading.tsx`
- `src/app/login/loading.tsx`
- `src/app/hr/teams/loading.tsx`
- `src/app/hr/hierarchies/loading.tsx`

Cada rota agora tem um loading state dedicado que exibe skeletons enquanto os dados carregam.

### 4. Tratamento de Erros sem Exceções

**Arquivos:**
- `src/lib/actions/teams.ts`
- `src/lib/actions/hierarchy.ts`

Em vez de lançar exceções, as funções retornam flags:
```typescript
return { noSession: true };  // Usuário não logado
return { noPermission: true };  // Sem permissão
```

As páginas verificam essas flags e redirecionam apropriadamente.

### 5. Carregamento Paralelo de Dados

**Arquivos:**
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/components/layout/dashboard-layout.tsx`
- `src/components/dashboard/system-updates-card.tsx`

Uso de `Promise.all()` para buscar dados independentes em paralelo:
```typescript
const [user, settings] = await Promise.all([
  requireAuth(),
  getSystemSettings(),
]);
```

### 6. Verificação de Usuário Antes de Carregar Configs

**Arquivo:** `src/app/login/page.tsx`

A página de login verifica se o usuário já está logado antes de carregar temas e configurações:
```typescript
const user = await getCurrentUser();
if (user) redirect("/");

// Só carrega configs se não logado
const [themeConfigs, systemSettings] = await Promise.all([...]);
```

## Índices de Banco de Dados

Criados índices para otimizar consultas frequentes:

```sql
-- Tabela employees
CREATE INDEX idx_employees_status ON employees(employee_status);
CREATE INDEX idx_employees_department ON employees(department_id);
CREATE INDEX idx_employees_job_position ON employees(job_position_id);
CREATE INDEX idx_employees_name ON employees(name);

-- Tabela users
CREATE INDEX idx_users_employee ON users(employee_id);
```

## Resultados Esperados

- Redução do tempo de carregamento inicial
- Eliminação de erros intermitentes de permissão
- Melhor experiência do usuário com loading states
- Menos consultas ao banco de dados via cache
