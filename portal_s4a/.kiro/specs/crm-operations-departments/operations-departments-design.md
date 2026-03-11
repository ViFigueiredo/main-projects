# Design: Sistema de Operações e Departamentos

**Data:** 10/12/2025  
**Status:** 🎨 Design  
**Baseado em:** operations-departments-system.md

---

## 📋 Visão Geral

Design técnico detalhado para implementação do sistema hierárquico de Operações e Departamentos no CRM, incluindo arquitetura, componentes, modelos de dados e estratégia de implementação.

## 🏗️ Arquitetura

### Estrutura Hierárquica
```
Portal S4A (Empresa)
├── Operação (VIVO, Claro, TIM)
│   ├── Departamento (B2B, B2C, Corporate)
│   │   ├── Configurações (Status, Campos, Fluxos)
│   │   ├── Dados CRM (Oportunidades, Pedidos, Demandas)
│   │   └── Usuários (Controle de Acesso)
```

### Camadas da Aplicação
```
┌─────────────────────────────────────────┐
│              Frontend (React)            │
├─────────────────────────────────────────┤
│           Server Actions (Next.js)       │
├─────────────────────────────────────────┤
│          Validation (Zod Schemas)        │
├─────────────────────────────────────────┤
│           Database (PostgreSQL)          │
└─────────────────────────────────────────┘
```

## 🗄️ Modelos de Dados

