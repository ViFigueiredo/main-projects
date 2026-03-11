# 📋 Guia de Continuação - Importação em Massa

**Data:** 2026-01-19  
**Status Atual:** ✅ Dados críticos preservados - Importação parcial concluída  
**Próximo Passo:** Continuar importação dos funcionários restantes

---

## 🎯 SITUAÇÃO ATUAL

### ✅ DADOS CRÍTICOS JÁ PRESERVADOS
- **Josué Aminadalbe De Araujo** (ID: 353) ✅ PRESERVADO
- **Aviso Prévio Trabalhado** (Occurrence ID: 32) ✅ PRESERVADO
- **Data:** 2026-01-16T16:38:37.115Z ✅ CORRETA
- **Tenancy EDF:** company_id = 1 ✅ FUNCIONAL

### 📊 DADOS ATUAIS
- **Funcionários EDF:** 7 de 174 (4% importado)
- **Ocorrências EDF:** 5 de 31 (16% importado)
- **Clientes EDF:** 0 de 1 (0% importado)

---

## 🚀 COMO CONTINUAR A IMPORTAÇÃO

### Opção 1: Via Neon Power (Recomendado)

```bash
# 1. Ativar Neon Power
# Use o comando: activate neon

# 2. Executar importação em lotes
# Use o arquivo: scripts/import-remaining-data.sql
# Executar via: mcp_power_neon_Neon_run_sql_transaction

# 3. Verificar progresso
SELECT COUNT(*) FROM employees WHERE company_id = 1;
SELECT COUNT(*) FROM occurrences WHERE company_id = 1;
```

### Opção 2: Via Script Node.js

```bash
# 1. Corrigir credenciais no script
# Editar: scripts/bulk-import-final.js
# Usar a DATABASE_URL correta do .env.local

# 2. Executar script
node scripts/bulk-import-final.js

# 3. Verificar resultado
```

### Opção 3: Via Interface Web (Manual)

```bash
# 1. Usar o sistema de importação do Portal S4A
# 2. Carregar arquivo CSV/Excel com funcionários
# 3. Mapear campos corretamente
# 4. Definir company_id = 1 (EDF)
```

---

## 📁 ARQUIVOS IMPORTANTES

### Scripts Prontos
- `scripts/import-remaining-data.sql` - **174 funcionários + 27 ocorrências + 1 cliente**
- `scripts/import-remaining-data-bulk.js` - Gerador do SQL
- `scripts/bulk-import-final.js` - Executor Node.js (precisa correção de credenciais)

### Backups Originais
- `backups/2026-01-18/neon-production-2026-01-18T20-10-35Z-data.sql` - Dados completos
- `backups/2026-01-18/neon-production-2026-01-18T20-10-35Z-schema.sql` - Schema
- `backup-analysis-summary.md` - Análise dos backups

### Documentação
- `IMPORT_COMPLETION_SUMMARY.md` - Status atual detalhado
- `BULK_IMPORT_CONTINUATION_GUIDE.md` - Este guia

---

## ⚡ EXECUÇÃO RÁPIDA (RECOMENDADO)

### Passo 1: Verificar Estado Atual
```sql
-- Via Neon Power
SELECT 
  'employees' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN company_id = 1 THEN 1 END) as edf_count
FROM employees
UNION ALL
SELECT 
  'occurrences' as table_name,
  COUNT(*) as total,
  COUNT(CASE WHEN company_id = 1 THEN 1 END) as edf_count
FROM occurrences;
```

### Passo 2: Executar Importação em Lotes
```sql
-- Exemplo de lote (5 funcionários por vez)
-- Copiar do arquivo: scripts/import-remaining-data.sql
-- Executar via: mcp_power_neon_Neon_run_sql_transaction

INSERT INTO employees (company_id, id, name, ...) VALUES 
(1, 386, 'Izabela Thamires da Silva', ...),
(1, 393, 'Vanessa dos Santos Souza', ...),
(1, 399, 'Fabiola Maria de Sena', ...),
(1, 385, 'Gustavo Arlan Tavares', ...),
(1, 391, 'Jane Wilma Ferreira dos Santos', ...)
ON CONFLICT (id) DO UPDATE SET company_id = EXCLUDED.company_id, name = EXCLUDED.name;
```

