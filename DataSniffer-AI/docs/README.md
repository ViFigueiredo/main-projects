# 📚 Documentação - DataSniffer AI

Bem-vindo à documentação completa do DataSniffer AI!

## 🗺️ Mapa da Documentação

### 🚀 Começando

| Documento | Descrição | Tempo |
|-----------|-----------|-------|
| [QUICK_START.md](QUICK_START.md) | Guia rápido de instalação e primeiro uso | 5-10 min |
| [../README.md](../README.md) | Visão geral completa do projeto | 15 min |
| [../components.json](../components.json) | Estrutura técnica detalhada | Referência |
| [../AI_RULES.md](../AI_RULES.md) | Regras para desenvolvimento com IA | Referência |

### 🔧 Guias Técnicos

#### Autenticação e Segurança
- [SUPABASE_CONFIG_GUIDE.md](SUPABASE_CONFIG_GUIDE.md) - Configuração do Supabase
- [RLS_IMPLEMENTATION_GUIDE.md](RLS_IMPLEMENTATION_GUIDE.md) - Row Level Security
- [BACKEND_AUTH_SETUP.md](BACKEND_AUTH_SETUP.md) - Setup de autenticação no backend

#### Desenvolvimento
- [COMO_FUNCIONA.md](COMO_FUNCIONA.md) - Como o sistema funciona
- [DOCUMENTACAO_TECNICA.md](DOCUMENTACAO_TECNICA.md) - Documentação técnica detalhada
- [SAST_INTEGRATION.md](SAST_INTEGRATION.md) - Integração com SAST (Bandit)
- [BANDIT_GUIDE.md](BANDIT_GUIDE.md) - Guia do Bandit

#### Deploy e DevOps
- [DOCKER_AND_GHCR_GUIDE.md](DOCKER_AND_GHCR_GUIDE.md) - Docker e GitHub Container Registry
- [QUICK_TEST_GUIDE.md](QUICK_TEST_GUIDE.md) - Guia de testes rápidos

### 🔨 Correções e Soluções

Documentos de correções importantes estão em [fixes/](fixes/):

#### Autenticação
- [SOLUCAO_401_COMPLETA.md](fixes/SOLUCAO_401_COMPLETA.md) - Solução completa para erro 401
- [FIX_JWT_ERROR.md](fixes/FIX_JWT_ERROR.md) - Correção de erros JWT
- [AUTH_FIX.md](fixes/AUTH_FIX.md) - Correções gerais de autenticação

#### Banco de Dados
- [FIX_ASYNCPG_ERROR.md](fixes/FIX_ASYNCPG_ERROR.md) - Correção erro asyncpg (REST API only)
- [SOLUCAO_FINAL_APENAS_REST_API.md](fixes/SOLUCAO_FINAL_APENAS_REST_API.md) - Migração para REST API
- [PROBLEMA_CONEXAO_SUPABASE.md](fixes/PROBLEMA_CONEXAO_SUPABASE.md) - Problemas de conexão

#### Frontend
- [FRONTEND_BACKEND_INTEGRATION.md](fixes/FRONTEND_BACKEND_INTEGRATION.md) - Integração frontend-backend
- [CAPTCHA_LOCALHOST_FIX.md](fixes/CAPTCHA_LOCALHOST_FIX.md) - Desabilitar CAPTCHA em localhost

#### Implementação
- [RLS_IMPLEMENTATION_COMPLETE.md](fixes/RLS_IMPLEMENTATION_COMPLETE.md) - Implementação completa de RLS
- [IMPLEMENTATION_COMPLETE_FINAL.md](fixes/IMPLEMENTATION_COMPLETE_FINAL.md) - Implementação final

### 📖 Referências Rápidas

#### Usuários de Teste
```
Admin:
  Email: admin@datasniffer.ai
  Senha: DataSniffer2025!Admin
  Role: admin

User1:
  Email: user1@test.com
  Senha: test123
  Role: user

User2:
  Email: user2@test.com
  Senha: test123
  Role: user
```

