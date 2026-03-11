# ✅ Checklist de Implementação RLS - DataSniffer AI

## 🎯 Objetivo
Implementar Row Level Security (RLS) para isolar dados por usuário no DataSniffer AI.

---

## 📦 FASE 1: Banco de Dados (COMPLETO ✅)

- [x] Adicionar coluna `user_id UUID` em todas as tabelas
- [x] Criar índices para performance
- [x] Recriar tabela `users` referenciando `auth.users`
- [x] Habilitar RLS em todas as tabelas
- [x] Criar políticas RLS para `users`
- [x] Criar políticas RLS para `sessions`
- [x] Criar políticas RLS para `requests`
- [x] Criar políticas RLS para `crawl_logs`
- [x] Criar políticas RLS para `false_positive_rules`
- [x] Criar função `is_admin()`
- [x] Criar trigger `handle_new_user()`
- [x] Criar função `promote_user_to_admin()`
- [x] Criar função `demote_admin_to_user()`
- [x] Validar segurança com Supabase Advisor (0 problemas)
- [x] Remover tabela `users_old`

**Status:** ✅ 100% Completo

---

## 💻 FASE 2: Código Backend (PARCIAL ⏳)

### database.py - Funções Principais
- [x] `add_session()` - adicionar parâmetro `user_id`
- [x] `get_history()` - filtrar por `user_id`
- [x] `add_request()` - adicionar parâmetro `user_id`
- [x] `add_crawl_log()` - adicionar parâmetro `user_id`

### database.py - False Positive Rules
- [ ] Converter `add_false_positive_rule()` para async + `user_id`
- [ ] Converter `get_false_positive_rules()` para async + filtro
- [ ] Converter `update_false_positive_rule()` para async
- [ ] Converter `delete_false_positive_rule()` para async
- [ ] Converter `is_false_positive()` para async + `user_id`

**Referência:** Ver `backend/db/database_rls_updates.py`

### main.py - Endpoints Protegidos
- [ ] `POST /start_proxy` - adicionar `Depends(get_current_user)`
- [ ] `GET /history` - adicionar `Depends(get_current_user)`
- [ ] `POST /analyze_with_browser` - adicionar `Depends(get_current_user)`
- [ ] `POST /crawl/{session_id}` - adicionar `Depends(get_current_user)`
- [ ] `POST /false_positive_rules` - adicionar `Depends(get_current_user)`
- [ ] `GET /false_positive_rules` - adicionar `Depends(get_current_user)`
- [ ] `PUT /false_positive_rules/{rule_id}` - adicionar `Depends(get_current_user)`
- [ ] `DELETE /false_positive_rules/{rule_id}` - adicionar `Depends(get_current_user)`
- [ ] `WebSocket /ws/traffic_logs` - obter `user_id` da sessão

**Referência:** Ver `backend/MAIN_PY_RLS_UPDATES.md`

### auth.py - Limpeza
- [ ] Remover função `create_user_profile()` (não é mais necessária)
- [ ] Atualizar `sign_up()` para aguardar trigger

**Status:** ⏳ 30% Completo

---

## 👤 FASE 3: Criar Usuário Admin (PENDENTE ⏳)

- [ ] Abrir SQL Editor do Supabase
- [ ] Executar script `create_admin_user_supabase.sql`
- [ ] Trocar senha padrão por senha segura
- [ ] Verificar se usuário foi criado
- [ ] Verificar se perfil foi criado automaticamente
- [ ] Testar login com usuário admin

**Referência:** Ver `create_admin_user_supabase.sql`

**Status:** ⏳ 0% Completo

---

## 🧪 FASE 4: Testes (PENDENTE ⏳)

### Teste 1: Criar Usuários de Teste
- [ ] Criar `user1@test.com` via API signup
- [ ] Criar `user2@test.com` via API signup
- [ ] Verificar que perfis foram criados automaticamente
- [ ] Obter tokens JWT de ambos os usuários