### Operações
```typescript
interface Operation {
  id: number;
  name: string;                    // VIVO, Claro, TIM
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Departamentos
```typescript
interface Department {
  id: number;
  operation_id: number;           // FK para operations
  name: string;                   // B2B, B2C, Corporate
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```
### Acesso de Usuários
```typescript
interface UserDepartmentAccess {
  id: number;
  user_id: number;               // FK para users
  department_id: number;         // FK para departments
  granted_at: Date;
  granted_by?: number;           // FK para users (quem concedeu)
}
```

### Configurações por Departamento
```typescript
interface DepartmentConfiguration {
  id: number;
  department_id: number;         // FK para departments
  config_type: string;           // 'crm_statuses', 'custom_fields', etc.
  config_data: Record<string, any>; // JSONB com configurações
  created_at: Date;
  updated_at: Date;
}
```

## 🔧 Componentes e Interfaces

### Gestão de Operações
```typescript
// src/components/crm/operations/operations-manager.tsx
interface OperationsManagerProps {
  initialOperations?: Operation[];
}

// Funcionalidades:
// - Listar operações
// - Criar nova operação
// - Editar operação existente
// - Ativar/desativar operação
// - Excluir operação (com validação)
```

### Gestão de Departamentos
```typescript
// src/components/crm/departments/departments-manager.tsx
interface DepartmentsManagerProps {
  operationId: number;
  initialDepartments?: Department[];
}

// Funcionalidades:
// - Listar departamentos por operação
// - Criar novo departamento
// - Editar departamento existente
// - Configurar departamento
// - Ativar/desativar departamento
// - Excluir departamento (com validação)
```

### Seletor de Departamento
```typescript
// src/components/crm/departments/department-selector.tsx
interface DepartmentSelectorProps {
  currentDepartmentId?: number;
  onDepartmentChange: (departmentId: number) => void;
  userDepartments: Department[];
}

// Funcionalidades:
// - Mostrar departamentos disponíveis para o usuário
// - Permitir seleção de departamento
// - Persistir seleção no localStorage
// - Atualizar contexto global
```

### Configurações por Departamento
```typescript
// src/components/crm/departments/department-config.tsx
interface DepartmentConfigProps {
  departmentId: number;
  configType: 'crm_statuses' | 'custom_fields' | 'workflows';
}

// Funcionalidades:
// - Gerenciar configurações específicas
// - Copiar configurações entre departamentos
// - Restaurar configurações padrão
// - Validar configurações
```

## 📊 Modelos de Dados CRM Atualizados

### Oportunidades
```typescript
interface CrmOpportunity {
  // ... campos existentes ...
  department_id: number;         // NOVO: FK para departments
}
```

### Pedidos
```typescript
interface CrmOrder {
  // ... campos existentes ...
  department_id: number;         // NOVO: FK para departments
}
```

### Demandas (Post-Sales)
```typescript
interface CrmPostSale {
  // ... campos existentes ...
  department_id: number;         // NOVO: FK para departments
}
```

### Status CRM
```typescript
interface CrmStatus {
  // ... campos existentes ...
  department_id?: number;        // NOVO: FK para departments (null = global)
}
```

### Produtos
```typescript
interface Product {
  // ... campos existentes ...
  department_id?: number;        // NOVO: FK para departments (null = global)
}
```

### Clientes
```typescript
interface ClientPortfolio {
  // ... campos existentes ...
  department_id?: number;        // NOVO: FK para departments (null = global)
}
```
## 🔐 Controle de Acesso

### Context Provider
```typescript
// src/contexts/department-context.tsx
interface DepartmentContextType {
  currentDepartment: Department | null;
  userDepartments: Department[];
  setCurrentDepartment: (department: Department) => void;
  hasAccessToDepartment: (departmentId: number) => boolean;
}
```

### Hook de Departamento
```typescript
// src/hooks/use-department.tsx
export function useDepartment() {
  const context = useContext(DepartmentContext);
  
  return {
    currentDepartment: context.currentDepartment,
    userDepartments: context.userDepartments,
    switchDepartment: context.setCurrentDepartment,
    hasAccess: context.hasAccessToDepartment
  };
}
```

### Middleware de Validação
```typescript
// src/lib/middleware/department-access.ts
export async function validateDepartmentAccess(
  userId: number, 
  departmentId: number
): Promise<boolean> {
  // Verificar se usuário tem acesso ao departamento
  // Verificar se departamento está ativo
  // Verificar se operação está ativa
}
```

## 🛠️ Server Actions

### Operações
```typescript
// src/lib/actions/operations.actions.ts
export async function getOperations(): Promise<Operation[]>
export async function getOperationById(id: number): Promise<Operation | null>
export async function createOperation(data: CreateOperationData): Promise<ActionResult>
export async function updateOperation(id: number, data: UpdateOperationData): Promise<ActionResult>
export async function deleteOperation(id: number): Promise<ActionResult>
export async function toggleOperationStatus(id: number): Promise<ActionResult>
```

### Departamentos
```typescript
// src/lib/actions/departments.actions.ts
export async function getDepartments(operationId?: number): Promise<Department[]>
export async function getDepartmentById(id: number): Promise<Department | null>
export async function createDepartment(data: CreateDepartmentData): Promise<ActionResult>
export async function updateDepartment(id: number, data: UpdateDepartmentData): Promise<ActionResult>
export async function deleteDepartment(id: number): Promise<ActionResult>
export async function toggleDepartmentStatus(id: number): Promise<ActionResult>
```

### Acesso de Usuários
```typescript
// src/lib/actions/department-access.actions.ts
export async function getUserDepartments(userId: number): Promise<Department[]>
export async function grantDepartmentAccess(userId: number, departmentId: number): Promise<ActionResult>
export async function revokeDepartmentAccess(userId: number, departmentId: number): Promise<ActionResult>
export async function getUsersWithDepartmentAccess(departmentId: number): Promise<User[]>
```

### Configurações
```typescript
// src/lib/actions/department-config.actions.ts
export async function getDepartmentConfig(departmentId: number, configType: string): Promise<any>
export async function updateDepartmentConfig(departmentId: number, configType: string, config: any): Promise<ActionResult>
export async function copyDepartmentConfig(sourceDeptId: number, targetDeptId: number, configType: string): Promise<ActionResult>
export async function resetDepartmentConfig(departmentId: number, configType: string): Promise<ActionResult>
```

## 🔄 Atualização das Actions CRM Existentes

### Padrão de Filtro por Departamento
```typescript
// Todas as actions CRM devem seguir este padrão:
export async function getOpportunities(departmentId?: number): Promise<CrmOpportunity[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  
  // Se departmentId não fornecido, usar departamento atual do usuário
  const deptId = departmentId || await getCurrentUserDepartment(user.id);
  
  // Validar acesso ao departamento
  if (deptId && !(await validateDepartmentAccess(user.id, deptId))) {
    throw new Error('Acesso negado ao departamento');
  }
  
  const query = deptId 
    ? db`SELECT * FROM crm_opportunities WHERE department_id = ${deptId}`
    : db`SELECT * FROM crm_opportunities WHERE department_id IS NULL`;
    
  return await query as CrmOpportunity[];
}
```

### Actions a Serem Atualizadas
- `getOpportunities()` → Filtrar por department_id
- `getOrders()` → Filtrar por department_id  
- `getPostSales()` → Filtrar por department_id
- `getCrmStatuses()` → Filtrar por department_id
- `getProducts()` → Filtrar por department_id
- `getClients()` → Filtrar por department_id
- `createOpportunity()` → Adicionar department_id automaticamente
- `createOrder()` → Adicionar department_id automaticamente
- `createPostSale()` → Adicionar department_id automaticamente
## 🎨 Interface do Usuário

### Layout Principal
```typescript
// Atualização do header para incluir seletor de departamento
// src/components/layout/header.tsx
<Header>
  <Logo />
  <Navigation />
  <DepartmentSelector />  {/* NOVO */}
  <UserMenu />
</Header>
```

### Página de Configurações
```typescript
// Nova página: src/app/crm/config/operations/page.tsx
<ConfigLayout>
  <Tabs>
    <TabsList>
      <TabsTrigger value="operations">Operações</TabsTrigger>
      <TabsTrigger value="departments">Departamentos</TabsTrigger>
      <TabsTrigger value="permissions">Permissões</TabsTrigger>
    </TabsList>
    