#### Variáveis de Ambiente
```bash
# Obrigatórias
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
JWT_SECRET=datasniffer-secret-key-change-in-production

# Opcionais
TURNSTILE_SECRET=xxx
OPENROUTER_API_KEY=xxx
OPENROUTER_MODEL=google/gemini-2.0-flash-lite-preview-02-05:free
PORT=5000
```

#### Portas
- Backend: `5000`
- Frontend: `5173`

#### Endpoints Principais
```
# Públicos
POST /auth/signin
POST /auth/signup
GET /status

# Autenticados
GET /history
GET /requests
POST /start_proxy
POST /analyze_with_browser
GET /false_positive_rules

# Admin
GET /admin/users
GET /active_sessions
```

## 🎯 Fluxos Comuns

### Novo Desenvolvedor
1. [QUICK_START.md](QUICK_START.md) - Instalação
2. [../README.md](../README.md) - Visão geral
3. [../AI_RULES.md](../AI_RULES.md) - Regras de desenvolvimento
4. [../components.json](../components.json) - Estrutura do projeto

### Problema de Autenticação
1. [fixes/SOLUCAO_401_COMPLETA.md](fixes/SOLUCAO_401_COMPLETA.md)
2. [fixes/FIX_JWT_ERROR.md](fixes/FIX_JWT_ERROR.md)
3. [BACKEND_AUTH_SETUP.md](BACKEND_AUTH_SETUP.md)

### Problema de Banco de Dados
1. [fixes/FIX_ASYNCPG_ERROR.md](fixes/FIX_ASYNCPG_ERROR.md)
2. [fixes/SOLUCAO_FINAL_APENAS_REST_API.md](fixes/SOLUCAO_FINAL_APENAS_REST_API.md)
3. [RLS_IMPLEMENTATION_GUIDE.md](RLS_IMPLEMENTATION_GUIDE.md)

### Deploy
1. [DOCKER_AND_GHCR_GUIDE.md](DOCKER_AND_GHCR_GUIDE.md)
2. [SUPABASE_CONFIG_GUIDE.md](SUPABASE_CONFIG_GUIDE.md)
3. [QUICK_TEST_GUIDE.md](QUICK_TEST_GUIDE.md)

## 📝 Convenções

### Nomenclatura de Arquivos
- `GUIDE.md` - Guias técnicos
- `FIX_*.md` - Correções específicas
- `SOLUCAO_*.md` - Soluções completas
- `*_COMPLETE.md` - Implementações completas

### Estrutura de Documentos
```markdown
# Título

## Problema/Contexto
## Solução
## Como Testar
## Arquivos Modificados
## Status
```

## 🔄 Atualizações

### Última Atualização: 2025-12-08

#### Adicionado
- ✅ `components.json` - Estrutura completa do projeto
- ✅ `AI_RULES.md` - Regras para desenvolvimento com IA
- ✅ `README.md` - Documentação principal
- ✅ `docs/QUICK_START.md` - Guia rápido
- ✅ `docs/README.md` - Este índice

#### Reorganizado
- ✅ Movido fixes para `docs/fixes/`
- ✅ Organizado guias técnicos
- ✅ Criado estrutura clara de navegação

## 🆘 Precisa de Ajuda?

### Não encontrou o que procura?

1. **Busque nos fixes**: [fixes/](fixes/)
2. **Verifique o README principal**: [../README.md](../README.md)
3. **Consulte AI_RULES**: [../AI_RULES.md](../AI_RULES.md)
4. **Abra uma issue**: [GitHub Issues](https://github.com/seu-usuario/datasniffer-ai/issues)

### Quer contribuir com a documentação?

1. Siga o padrão de nomenclatura
2. Use markdown formatado
3. Adicione ao índice apropriado
4. Faça PR com descrição clara

---

**Versão da Documentação**: 1.1.0  
**Última atualização**: 2025-12-08  
**Mantenedor**: Vinicius
