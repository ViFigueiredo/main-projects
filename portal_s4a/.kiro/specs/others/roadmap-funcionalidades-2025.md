# 🚀 Roadmap de Funcionalidades 2025

**Data:** 2025-12-10  
**Status:** 📋 Planejamento Ativo  
**Versão:** 1.0

---

## 📋 Funcionalidades Solicitadas

### 🏢 **CRM - Melhorias Core**

#### 1. **Campos de Consultor e Responsável** 
**Prioridade:** 🔴 Alta  
**Complexidade:** 🟡 Média  
**Tempo:** 3-5 dias

**Descrição:**
Adicionar campos de consultor e responsável imediato nos formulários de:
- Oportunidades
- Pedidos  
- Demandas

**Especificação:**
- **Consultor:** Usuário que fez o cadastro (auto-preenchido)
- **Responsável Imediato:** Líder do consultor (baseado na hierarquia)
- **Integração:** Sistema de equipes e hierarquia existente

**Implementação:**
```typescript
// Novos campos nos schemas
consultor_id: number (FK para users)
responsavel_imediato_id: number (FK para users)

// Auto-preenchimento baseado em:
- getCurrentUser() para consultor
- getTeamLeader(consultor_id) para responsável
```

#### 2. **Fluxo de Retorno Pedidos → Oportunidades**
**Prioridade:** 🟡 Média  
**Complexidade:** 🟡 Média  
**Tempo:** 2-3 dias

**Descrição:**
Permitir devolver pedidos para a esteira de oportunidades.

**Especificação:**
- Botão "Devolver para Oportunidade" em pedidos
- Manter histórico da movimentação
- Notificar responsáveis da mudança
- Validar permissões para a ação

#### 3. **Filtros Personalizados Avançados**
**Prioridade:** 🟡 Média  
**Complexidade:** 🔴 Alta  
**Tempo:** 5-7 dias

**Descrição:**
Sistema de filtros personalizados com seleção de entidade.

**Especificação:**
- Interface drag-and-drop para criar filtros
- Salvar filtros personalizados por usuário
- Compartilhar filtros entre equipes
- Filtros por múltiplas entidades (cliente, produto, status, etc.)

#### 4. **Histórico de Transações no Cliente** ✅
**Status:** Implementado  
Nova aba no formulário de cliente mostrando histórico completo.

#### 5. **Flag "Ver Inativos"**
**Prioridade:** 🟢 Baixa  
**Complexidade:** 🟢 Baixa  
**Tempo:** 1-2 dias

**Descrição:**
Toggle para mostrar/ocultar registros inativos em todas as esteiras.

**Implementação:**
- Checkbox "Mostrar Inativos" em cada listagem
- Filtro aplicado em todas as queries
- Estado persistido por usuário

---

### 📦 **Módulo de Estoque e Cobrança** ✅
**Status:** Backend Implementado  
Sistema completo de gestão de estoque e cobrança automática.

**Próximos Passos:**
- Interface frontend
- Testes de integração
- Documentação de usuário

---

### 👥 **Gestão de Usuários e Permissões**

#### 6. **Filas por Usuário** ✅
**Status:** Implementado  
Sistema de visibilidade de filas por usuário com interface completa.

#### 7. **Múltiplos CPFs por Cliente** ✅
**Status:** Implementado  
Interface para gerenciar múltiplos CPFs por cliente.

---

### 🏢 **Módulo de Operações e Suboperações**

#### 8. **Sistema de Operações Completo**
**Prioridade:** 🔴 Alta  
**Complexidade:** 🔴 Alta  
**Tempo:** 2-3 semanas

**Descrição:**
Módulo completo de empresa, operações e suboperações com esteiras Kanban independentes.

**Especificação:**
- **Hierarquia:** Empresa → Operação → Suboperação
- **Esteiras Independentes:** Cada suboperação tem sua própria esteira
- **Cópia de Status:** Copiar status existentes para novas operações
- **Isolamento de Dados:** Dados segmentados por suboperação

**Estrutura:**
```
Empresa: Avantti
├── Operação: VIVO
│   ├── Suboperação: B2B
│   ├── Suboperação: B2C
│   └── Suboperação: Corporate
├── Operação: Claro
│   ├── Suboperação: Residencial
│   └── Suboperação: Empresarial
```