    <TabsContent value="operations">
      <OperationsManager />
    </TabsContent>
    
    <TabsContent value="departments">
      <DepartmentsManager />
    </TabsContent>
    
    <TabsContent value="permissions">
      <UserDepartmentPermissions />
    </TabsContent>
  </Tabs>
</ConfigLayout>
```

### Atualização das Páginas CRM
```typescript
// Todas as páginas CRM devem usar o contexto de departamento
// Exemplo: src/app/crm/opportunities/page.tsx
export default function OpportunitiesPage() {
  const { currentDepartment } = useDepartment();
  
  if (!currentDepartment) {
    return <DepartmentSelectionPrompt />;
  }
  
  return (
    <CrmLayout>
      <OpportunitiesKanban departmentId={currentDepartment.id} />
    </CrmLayout>
  );
}
```

## 📊 Schemas de Validação

### Operações
```typescript
// src/lib/schemas/operations.ts
export const OperationSchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  is_active: z.boolean().default(true)
});

export const CreateOperationSchema = OperationSchema;
export const UpdateOperationSchema = OperationSchema.partial();
```

### Departamentos
```typescript
// src/lib/schemas/departments.ts
export const DepartmentSchema = z.object({
  operation_id: z.number().positive('Operação é obrigatória'),
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  description: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional(),
  is_active: z.boolean().default(true)
});

export const CreateDepartmentSchema = DepartmentSchema;
export const UpdateDepartmentSchema = DepartmentSchema.partial().omit({ operation_id: true });
```

### Acesso de Usuários
```typescript
// src/lib/schemas/department-access.ts
export const DepartmentAccessSchema = z.object({
  user_id: z.number().positive('Usuário é obrigatório'),
  department_id: z.number().positive('Departamento é obrigatório')
});

export const BulkDepartmentAccessSchema = z.object({
  user_ids: z.array(z.number().positive()).min(1, 'Pelo menos um usuário é obrigatório'),
  department_id: z.number().positive('Departamento é obrigatório')
});
```

## 🗄️ Migrations do Banco de Dados

### Migration 001: Criar Tabelas Base
```sql
-- src/lib/migrations/004_operations_departments_base.sql
CREATE TABLE operations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  operation_id INTEGER NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(operation_id, name)
);

CREATE TABLE user_department_access (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by INTEGER REFERENCES users(id),
  UNIQUE(user_id, department_id)
);

