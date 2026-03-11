# Sistema de Operações e Departamentos - CRM

**Data:** 10/12/2025  
**Status:** 📋 Especificação  
**Prioridade:** 🔴 Alta  
**Complexidade:** 🔴 Alta

---

## 📋 Visão Geral

Implementar um sistema hierárquico de **Operações** e **Departamentos** no CRM que permita segmentação completa de dados e configurações, onde cada departamento possui suas próprias configurações de Oportunidades, Pedidos e Demandas.

## 🎯 Objetivos

### Principais
- Segmentar completamente o CRM por Operações → Departamentos
- Isolar dados entre departamentos diferentes
- Permitir configurações independentes por departamento
- Controlar acesso de usuários por departamento

### Secundários
- Manter funcionalidades atuais intactas
- Facilitar gestão de múltiplas linhas de negócio
- Permitir relatórios segmentados
- Escalabilidade para futuras operações

---

## 🏗️ Estrutura Hierárquica

```
Empresa: Portal S4A
├── Operação: VIVO
│   ├── Departamento: B2B
│   │   ├── Configurações próprias (Status, Campos, etc.)
│   │   ├── Oportunidades específicas
│   │   ├── Pedidos específicos
│   │   └── Demandas específicas
│   ├── Departamento: B2C
│   │   └── [Mesma estrutura]
│   └── Departamento: Corporate
│       └── [Mesma estrutura]
├── Operação: Claro
│   ├── Departamento: Residencial
│   └── Departamento: Empresarial
└── Operação: TIM
    └── [Departamentos específicos]
```

---

## 📊 Requisitos Funcionais

### RF001 - Gestão de Operações
**Como** administrador do sistema  
**Quero** gerenciar operações (VIVO, Claro, TIM, etc.)  
**Para que** eu possa organizar as diferentes linhas de negócio

#### Critérios de Aceitação
1. **QUANDO** acesso CRM > Cadastro > Operações/Departamentos **ENTÃO** vejo interface de gestão
2. **QUANDO** crio uma operação **ENTÃO** ela fica disponível para criação de departamentos
3. **QUANDO** edito uma operação **ENTÃO** as alterações se refletem em todos os departamentos
4. **QUANDO** desativo uma operação **ENTÃO** todos os departamentos ficam inativos
5. **QUANDO** excluo uma operação **ENTÃO** sistema valida se não há dados vinculados

### RF002 - Gestão de Departamentos
**Como** administrador do sistema  
**Quero** gerenciar departamentos dentro de cada operação  
**Para que** eu possa segmentar ainda mais as atividades comerciais

#### Critérios de Aceitação
1. **QUANDO** seleciono uma operação **ENTÃO** posso criar departamentos para ela
2. **QUANDO** crio um departamento **ENTÃO** ele herda configurações padrão da operação
3. **QUANDO** configuro um departamento **ENTÃO** as configurações são independentes
4. **QUANDO** desativo um departamento **ENTÃO** usuários perdem acesso aos dados
5. **QUANDO** excluo um departamento **ENTÃO** sistema valida dependências

### RF003 - Configurações por Departamento
**Como** administrador do sistema  
**Quero** configurar status, campos e fluxos por departamento  
**Para que** cada departamento tenha suas próprias regras de negócio

#### Critérios de Aceitação
1. **QUANDO** acesso configurações de um departamento **ENTÃO** vejo opções específicas
2. **QUANDO** configuro status de oportunidades **ENTÃO** eles são únicos do departamento
3. **QUANDO** configuro campos personalizados **ENTÃO** eles são específicos do departamento
4. **QUANDO** copio configurações **ENTÃO** posso replicar entre departamentos
5. **QUANDO** restauro padrões **ENTÃO** configurações voltam ao estado inicial

### RF004 - Segmentação de Dados CRM
**Como** usuário do sistema  
**Quero** que oportunidades, pedidos e demandas sejam segmentados por departamento  
**Para que** eu veja apenas dados relevantes ao meu contexto

#### Critérios de Aceitação
1. **QUANDO** acesso oportunidades **ENTÃO** vejo apenas do meu departamento
2. **QUANDO** crio uma oportunidade **ENTÃO** ela é automaticamente vinculada ao departamento
3. **QUANDO** mudo de departamento **ENTÃO** dados são filtrados automaticamente
4. **QUANDO** busco registros **ENTÃO** busca é limitada ao departamento atual
5. **QUANDO** gero relatórios **ENTÃO** dados são segmentados por departamento

