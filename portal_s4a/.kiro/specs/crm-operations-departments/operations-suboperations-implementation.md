# Implementação: Sistema de Operações e Suboperações

**Data:** 09/12/2025  
**Status:** Planejamento  
**Objetivo:** Segmentar o CRM por Operações (VIVO, Claro, TIM) e Suboperações (B2B, B2C, Corporate)

---

## 1. VISÃO GERAL

### 1.1 Problema Atual
- Todos os produtos, status, clientes e oportunidades são compartilhados
- Não há como separar vendas por "linha de negócio"
- Relatórios não podem ser segmentados
- Dificulta gestão de múltiplas operações comerciais

### 1.2 Solução Proposta
Criar hierarquia: **Operação → Suboperação → Dados CRM**

Exemplo:
```
VIVO
├── B2B
│   ├── Produtos específicos
│   ├── Status específicos
│   └── Clientes B2B
├── B2C
│   ├── Produtos específicos
│   ├── Status específicos
│   └── Clientes B2C
└── Corporate
    └── ...

Claro
├── B2B
└── B2C
```

---

## 2. ESTRUTURA DO BANCO DE DADOS

### 2.1 Novas Tabelas

Veja o arquivo: `src/lib/migrations/003_operations_suboperations.sql`

---

## 3. MIGRATION SQL

Arquivo criado: `src/lib/migrations/003_operations_suboperations.sql`

---

## 4. PRÓXIMOS PASSOS

### Fase 1: Database ✅
- [ ] Executar migration SQL
- [ ] Criar operação "Padrão"
- [ ] Migrar dados existentes

### Fase 2: Backend
- [ ] Atualizar schemas Zod
- [ ] Criar actions para operations/suboperations
- [ ] Modificar queries existentes

### Fase 3: Frontend
- [ ] Criar seletor de operação/suboperação
- [ ] Criar tela de gerenciamento
- [ ] Atualizar formulários

---

**Próximo arquivo:** `src/lib/migrations/003_operations_suboperations.sql`