CREATE TABLE department_configurations (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  config_type VARCHAR(50) NOT NULL,
  config_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, config_type)
);
```

### Migration 002: Adicionar Colunas às Tabelas CRM
```sql
-- src/lib/migrations/005_add_department_columns.sql
ALTER TABLE crm_opportunities ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE crm_orders ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE crm_post_sales ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE crm_statuses ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE products ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE client_portfolio ADD COLUMN department_id INTEGER REFERENCES departments(id);
```

### Migration 003: Criar Índices
```sql
-- src/lib/migrations/006_department_indexes.sql
CREATE INDEX idx_departments_operation ON departments(operation_id);
CREATE INDEX idx_user_department_access_user ON user_department_access(user_id);
CREATE INDEX idx_user_department_access_dept ON user_department_access(department_id);
CREATE INDEX idx_dept_config_dept ON department_configurations(department_id);
CREATE INDEX idx_dept_config_type ON department_configurations(config_type);

CREATE INDEX idx_crm_opportunities_dept ON crm_opportunities(department_id);
CREATE INDEX idx_crm_orders_dept ON crm_orders(department_id);
CREATE INDEX idx_crm_post_sales_dept ON crm_post_sales(department_id);
CREATE INDEX idx_crm_statuses_dept ON crm_statuses(department_id);
CREATE INDEX idx_products_dept ON products(department_id);
CREATE INDEX idx_client_portfolio_dept ON client_portfolio(department_id);
```
## 🔄 Tratamento de Erros

### Validações de Negócio
```typescript
// src/lib/validations/department-business-rules.ts
export class DepartmentBusinessRules {
  static async validateOperationDeletion(operationId: number): Promise<void> {
    const departments = await getDepartments(operationId);
    if (departments.length > 0) {
      throw new Error('Não é possível excluir operação com departamentos vinculados');
    }
  }
  
  static async validateDepartmentDeletion(departmentId: number): Promise<void> {
    const hasOpportunities = await hasRecordsInTable('crm_opportunities', departmentId);
    const hasOrders = await hasRecordsInTable('crm_orders', departmentId);
    const hasPostSales = await hasRecordsInTable('crm_post_sales', departmentId);
    
    if (hasOpportunities || hasOrders || hasPostSales) {
      throw new Error('Não é possível excluir departamento com dados vinculados');
    }
  }
  