### Passo 3: Verificar Progresso
```sql
-- Verificar se Josué ainda está preservado
SELECT id, name FROM employees 
WHERE name ILIKE '%josué%' AND company_id = 1;

-- Verificar total importado
SELECT COUNT(*) as total_employees FROM employees WHERE company_id = 1;
```

---

## 🔍 VERIFICAÇÕES CRÍTICAS

### Antes de Continuar
- [ ] Confirmar que Josué (ID: 353) ainda existe
- [ ] Confirmar que Aviso Prévio (ID: 32) ainda existe
- [ ] Verificar que company_id = 1 em todos os registros EDF

### Durante a Importação
- [ ] Executar em lotes pequenos (5-10 registros)
- [ ] Verificar erros após cada lote
- [ ] Monitorar se dados críticos permanecem intactos

### Após Completar
- [ ] Verificar total: 174 funcionários EDF
- [ ] Verificar total: 31 ocorrências EDF
- [ ] Verificar total: 1 cliente EDF
- [ ] Testar acesso via interface web

---

## 🚨 PONTOS DE ATENÇÃO

### ⚠️ CRÍTICO - NÃO PERDER
- **Josué Aminadalbe De Araujo** (ID: 353)
- **Aviso Prévio Trabalhado** (Occurrence ID: 32)
- **Data:** 2026-01-16T16:38:37.115Z

### ⚠️ CUIDADOS
- Sempre usar `company_id = 1` para dados EDF
- Usar `ON CONFLICT (id) DO UPDATE` para evitar duplicatas
- Executar em lotes pequenos para evitar timeouts
- Fazer backup antes de grandes importações

### ⚠️ ROLLBACK (Se Necessário)
```sql
-- Em caso de problemas, remover dados importados incorretamente
DELETE FROM employees WHERE company_id = 1 AND id > 353;
DELETE FROM occurrences WHERE company_id = 1 AND id > 32;

-- Manter apenas os dados críticos já preservados
```

---

## 📞 COMANDOS ÚTEIS

### Verificar Estado
```bash
# Via Neon Power
SELECT 'Josué Status', COUNT(*) FROM employees WHERE name ILIKE '%josué%' AND company_id = 1;
SELECT 'Aviso Prévio Status', COUNT(*) FROM occurrences WHERE type = 'aviso' AND company_id = 1;
```

### Gerar Estatísticas
```bash
# Progresso da importação
SELECT 
  ROUND((COUNT(*) * 100.0 / 174), 2) as percent_complete,
  COUNT(*) as imported,
  174 as total_expected
FROM employees WHERE company_id = 1;
```

### Atualizar Sequences (Após Importação)
```sql
SELECT setval('employees_id_seq', COALESCE((SELECT MAX(id) FROM employees), 1));
SELECT setval('occurrences_id_seq', COALESCE((SELECT MAX(id) FROM occurrences), 1));
SELECT setval('client_portfolio_id_seq', COALESCE((SELECT MAX(id) FROM client_portfolio), 1));
```

---

## 🎯 META FINAL

### Objetivo
- **174 funcionários** EDF importados
- **31 ocorrências** EDF importadas  
- **1 cliente** EDF importado
- **Josué e Aviso Prévio** preservados
- **Sistema 100% funcional**

### Tempo Estimado
- **Via Neon Power:** 2-3 horas (lotes manuais)
- **Via Script:** 30 minutos (se credenciais corretas)
- **Via Interface:** 4-6 horas (manual)

---

**Criado por:** Kiro AI  
**Data:** 2026-01-19  
**Status:** ✅ Dados críticos seguros - Pronto para continuação