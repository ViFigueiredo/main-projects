# 🔄 Workflow Prático: Branches Neon

**Data:** 10/12/2025  
**Projeto:** Portal_Avantti  
**Objetivo:** Guia prático para gerenciar branches production e develop

---

## 📊 ESTRUTURA ATUAL

```
✱ production (br-bold-cloud-ad7sd46x) ← PRODUÇÃO (Default)
  └── develop (br-icy-rice-adtsevxz) ← DESENVOLVIMENTO
```

### Connection Strings

#### 🔴 PRODUCTION (Vercel)
```
postgresql://neondb_owner:npg_8UYDu9EoflOb@ep-super-cake-ad2s6vvq.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require&channel_binding=require
```

#### 🟡 DEVELOP (Local)
```
postgresql://neondb_owner:npg_8UYDu9EoflOb@ep-wandering-sound-adjhvpu2.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require&channel_binding=require
```

---

## ⚠️ CONCEITO IMPORTANTE

### Branches são INDEPENDENTES após criação:
- ✅ `develop` foi criada como **cópia** de `production`
- ❌ `develop` **NÃO se atualiza** automaticamente
- ❌ Mudanças em `production` **NÃO afetam** `develop`
- ❌ Mudanças em `develop` **NÃO afetam** `production`

### Sincronização é MANUAL:
- 🔄 Você decide quando sincronizar
- 🔄 Você escolhe a direção (production → develop ou develop → production)
- 🔄 Sempre fazer backup antes de mudanças importantes

---

## 🎯 CENÁRIOS PRÁTICOS

### Cenário 1: 📈 Produção recebeu dados novos
**Situação:** Usuários cadastraram clientes, fizeram vendas, etc. em produção

**Problema:** Develop não tem esses dados novos

**Solução:** Atualizar develop com dados de production
```bash
# Sincronizar develop com production (perde dados de develop)
neonctl branches restore develop production --project-id restless-morning-33051903

# OU recriar develop (mesmo resultado)
neonctl branches delete develop --project-id restless-morning-33051903
neonctl branches create --name develop --parent production --project-id restless-morning-33051903
```

**Quando usar:** Semanalmente ou quando precisar dos dados novos para testar

---

### Cenário 2: 🚀 Desenvolveu algo em develop
**Situação:** Você criou uma nova funcionalidade em develop e quer colocar em produção

**Problema:** Production não tem as novas funcionalidades

**Solução:** Aplicar develop em production
```bash
# 1. SEMPRE fazer backup de production primeiro
neonctl branches create --name production-backup-$(date +%Y%m%d-%H%M) \
  --parent production --project-id restless-morning-33051903

# 2. Aplicar develop em production
neonctl branches restore production develop --project-id restless-morning-33051903

# 3. Recriar develop baseado na nova production
neonctl branches delete develop --project-id restless-morning-33051903
neonctl branches create --name develop --parent production --project-id restless-morning-33051903
```

**Quando usar:** Quando uma funcionalidade está pronta para produção

---

### Cenário 3: 🔍 Ver diferenças entre branches
**Situação:** Quer saber o que mudou entre develop e production

**Solução:** Comparar schemas
```bash
# Ver diferenças de schema
neonctl branches schema-diff develop production --project-id restless-morning-33051903

# Ver diferenças de dados (não disponível via CLI)
# Use a interface web: Schema diff
```

**Quando usar:** Antes de fazer merge ou para auditoria

---

### Cenário 4: 🆘 Rollback de produção
**Situação:** Algo deu errado em produção após deploy

**Solução:** Restaurar backup
```bash
# Listar backups disponíveis
neonctl branches list --project-id restless-morning-33051903

# Restaurar production com backup
neonctl branches restore production production-backup-YYYYMMDD-HHMM \
  --project-id restless-morning-33051903
```

**Quando usar:** Emergências em produção

---

### Cenário 5: 🧪 Testar com dados de produção
**Situação:** Quer testar uma funcionalidade com dados reais

**Solução:** Criar branch temporária
```bash
# Criar branch de teste com dados de production
neonctl branches create --name test-feature-x --parent production \
  --project-id restless-morning-33051903

# Obter connection string
neonctl connection-string test-feature-x --role-name neondb_owner \
  --project-id restless-morning-33051903

# Após testes, deletar
neonctl branches delete test-feature-x --project-id restless-morning-33051903
```