  static async validateUserDepartmentAccess(userId: number, departmentId: number): Promise<void> {
    const hasAccess = await validateDepartmentAccess(userId, departmentId);
    if (!hasAccess) {
      throw new Error('Usuário não tem acesso a este departamento');
    }
  }
}
```

### Error Boundaries
```typescript
// src/components/error-boundaries/department-error-boundary.tsx
export function DepartmentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <h3 className="text-red-800 font-semibold">Erro no Sistema de Departamentos</h3>
          <p className="text-red-600 mt-2">{error.message}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
            variant="outline"
          >
            Recarregar Página
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
```

## 🧪 Estratégia de Testes

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Propriedades de Correção

**Property 1: Criação de operação disponibiliza para departamentos**
*Para qualquer* operação criada com sucesso, ela deve aparecer na lista de operações disponíveis para criação de departamentos
**Validates: Requirements RF001.2**

**Property 2: Edição de operação reflete em departamentos**
*Para qualquer* operação editada, as alterações devem ser visíveis em todos os departamentos vinculados
**Validates: Requirements RF001.3**

**Property 3: Desativação de operação desativa departamentos**
*Para qualquer* operação desativada, todos os seus departamentos devem ficar inativos automaticamente
**Validates: Requirements RF001.4**

**Property 4: Exclusão de operação valida dependências**
*Para qualquer* operação com departamentos vinculados, a tentativa de exclusão deve ser rejeitada com erro apropriado
**Validates: Requirements RF001.5**

**Property 5: Departamento herda configurações da operação**
*Para qualquer* departamento criado, ele deve iniciar com configurações padrão herdadas da operação pai
**Validates: Requirements RF002.2**

**Property 6: Configurações de departamento são independentes**
*Para qualquer* alteração de configuração em um departamento, ela não deve afetar configurações de outros departamentos
**Validates: Requirements RF002.3**

**Property 7: Desativação de departamento remove acesso**
*Para qualquer* departamento desativado, usuários não devem conseguir acessar seus dados
**Validates: Requirements RF002.4**

**Property 8: Exclusão de departamento valida dependências**
*Para qualquer* departamento com dados CRM vinculados, a tentativa de exclusão deve ser rejeitada
**Validates: Requirements RF002.5**

**Property 9: Status são únicos por departamento**
*Para qualquer* status criado em um departamento, ele não deve aparecer em outros departamentos
**Validates: Requirements RF003.2**

**Property 10: Campos personalizados são específicos**
*Para qualquer* campo personalizado criado em um departamento, ele deve ser específico daquele departamento
**Validates: Requirements RF003.3**

**Property 11: Cópia de configurações replica corretamente**
*Para qualquer* configuração copiada entre departamentos, o resultado deve ser idêntico mas independente
**Validates: Requirements RF003.4**

**Property 12: Restauração volta ao estado inicial**
*Para qualquer* configuração modificada, restaurar padrões deve voltar ao estado original
**Validates: Requirements RF003.5**

**Property 13: Dados são filtrados por departamento**
*Para qualquer* usuário acessando oportunidades, deve ver apenas dados do departamento atual
**Validates: Requirements RF004.1**

**Property 14: Criação vincula ao departamento automaticamente**
*Para qualquer* oportunidade criada, ela deve ser automaticamente vinculada ao departamento ativo
**Validates: Requirements RF004.2**

**Property 15: Mudança de departamento filtra dados**
*Para qualquer* mudança de departamento, os dados exibidos devem ser filtrados automaticamente
**Validates: Requirements RF004.3**

**Property 16: Busca respeita escopo do departamento**
*Para qualquer* busca realizada, os resultados devem ser limitados ao departamento atual
**Validates: Requirements RF004.4**

**Property 17: Relatórios são segmentados**
*Para qualquer* relatório gerado, os dados devem incluir apenas o departamento selecionado
**Validates: Requirements RF004.5**

**Property 18: Lista de departamentos respeita permissões**
*Para qualquer* usuário, a lista de departamentos deve incluir apenas aqueles com acesso concedido
**Validates: Requirements RF005.2**

**Property 19: Departamentos sem acesso são invisíveis**
*Para qualquer* departamento sem permissão, ele não deve aparecer na interface do usuário
**Validates: Requirements RF005.3**

**Property 20: Remoção de acesso é imediata**
*Para qualquer* remoção de permissão, o usuário deve perder acesso imediatamente
**Validates: Requirements RF005.4**

**Property 21: Múltiplos acessos permitem alternância**
*Para qualquer* usuário com acesso a múltiplos departamentos, deve poder alternar entre eles
**Validates: Requirements RF005.5**

**Property 22: Seleção filtra toda interface**
*Para qualquer* seleção de departamento, toda a interface deve ser filtrada consistentemente
**Validates: Requirements RF006.2**

**Property 23: Mudança recarrega dados automaticamente**
*Para qualquer* mudança de departamento, os dados devem ser recarregados automaticamente
**Validates: Requirements RF006.3**

**Property 24: Seletor filtra por permissões**
*Para qualquer* usuário, o seletor deve mostrar apenas departamentos com acesso permitido
**Validates: Requirements RF006.4**

**Property 25: Departamentos inativos não são selecionáveis**
*Para qualquer* departamento inativo, ele não deve estar disponível para seleção
**Validates: Requirements RF006.5**

## 📋 Checklist de Implementação

### Fase 1: Estrutura Base
- [ ] Criar migrations do banco de dados
- [ ] Implementar schemas de validação
- [ ] Criar server actions básicas
- [ ] Implementar testes de propriedades básicas

### Fase 2: Interface de Gestão
- [ ] Criar componente de gestão de operações
- [ ] Criar componente de gestão de departamentos
- [ ] Implementar validações de interface
- [ ] Criar testes de interface

### Fase 3: Segmentação CRM
- [ ] Atualizar actions CRM existentes
- [ ] Implementar filtros por departamento
- [ ] Criar seletor de departamento
- [ ] Implementar context provider

### Fase 4: Controle de Acesso
- [ ] Implementar sistema de permissões
- [ ] Criar interface de gestão de usuários
- [ ] Implementar middleware de validação
- [ ] Criar testes de segurança

### Fase 5: Migração e Testes
- [ ] Migrar dados existentes
- [ ] Executar testes completos
- [ ] Validar performance
- [ ] Documentar sistema

---

**Design criado por:** Kiro AI  
**Data:** 10/12/2025  
**Próxima etapa:** Implementação por fases