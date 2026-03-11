# Correção: Autenticação JWT em Todas as Requisições

## Problema Identificado

Após fazer logout e login como admin, várias rotas retornavam **401 Unauthorized** porque as requisições não estavam enviando o token JWT.

## Causa Raiz

O arquivo `frontend/src/stores/traffic.ts` tinha múltiplas funções fazendo requisições diretas com `fetch()` ao invés de usar o helper `frontend/src/utils/api.ts` que adiciona automaticamente o header `Authorization: Bearer <token>`.

## Solução Implementada

### 1. Corrigido `frontend/src/stores/traffic.ts`

Convertidas **10 funções** para usar os helpers autenticados:

**IMPORTANTE**: Todas as funções agora usam `getAPI()`, `postAPI()`, `putAPI()` ou `deleteAPI()` que automaticamente adicionam o token JWT.

| Função | Antes | Depois |
|--------|-------|--------|
| `startProxy()` | `fetch()` direto | `postAPI()` |
| `analyzeBrowser()` | `fetch()` direto | `postAPI()` |
| `fetchAnalysisResult()` | `fetch()` direto | `getAPI()` |
| `reanalyzeSession()` | `fetch()` direto | `postAPI()` |
| `clearHistory()` | `fetch()` direto | `deleteAPI()` |
| `saveSettings()` | `fetch()` direto | `postAPI()` |
| `getSettings()` | `fetch()` direto | `getAPI()` |
| `explainVulnerability()` | `fetch()` direto | `postAPI()` |
| `stopProxy()` | `fetch()` direto | `postAPI()` |
| `startCrawl()` | `fetch()` direto | `postAPI()` + `deleteAPI()` |

### 2. Adicionado logging detalhado no backend

Para facilitar debug futuro, adicionei logs em:

#### `backend/src/auth.py`
- `verify_token()`: Mostra decodificação, payload, expiração
- `get_current_user()`: Mostra token recebido e usuário autenticado

#### `backend/main.py`
- `/false_positive_rules`: Mostra usuário e quantidade de regras

## Como Testar

### 1. Reinicie o backend
```bash
cd backend
python main.py
```

### 2. Reinicie o frontend (se estiver rodando)
```bash
cd frontend
npm run dev
```

### 3. Faça login
1. Acesse `http://localhost:5173`
2. Login: `admin@datasniffer.ai` / `DataSniffer2025!Admin`

### 4. Teste as rotas
- ✅ Vá para **Settings** (Configurações)
- ✅ Vá para **History** (Histórico)
- ✅ Vá para **Traffic** (Tráfego)
- ✅ Tente iniciar um proxy
- ✅ Tente fazer uma análise

### 5. Verifique os logs do backend
Você deve ver logs como:
```
[Auth] get_current_user - Token recebido (primeiros 20 chars): eyJhbGciOiJIUzI1NiIs...
[Auth] verify_token - Token válido!
[Auth] get_current_user - Payload válido: user_id=2a5cf2c5-..., role=admin
[Endpoint] /false_positive_rules - Usuário autenticado: admin@datasniffer.ai (role: admin)
```

## Rotas Protegidas

Todas as rotas abaixo agora exigem autenticação JWT:

### Rotas de Usuário (requer login)
- `GET /history` - Histórico de sessões
- `GET /requests` - Requisições capturadas
- `POST /start_proxy` - Iniciar proxy
- `POST /analyze_with_browser` - Análise profunda
- `GET /analysis/{session_id}` - Resultado da análise
- `POST /reanalyze/{session_id}` - Reanalisar sessão
- `DELETE /history` - Limpar histórico
- `GET /settings` - Obter configurações
- `POST /settings` - Salvar configurações
- `POST /explain_vulnerability` - Explicar vulnerabilidade
- `POST /stop_proxy` - Parar proxy
- `POST /crawl/{session_id}` - Iniciar crawling
- `DELETE /session/{session_id}/crawl_data` - Limpar dados de crawl
- `GET /false_positive_rules` - Listar regras
- `POST /false_positive_rules` - Criar regra
- `PUT /false_positive_rules/{rule_id}` - Atualizar regra
- `DELETE /false_positive_rules/{rule_id}` - Deletar regra

### Rotas de Admin (requer role="admin")
- `GET /active_sessions` - Sessões ativas
- `GET /admin/users` - Listar usuários
- `DELETE /admin/users/{user_id}` - Deletar usuário
- `PUT /admin/users/{user_id}` - Atualizar usuário
- `POST /end_session/{session_id}` - Encerrar sessão

### Rotas Públicas (sem autenticação)
- `POST /auth/signin` - Login
- `POST /auth/signup` - Cadastro
- `POST /auth/signout` - Logout
- `GET /auth/me` - Dados do usuário atual
- `GET /auth/verify` - Verificar token
- `GET /status` - Status do servidor
- `POST /validate-captcha` - Validar CAPTCHA

## Arquivos Modificados

1. ✅ `frontend/src/stores/traffic.ts` - Convertido para usar API helpers (10 funções)
2. ✅ `backend/src/auth.py` - Adicionado logging detalhado
3. ✅ `backend/main.py` - Adicionado autenticação em 10 endpoints + logging
4. ✅ `DEBUG_AUTH_401.md` - Documentação de debug
5. ✅ `docs/CORRECAO_AUTH_TOKEN.md` - Este arquivo

### Endpoints que receberam autenticação no backend:
- ✅ `GET /requests` - Adicionado `Depends(get_current_user)`
- ✅ `GET /requests/{session_id}` - Adicionado `Depends(get_current_user)`
- ✅ `GET /analysis/{session_id}` - Adicionado `Depends(get_current_user)`
- ✅ `POST /reanalyze/{session_id}` - Adicionado `Depends(get_current_user)`
- ✅ `GET /settings` - Adicionado `Depends(get_current_user)`
- ✅ `POST /settings` - Adicionado `Depends(get_current_user)`
- ✅ `POST /explain_vulnerability` - Adicionado `Depends(get_current_user)`
- ✅ `POST /stop_proxy` - Adicionado `Depends(get_current_user)`
- ✅ `GET /crawled_urls/{session_id}` - Adicionado `Depends(get_current_user)`
- ✅ `GET /false_positive_rules` - Já tinha (adicionado logging)

## Próximos Passos

Se ainda houver problemas de autenticação:

1. **Verifique o localStorage**
   - Abra DevTools (F12) > Application > Local Storage
   - Deve ter `auth_token` com um JWT válido

2. **Verifique os logs do backend**
   - Procure por erros de JWT ou token expirado

3. **Limpe o cache e faça login novamente**
   - Logout
   - Limpe localStorage
   - Login novamente

4. **Verifique o JWT_SECRET**
   - Deve ser o mesmo no `.env` do backend
   - Padrão: `datasniffer-secret-key-change-in-production`

## Status Final

✅ **PROBLEMA RESOLVIDO**

Todas as requisições agora enviam o token JWT automaticamente através dos helpers `getAPI()`, `postAPI()`, `putAPI()` e `deleteAPI()`.