**Quando usar:** Testes específicos com dados reais

---

## 📅 ROTINA RECOMENDADA

### Diariamente:
- ✅ Desenvolver em `develop`
- ✅ Testar em `develop`
- ✅ Commit/push código

### Semanalmente:
- 🔄 Sincronizar `develop` com `production` (pegar dados novos)
- 📊 Revisar diferenças de schema
- 🧹 Limpar branches antigas de teste

### Quando deploy:
- 💾 Backup de `production`
- 🚀 Aplicar `develop` em `production`
- 🔄 Recriar `develop` baseado em `production`
- ✅ Testar produção
- 📝 Documentar mudanças

---

## 🛠️ COMANDOS ÚTEIS

### Variáveis (copie no início)
```bash
PROJECT_ID="restless-morning-33051903"
```

### Listar branches
```bash
neonctl branches list --project-id $PROJECT_ID
```

### Ver detalhes de uma branch
```bash
neonctl branches get production --project-id $PROJECT_ID
neonctl branches get develop --project-id $PROJECT_ID
```

### Obter connection strings
```bash
# Production
neonctl connection-string production --role-name neondb_owner --project-id $PROJECT_ID

# Develop
neonctl connection-string develop --role-name neondb_owner --project-id $PROJECT_ID
```

### Backup rápido
```bash
# Backup de production
neonctl branches create --name production-backup-$(date +%Y%m%d-%H%M) \
  --parent production --project-id $PROJECT_ID

# Backup de develop
neonctl branches create --name develop-backup-$(date +%Y%m%d-%H%M) \
  --parent develop --project-id $PROJECT_ID
```

### Sincronização rápida
```bash
# Production → Develop (pegar dados novos)
neonctl branches restore develop production --project-id $PROJECT_ID

# Develop → Production (deploy)
neonctl branches create --name production-backup-$(date +%Y%m%d-%H%M) \
  --parent production --project-id $PROJECT_ID
neonctl branches restore production develop --project-id $PROJECT_ID
```

---

## 🚨 REGRAS DE OURO

### ❌ NUNCA faça:
- Desenvolver diretamente em `production`
- Restaurar `production` sem backup
- Deletar `production` por engano
- Usar dados de `develop` em produção

### ✅ SEMPRE faça:
- Backup antes de mudanças em `production`
- Teste em `develop` antes de deploy
- Documente mudanças importantes
- Mantenha `develop` atualizado com dados de `production`

### 🔄 Lembre-se:
- Branches são independentes
- Sincronização é manual
- Backups são essenciais
- Teste antes de deploy

---

## 📊 MONITORAMENTO

### Métricas importantes:
- **Tamanho das branches** (Storage)
- **Compute usage** (CU-hrs)
- **Frequência de backups**
- **Tempo desde última sincronização**

### Alertas recomendados:
- Branch `develop` muito desatualizada (>7 dias)
- Muitos backups acumulados (>10)
- Uso de compute muito alto
- Branches de teste esquecidas

---

## 🔗 LINKS ÚTEIS

### Neon
- **Console:** https://console.neon.tech/app/projects/restless-morning-33051903
- **Docs:** https://neon.tech/docs/manage/branches
- **CLI Docs:** https://neon.tech/docs/reference/neon-cli

### Comandos rápidos
```bash
# Ver este projeto
neonctl projects list

# Ver branches
neonctl branches list --project-id restless-morning-33051903

# Ajuda
neonctl branches --help
```

---

## 📝 CHANGELOG

### 10/12/2025
- ✅ Estrutura inicial criada
- ✅ Production = br-bold-cloud-ad7sd46x (com dados)
- ✅ Develop = br-icy-rice-adtsevxz (baseado em production)
- ✅ Workflow estabelecido

### Próximas melhorias:
- [ ] Script automatizado de deploy
- [ ] Monitoramento de sincronização
- [ ] Alertas de backup
- [ ] Dashboard de métricas

---

**Documento criado por:** Kiro AI  
**Data:** 10/12/2025  
**Última atualização:** 10/12/2025  
**Versão:** 1.0