### Teste 2: Isolamento de Dados
- [ ] User1 cria uma sessão
- [ ] User1 consegue ver sua sessão
- [ ] User2 NÃO consegue ver sessão de User1
- [ ] User2 cria sua própria sessão
- [ ] User2 vê apenas sua sessão

### Teste 3: Funcionalidade Admin
- [ ] Promover User1 a admin via SQL
- [ ] User1 (admin) consegue ver todas as sessões
- [ ] User1 (admin) consegue ver dados de User2
- [ ] User2 (user) continua vendo apenas seus dados

### Teste 4: False Positive Rules
- [ ] User1 cria uma regra de falso positivo
- [ ] User1 consegue ver sua regra
- [ ] User2 NÃO consegue ver regra de User1
- [ ] User2 cria sua própria regra
- [ ] Cada usuário vê apenas suas regras

### Teste 5: Crawling e Logs
- [ ] User1 inicia crawling
- [ ] Logs são salvos com user_id de User1
- [ ] User2 NÃO vê logs de User1
- [ ] Admin vê logs de todos os usuários

**Status:** ⏳ 0% Completo

---

## 📚 FASE 5: Documentação (COMPLETO ✅)

- [x] Criar guia de implementação completo
- [x] Criar resumo executivo
- [x] Criar checklist visual
- [x] Criar script SQL para admin
- [x] Criar guia de atualização de código
- [x] Documentar funções de database
- [x] Documentar endpoints protegidos

**Status:** ✅ 100% Completo

---

## 🚀 FASE 6: Deploy (PENDENTE ⏳)

### Preparação
- [ ] Revisar todas as mudanças de código
- [ ] Executar testes localmente
- [ ] Validar que RLS está funcionando
- [ ] Criar backup do banco de dados

### Produção
- [ ] Criar usuário admin em produção
- [ ] Atualizar variáveis de ambiente
- [ ] Deploy do backend atualizado
- [ ] Testar endpoints em produção
- [ ] Verificar isolamento de dados em produção
- [ ] Monitorar logs por 24h

**Status:** ⏳ 0% Completo

---

## 📊 PROGRESSO GERAL

```
Banco de Dados:    ████████████████████ 100% ✅
Código Backend:    ██████░░░░░░░░░░░░░░  30% ⏳
Usuário Admin:     ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Testes:            ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Documentação:      ████████████████████ 100% ✅
Deploy:            ░░░░░░░░░░░░░░░░░░░░   0% ⏳

TOTAL:             ██████████░░░░░░░░░░  50% ⏳
```

---

## 🎯 PRÓXIMA AÇÃO RECOMENDADA

1. **Atualizar False Positive Rules em database.py**
   - Copiar funções de `backend/db/database_rls_updates.py`
   - Substituir as funções antigas
   - Testar que não quebrou nada

2. **Atualizar Endpoints em main.py**
   - Seguir guia em `backend/MAIN_PY_RLS_UPDATES.md`
   - Adicionar `Depends(get_current_user)` em cada endpoint
   - Converter para async onde necessário

3. **Criar Usuário Admin**
   - Executar `create_admin_user_supabase.sql`
   - Testar login

4. **Executar Testes**
   - Criar 2 usuários de teste
   - Validar isolamento
   - Testar admin

---

## 📞 SUPORTE

**Arquivos de Referência:**
- `docs/RLS_IMPLEMENTATION_GUIDE.md` - Guia completo
- `RLS_IMPLEMENTATION_SUMMARY.md` - Resumo executivo
- `backend/db/database_rls_updates.py` - Código atualizado
- `backend/MAIN_PY_RLS_UPDATES.md` - Guia de endpoints
- `create_admin_user_supabase.sql` - Script SQL

**Supabase Project:**
- Project ID: `hqhukeywgarablshslev`
- Dashboard: https://supabase.com/dashboard/project/hqhukeywgarablshslev

---

**Última Atualização:** 2025-12-08  
**Status Geral:** 50% Completo ⏳