**Status:** 🚧 Especificação completa criada, aguardando implementação

---

### 🔒 **Validações e Controles de Negócio**

#### 9. **Trava de Vendas Duplicadas**
**Prioridade:** 🟡 Média  
**Complexidade:** 🟡 Média  
**Tempo:** 3-4 dias

**Descrição:**
Sistema de validação para evitar pedidos duplicados para o mesmo cliente.

**Especificação:**
- **Validação:** Verificar pedidos em andamento para mesmo cliente + segmentação
- **Prazo Configurável:** Admin define X dias de bloqueio
- **Override:** Usuários com permissão podem forçar pedido
- **Notificações:** Alertar sobre tentativas de duplicação

**Regras de Negócio:**
```typescript
// Validação antes de criar pedido
if (hasActiveOrderForSegment(clientId, productSegment, configuredDays)) {
  if (!user.permissions.includes('override_duplicate_orders')) {
    throw new Error('Cliente já possui pedido ativo para esta segmentação');
  }
  // Log da ação de override
  logOverrideAction(userId, clientId, reason);
}
```

#### 10. **Tratamento de Erros Avançado**
**Prioridade:** 🟡 Média  
**Complexidade:** 🟡 Média  
**Tempo:** 2-3 dias

**Descrição:**
Sistema robusto de tratamento e logging de erros.

**Implementação:**
- Error boundaries em React
- Logging centralizado
- Notificações de erro para usuários
- Retry automático para falhas temporárias

---

## 📊 Priorização e Timeline

### **Sprint 1 (2 semanas) - Melhorias CRM Core**
1. ✅ Histórico de Transações (Concluído)
2. ✅ Múltiplos CPFs (Concluído)  
3. ✅ Filas por Usuário (Concluído)
4. 🚧 Campos Consultor/Responsável
5. 🚧 Flag "Ver Inativos"

### **Sprint 2 (2 semanas) - Validações e Controles**
1. 🚧 Trava de Vendas Duplicadas
2. 🚧 Tratamento de Erros
3. 🚧 Fluxo de Retorno Pedidos→Oportunidades

### **Sprint 3 (3 semanas) - Operações e Suboperações**
1. 🚧 Implementação do módulo completo
2. 🚧 Interface de gestão
3. 🚧 Migração de dados existentes

### **Sprint 4 (2 semanas) - Estoque e Filtros**
1. 🚧 Interface do módulo de estoque
2. 🚧 Sistema de filtros personalizados
3. 🚧 Testes e refinamentos

---

## 🎯 Critérios de Sucesso

### **Funcionalidades Core**
- [ ] Campos consultor/responsável funcionando
- [ ] Fluxo de retorno implementado
- [ ] Validações de negócio ativas
- [ ] Sistema de operações operacional

### **Qualidade**
- [ ] Cobertura de testes > 80%
- [ ] Performance mantida
- [ ] Documentação completa
- [ ] Treinamento de usuários realizado

### **Negócio**
- [ ] Redução de pedidos duplicados
- [ ] Melhoria na gestão de esteiras
- [ ] Maior controle sobre operações
- [ ] Satisfação dos usuários

---

## 🔄 Dependências e Riscos

### **Dependências Técnicas**
- Sistema de hierarquia de equipes (existente)
- Permissões granulares (existente)
- Sistema de notificações (existente)

### **Riscos Identificados**
- **Alto:** Complexidade do módulo de operações
- **Médio:** Migração de dados existentes
- **Baixo:** Integração com sistemas existentes

### **Mitigações**
- Implementação incremental
- Testes extensivos em ambiente de desenvolvimento
- Backup completo antes de migrações
- Rollback plan para cada funcionalidade

---

## 📝 Próximos Passos Imediatos

### **Esta Semana**
1. Finalizar especificação detalhada de consultor/responsável
2. Criar mockups para filtros personalizados
3. Definir estrutura de dados para operações

### **Próxima Semana**
1. Implementar campos consultor/responsável
2. Criar interface para flag "ver inativos"
3. Iniciar desenvolvimento da trava de vendas

### **Mês Atual**
1. Completar melhorias CRM core
2. Iniciar módulo de operações
3. Planejar interface do estoque

---

**Roadmap mantido por:** Equipe de Desenvolvimento  
**Última revisão:** 2025-12-10  
**Próxima revisão:** 2025-12-17