### RF005 - Controle de Acesso por Departamento
**Como** administrador do sistema  
**Quero** controlar quais usuários têm acesso a quais departamentos  
**Para que** eu possa garantir segurança e organização dos dados

#### Critérios de Aceitação
1. **QUANDO** configuro permissões de usuário **ENTÃO** posso selecionar departamentos
2. **QUANDO** usuário acessa sistema **ENTÃO** vê apenas departamentos permitidos
3. **QUANDO** usuário não tem acesso **ENTÃO** departamento não aparece na interface
4. **QUANDO** removo acesso **ENTÃO** usuário perde acesso imediatamente
5. **QUANDO** usuário tem múltiplos acessos **ENTÃO** pode alternar entre departamentos

### RF006 - Seletor de Departamento
**Como** usuário do sistema  
**Quero** selecionar qual departamento estou visualizando  
**Para que** eu possa trabalhar com dados do contexto correto

#### Critérios de Aceitação
1. **QUANDO** acesso o sistema **ENTÃO** vejo seletor de departamento no header
2. **QUANDO** seleciono um departamento **ENTÃO** toda interface é filtrada
3. **QUANDO** mudo departamento **ENTÃO** dados são recarregados automaticamente
4. **QUANDO** não tenho acesso **ENTÃO** departamento não aparece no seletor
5. **QUANDO** departamento está inativo **ENTÃO** não posso selecioná-lo

---

## 📊 Requisitos Não Funcionais

### RNF001 - Performance
- Queries devem manter performance atual mesmo com segmentação
- Índices apropriados para filtros por departamento
- Cache de configurações por departamento

### RNF002 - Segurança
- Isolamento completo de dados entre departamentos
- Validação de acesso em todas as operações
- Logs de auditoria para mudanças de departamento

### RNF003 - Usabilidade
- Interface intuitiva para seleção de departamento
- Migração transparente para usuários existentes
- Feedback claro sobre departamento ativo

### RNF004 - Manutenibilidade
- Código modular para fácil extensão
- Configurações centralizadas
- Documentação completa da arquitetura

---

## 🗄️ Estrutura do Banco de Dados

### Novas Tabelas

```sql
-- Operações (VIVO, Claro, TIM, etc.)
CREATE TABLE operations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Departamentos (B2B, B2C, Corporate, etc.)
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

-- Acesso de usuários aos departamentos
CREATE TABLE user_department_access (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by INTEGER REFERENCES users(id),
  UNIQUE(user_id, department_id)
);

-- Configurações específicas por departamento
CREATE TABLE department_configurations (
  id SERIAL PRIMARY KEY,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  config_type VARCHAR(50) NOT NULL, -- 'crm_statuses', 'custom_fields', etc.
  config_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(department_id, config_type)
);
```

### Tabelas Modificadas

```sql
-- Adicionar department_id às tabelas existentes
ALTER TABLE crm_opportunities ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE crm_orders ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE crm_post_sales ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE crm_statuses ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE products ADD COLUMN department_id INTEGER REFERENCES departments(id);
ALTER TABLE client_portfolio ADD COLUMN department_id INTEGER REFERENCES departments(id);

-- Índices para performance
CREATE INDEX idx_crm_opportunities_department ON crm_opportunities(department_id);
CREATE INDEX idx_crm_orders_department ON crm_orders(department_id);
CREATE INDEX idx_crm_post_sales_department ON crm_post_sales(department_id);
CREATE INDEX idx_crm_statuses_department ON crm_statuses(department_id);
CREATE INDEX idx_products_department ON products(department_id);
CREATE INDEX idx_client_portfolio_department ON client_portfolio(department_id);
```

---

## 🏗️ Arquitetura da Solução

### Backend (Server Actions)

```typescript
// src/lib/actions/operations.actions.ts
export async function getOperations()
export async function createOperation(data: Operation)
export async function updateOperation(id: number, data: Partial<Operation>)
export async function deleteOperation(id: number)

// src/lib/actions/departments.actions.ts
export async function getDepartments(operationId?: number)
export async function createDepartment(data: Department)
export async function updateDepartment(id: number, data: Partial<Department>)
export async function deleteDepartment(id: number)

// src/lib/actions/department-access.actions.ts
export async function getUserDepartments(userId: number)
export async function grantDepartmentAccess(userId: number, departmentId: number)
export async function revokeDepartmentAccess(userId: number, departmentId: number)

// src/lib/actions/department-config.actions.ts
export async function getDepartmentConfig(departmentId: number, configType: string)
export async function updateDepartmentConfig(departmentId: number, configType: string, config: any)
```

