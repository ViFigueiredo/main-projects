# ✅ Atualização: Regras de Documentação

## 📋 Resumo

Atualizadas as regras de documentação para garantir que toda mudança no projeto seja devidamente documentada.

## 🎯 Novas Regras Obrigatórias

### 1. Correções e Fixes → `docs/fixes/`

**SEMPRE** criar documentação em `docs/fixes/` quando:
- ✅ Corrigir bugs ou erros
- ✅ Resolver problemas de integração
- ✅ Aplicar hotfixes
- ✅ Solucionar erros de configuração

**Nomenclatura**:
- `FIX_*.md` - Correções específicas
- `SOLUCAO_*.md` - Soluções completas
- `CORRECAO_*.md` - Correções gerais

**Passos**:
1. Criar arquivo em `docs/fixes/`
2. Seguir template de fix
3. Atualizar `docs/fixes/README.md`
4. Commit: `fix: descrição`

### 2. Documentação Geral → `docs/`

**SEMPRE** criar em `docs/` quando:
- ✅ Adicionar novas funcionalidades (guias)
- ✅ Criar processos novos (guias técnicos)
- ✅ Documentar configuração (setup guides)
- ✅ Escrever tutoriais

**Nomenclatura**:
- `*_GUIDE.md` - Guias técnicos
- `*_SETUP.md` - Guias de configuração
- `COMO_*.md` - Tutoriais

### 3. Atualização de Estrutura → `components.json`

**SEMPRE** atualizar `components.json` quando:

| Mudança | Seção a Atualizar | Obrigatório |
|---------|-------------------|-------------|
| Adicionar/remover biblioteca | `dependencies` | ✅ SIM |
| Adicionar/remover componente | `structure` | ✅ SIM |
| Adicionar/remover endpoint | `api.endpoints` | ✅ SIM |
| Adicionar/remover tabela | `database.tables` | ✅ SIM |
| Adicionar variável de ambiente | `environment` | ✅ SIM |
| Mudar tecnologia | `dependencies` + README | ✅ SIM |

### 4. Atualização de Arquitetura → `README.md`

**SEMPRE** atualizar `README.md` quando:
- ✅ Mudar arquitetura do sistema
- ✅ Adicionar/remover camadas
- ✅ Mudar fluxo de dados
- ✅ Alterar stack tecnológico principal

## 📝 Template de Fix

```markdown
# Título do Fix

## Problema
Descrição clara do problema

## Causa Raiz
O que causou o problema

## Solução Aplicada
O que foi feito para resolver

## Como Testar
Passos para verificar a correção

## Arquivos Modificados
Lista de arquivos alterados

## Status
✅ Resolvido / 🔄 Em andamento
```

## 🔄 Workflow de Documentação

```
Mudança no Código
       ↓
   É um fix?
       ↓
   Sim → docs/fixes/FIX_*.md
       ↓
   Não → Mudou estrutura?
       ↓
   Sim → components.json
       ↓
   Não → Mudou arquitetura?
       ↓
   Sim → README.md + components.json
       ↓
   Não → Apenas código
```

## ✅ Checklist Antes de Commit

```bash
# Verificar documentação necessária
[ ] É um fix? → Criar docs/fixes/FIX_*.md
[ ] Adicionou biblioteca? → Atualizar components.json
[ ] Mudou estrutura? → Atualizar components.json
[ ] Adicionou endpoint? → Atualizar components.json
[ ] Mudou arquitetura? → Atualizar README.md
[ ] Adicionou env var? → Atualizar .env.example + components.json
[ ] Adicionou tabela? → Atualizar components.json
```

## 📚 Exemplos Práticos

### Exemplo 1: Adicionar Biblioteca

```bash
# 1. Instalar biblioteca
pip install httpx

# 2. Atualizar components.json
# Adicionar em backend.dependencies.http: ["httpx"]

# 3. Commit
git add components.json requirements.txt
git commit -m "feat: adicionar httpx para requisições HTTP"
```

### Exemplo 2: Corrigir Bug

```bash
# 1. Corrigir código
# Editar arquivo com correção

# 2. Criar documentação
# Criar docs/fixes/FIX_NOME_DO_BUG.md

# 3. Atualizar índice
# Adicionar entrada em docs/fixes/README.md

# 4. Commit
git add . 
git commit -m "fix: corrigir erro X no componente Y"
```

### Exemplo 3: Adicionar Endpoint

```bash
# 1. Criar endpoint
# Adicionar em backend/main.py

# 2. Atualizar components.json
# Adicionar em api.endpoints.authenticated: ["GET /new-endpoint"]

# 3. Commit
git add backend/main.py components.json
git commit -m "feat: adicionar endpoint /new-endpoint"
```

### Exemplo 4: Adicionar Tabela no Banco

```bash
# 1. Criar tabela no Supabase
# Executar SQL no Supabase

# 2. Atualizar components.json
# Adicionar em database.tables

# 3. Commit
git add components.json
git commit -m "feat: adicionar tabela new_table"
```

## 🎯 Benefícios

### Para Desenvolvedores
- ✅ Histórico completo de mudanças
- ✅ Fácil encontrar soluções para problemas
- ✅ Entender evolução do projeto

### Para LLMs
- ✅ Contexto sempre atualizado
- ✅ Estrutura clara e consistente
- ✅ Exemplos de soluções anteriores

### Para Manutenção
- ✅ Documentação sempre sincronizada
- ✅ Rastreabilidade de mudanças
- ✅ Facilita onboarding

## 📊 Arquivos Atualizados

1. ✅ `AI_RULES.md` - Adicionada seção 7 (Documentação) e 11 (Manutenção)
2. ✅ `.kiro/CONTEXT.md` - Adicionada seção de Regras de Documentação
3. ✅ `docs/ATUALIZACAO_REGRAS_DOCUMENTACAO.md` - Este arquivo

## 🔗 Referências

- **AI_RULES.md**: Seção 7 (Documentação) e 11 (Manutenção de Documentação)
- **components.json**: Estrutura completa do projeto
- **docs/fixes/README.md**: Índice de todos os fixes
- **.kiro/CONTEXT.md**: Contexto rápido para LLMs

## ✅ Status

**Implementado**: 2025-12-08  
**Versão**: 1.1.0  
**Impacto**: Alto (melhora rastreabilidade e manutenção)

---

**Próximos passos**: Seguir as novas regras em todas as mudanças futuras
