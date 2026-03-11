# Módulo: Carteira de Clientes (CRM)

## 📋 Visão Geral

O módulo **Carteira de Clientes** dentro do CRM oferece gerenciamento completo de dados de clientes com foco em informações essenciais para **financeiro**, **contabilidade** e **tomada de decisão executiva**.

## 🎯 Objetivo

Centralizar e organizar informações de clientes para:

- Avaliação de risco de crédito
- Acompanhamento de contratos e negócios
- Gestão de prazos de pagamento e limites de crédito
- Histórico de relacionamento comercial

## 📁 Estrutura de Arquivos

### Banco de Dados

- `src/lib/db.ts` → Tabela `client_portfolio` com índices

### Schemas & Tipos

- `src/lib/schemas/client-portfolio.ts` → Zod schemas e tipos TypeScript

### Server Actions (CRUD)

- `src/lib/actions/client-portfolio.actions.ts` → Funções de servidor para operações de dados

### Componentes UI

- `src/components/crm/client-portfolio-form.tsx` → Formulário com 4 abas (Básico, Contatos, Financeiro, Detalhes)
- `src/components/crm/clients-table.tsx` → Tabela com listagem de clientes
- `src/components/crm/client-filters.tsx` → Filtros por status, risco e busca
- `src/components/crm/client-view-modal.tsx` → Modal de visualização de cliente
- `src/components/crm/client-portfolio-page-client.tsx` → Orquestrador principal (Client Component)
- `src/components/crm/index.ts` → Exports

### Página

- `src/app/crm/clients/page.tsx` → Página principal da carteira de clientes

## 📊 Campos do Cliente

### 1. **Dados Básicos**

- Nome da Empresa *
- Nome Fantasia
- CNPJ (14 dígitos)
- CPF (11 dígitos)
- Indústria
- Status (ativo | inativo | suspenso | prospect) *
- Classificação de Risco (baixo | médio | alto | muito_alto) *

### 2. **Contatos Principais**

- Nome do Contato
- Cargo
- Email
- Telefone

### 3. **Contatos Financeiro/Administrativo**

- Nome
- Email
- Telefone

### 4. **Dados Financeiros**

- Limite de Crédito (R$)
- Gasto Médio Mensal (R$)
- Prazo de Pagamento * (à vista | 30 dias | 60 dias | 90 dias | personalizado)
- Histórico de Pagamento (texto descritivo)

### 5. **Detalhes & Endereço**

- Endereço
- CEP
- Cidade
- Estado
- Website

### 6. **Dados de Contrato**

- Data do Contrato
- Valor do Contrato (R$)
- Duração do Contrato (dias)
- Observações

## 🔧 Server Actions Disponíveis

```typescript
// Buscar clientes com filtros opcionais
fetchClients(filters?: {
  status?: string;
  riskClassification?: string;
  searchTerm?: string
}): Promise<ClientPortfolio[]>

// Buscar cliente por ID
fetchClientById(id: number): Promise<ClientPortfolio | null>

// Criar novo cliente
createClient(data: ClientPortfolioFormValues): Promise<{ success, id?, error? }>

// Atualizar cliente existente
updateClient(id: number, data: Partial<ClientPortfolioFormValues>): Promise<{ success, error? }>

// Deletar cliente
deleteClient(id: number): Promise<{ success, error? }>
```

## 🎨 Componentes Principais

### ClientPortfolioForm

- Formulário com 4 abas (Básico, Contatos, Financeiro, Detalhes)
- Validação com Zod
- Suporta criar novo cliente ou editar existente
- Callback `onSuccess` para refresh de dados

### ClientsTable

- Exibe lista de clientes em tabela
- Badges para status (cores) e classificação de risco
- Menu dropdown com ações (Visualizar, Editar, Deletar)
- Confirmação de exclusão com AlertDialog

### ClientFilters

- Busca por nome, CNPJ, email
- Filtro por status
- Filtro por classificação de risco
- Botão "Limpar Filtros"

### ClientViewModal

- Modal de visualização somente leitura
- Mesmas 4 abas do formulário
- Links clicáveis em emails e telefones

### ClientPortfolioPageClient

- Orquestrador principal (Client Component)
- Gerencia estado de clientes, filtros e modais
- Integra todos os componentes

## 🚀 Como Usar

### Acessar o Módulo

```
http://localhost:3000/crm/clients
```

### Criar Novo Cliente

1. Clique em "Novo Cliente"
2. Preencha os dados básicos (obrigatórios: nome, status, risco, prazo)
3. Navegue pelas abas para completar informações
4. Clique em "Criar Cliente"

### Editar Cliente

1. Na tabela, clique em "..." (menu)
2. Selecione "Editar"
3. Modifique os dados desejados
4. Clique em "Atualizar Cliente"

### Visualizar Cliente

1. Na tabela, clique em "..." (menu)
2. Selecione "Visualizar"
3. Consulte todas as informações em modo leitura

### Deletar Cliente

1. Na tabela, clique em "..." (menu)
2. Selecione "Deletar"
3. Confirme a exclusão

### Filtrar Clientes

- Use a barra de busca para procurar por nome, CNPJ ou email
- Selecione status ou classificação de risco
- Clique "Limpar Filtros" para resetar

## 📈 Índices de Banco de Dados

Para otimizar performance, os seguintes índices foram criados:

```sql
CREATE INDEX idx_client_portfolio_cnpj ON client_portfolio(cnpj);
CREATE INDEX idx_client_portfolio_status ON client_portfolio(status);
CREATE INDEX idx_client_portfolio_risk ON client_portfolio(risk_classification);
CREATE INDEX idx_client_portfolio_created ON client_portfolio(created_at DESC);
```

## ✅ Validações

- **Nome da Empresa**: mínimo 3 caracteres
- **CNPJ**: exatamente 14 dígitos numéricos (opcional)
- **CPF**: exatamente 11 dígitos numéricos (opcional)
- **Email**: formato válido de email
- **Números decimais**: limite de crédito, gasto mensal, valor de contrato
- **Status obrigatório**: ativo | inativo | suspenso | prospect
- **Risco obrigatório**: baixo | médio | alto | muito_alto
- **Prazo obrigatório**: à_vista | 30_dias | 60_dias | 90_dias | personalizado

## 🔐 Segurança

- Todas as ações são Server Actions (backend)
- Validação com Zod em tempo de criação/atualização
- Proteção contra SQL injection via prepared statements
- Tratamento de erros e feedback ao usuário

## 📝 Próximas Melhorias

- [ ] Histórico de alterações (audit log)
- [ ] Atachamento de documentos (RG, CNPJ)
- [ ] Relacionamento com contratos/pedidos
- [ ] Dashboard com métricas por classificação de risco
- [ ] Integração com sistema de cobrança
- [ ] Exportação de relatórios (CSV, PDF)
- [ ] Importação em lote via CSV

---

**Módulo criado em**: November 2024  
**Linguagem**: TypeScript + React + Next.js 15  
**Framework UI**: Shadcn/UI + Tailwind CSS