### Frontend (Componentes)

```typescript
// src/components/crm/operations/operations-manager.tsx
// Interface principal de gestão

// src/components/crm/departments/department-selector.tsx
// Seletor de departamento no header

// src/components/crm/departments/department-config.tsx
// Configurações específicas por departamento

// src/components/settings/user-department-permissions.tsx
// Gestão de permissões de usuários
```

### Schemas (Validação)

```typescript
// src/lib/schemas/operations.ts
export const OperationSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
});

export const DepartmentSchema = z.object({
  operation_id: z.number(),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  is_active: z.boolean().default(true)
});
```

---

## 🔄 Fluxo de Implementação

### Fase 1: Estrutura Base (1 semana)
1. **Database**: Criar tabelas e migrations
2. **Schemas**: Definir validações Zod
3. **Actions**: Implementar CRUD básico
4. **Testes**: Validar estrutura base

### Fase 2: Interface de Gestão (1 semana)
1. **Operações**: Interface para CRUD de operações
2. **Departamentos**: Interface para CRUD de departamentos
3. **Configurações**: Interface para configurações por departamento
4. **Validação**: Testes de interface

### Fase 3: Segmentação CRM (2 semanas)
1. **Oportunidades**: Adicionar filtro por departamento
2. **Pedidos**: Adicionar filtro por departamento
3. **Demandas**: Adicionar filtro por departamento
4. **Seletor**: Implementar seletor de departamento

### Fase 4: Controle de Acesso (1 semana)
1. **Permissões**: Sistema de acesso por departamento
2. **Interface**: Gestão de permissões de usuários
3. **Validação**: Testes de segurança
4. **Migração**: Migrar usuários existentes

### Fase 5: Migração e Testes (1 semana)
1. **Migração**: Migrar dados existentes
2. **Testes**: Testes completos do sistema
3. **Documentação**: Atualizar documentação
4. **Treinamento**: Preparar material de treinamento

---

## 🧪 Estratégia de Migração

### Dados Existentes
1. **Operação Padrão**: Criar operação "Principal"
2. **Departamento Padrão**: Criar departamento "Geral"
3. **Migração**: Associar todos os dados existentes ao departamento padrão
4. **Usuários**: Dar acesso ao departamento padrão para todos os usuários

### Configurações
1. **Status**: Migrar status existentes para departamento padrão
2. **Campos**: Migrar campos personalizados para departamento padrão
3. **Produtos**: Associar produtos existentes ao departamento padrão

---

## ⚠️ Riscos e Mitigações

### Riscos Técnicos
- **Performance**: Queries mais complexas
  - *Mitigação*: Índices apropriados e otimização
- **Complexidade**: Sistema mais complexo
  - *Mitigação*: Implementação incremental

### Riscos de Negócio
- **Resistência**: Usuários podem resistir à mudança
  - *Mitigação*: Treinamento e migração suave
- **Dados**: Risco de perda de dados na migração
  - *Mitigação*: Backup completo e testes extensivos

---

## 📋 Critérios de Aceitação Gerais

### Funcionalidade
- [ ] Operações podem ser criadas, editadas e excluídas
- [ ] Departamentos podem ser gerenciados por operação
- [ ] Configurações são independentes por departamento
- [ ] Dados CRM são segmentados corretamente
- [ ] Controle de acesso funciona adequadamente

### Performance
- [ ] Queries mantêm performance atual
- [ ] Interface responde em menos de 2 segundos
- [ ] Migração completa em menos de 30 minutos

### Segurança
- [ ] Isolamento completo entre departamentos
- [ ] Validação de acesso em todas as operações
- [ ] Logs de auditoria funcionando

### Usabilidade
- [ ] Interface intuitiva e fácil de usar
- [ ] Seletor de departamento claro
- [ ] Feedback adequado para todas as ações

---

## 📚 Documentação Necessária

### Técnica
- [ ] Documentação da API
- [ ] Guia de migração de dados
- [ ] Arquitetura do sistema
- [ ] Guia de troubleshooting

### Usuário
- [ ] Manual de uso do sistema
- [ ] Guia de configuração
- [ ] FAQ para usuários
- [ ] Vídeos de treinamento

---

**Especificação criada por:** Kiro AI  
**Data:** 10/12/2025  
**Próxima revisão:** Após aprovação dos requisitos