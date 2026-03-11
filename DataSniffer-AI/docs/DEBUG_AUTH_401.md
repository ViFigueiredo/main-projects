# Debug: Erro 401 nas Rotas Autenticadas

## Problema
Após fazer logout e login novamente como admin, as rotas `/false_positive_rules` e possivelmente outras rotas autenticadas retornam 401 Unauthorized.

## ✅ SOLUÇÃO ENCONTRADA E APLICADA

O problema era que várias funções no `frontend/src/stores/traffic.ts` estavam fazendo requisições diretas com `fetch()` ao invés de usar o helper `api.ts` que adiciona automaticamente o token JWT.

### Funções corrigidas:
- ✅ `startProxy()` - agora usa `postAPI()`
- ✅ `analyzeBrowser()` - agora usa `postAPI()`
- ✅ `fetchAnalysisResult()` - agora usa `getAPI()`
- ✅ `reanalyzeSession()` - agora usa `postAPI()`
- ✅ `clearHistory()` - agora usa `deleteAPI()`
- ✅ `saveSettings()` - agora usa `postAPI()`
- ✅ `getSettings()` - agora usa `getAPI()`
- ✅ `explainVulnerability()` - agora usa `postAPI()`
- ✅ `stopProxy()` - agora usa `postAPI()`
- ✅ `startCrawl()` - agora usa `postAPI()` e `deleteAPI()`

Todas essas funções agora enviam automaticamente o token JWT no header `Authorization: Bearer <token>`.

## O que foi feito

### 1. Adicionado logging detalhado no backend

Adicionei logs em 3 pontos críticos:

#### `backend/src/auth.py` - `verify_token()`
- Mostra quando está decodificando o token
- Mostra o JWT_SECRET (primeiros 20 caracteres)
- Mostra o payload decodificado
- Mostra timestamps de expiração vs atual
- Mostra erros específicos de JWT

#### `backend/src/auth.py` - `get_current_user()`
- Mostra o token recebido (primeiros 20 caracteres)
- Mostra se o token é válido ou não
- Mostra o user_id e role do usuário autenticado

#### `backend/main.py` - `/false_positive_rules`
- Mostra o email e role do usuário autenticado
- Mostra quantas regras foram encontradas

### 2. Verificação da configuração

A configuração está correta:
- ✅ `SUPABASE_URL` configurado
- ✅ `SUPABASE_SERVICE_ROLE_KEY` configurado
- ✅ `JWT_SECRET` configurado
- ✅ Endpoints têm `Depends(get_current_user)`
- ✅ Frontend usa helper `api.ts` que adiciona token automaticamente
- ✅ Token é salvo no localStorage após login

## Como testar

### 1. Reinicie o backend
```bash
cd backend
python main.py
```

### 2. Faça login no frontend
1. Abra o navegador em `http://localhost:5173`
2. Faça login com: `admin@datasniffer.ai` / `DataSniffer2025!Admin`

### 3. Verifique o console do navegador
Abra o DevTools (F12) e vá para a aba Console. Procure por:
- `[AuthStore] Login bem-sucedido! Token salvo.`
- `[AuthStore] Usuário:` (deve mostrar role: "admin")

### 4. Verifique o localStorage
No DevTools, vá para Application > Local Storage > http://localhost:5173
- Deve ter uma chave `auth_token` com um valor JWT

### 5. Tente acessar uma rota protegida
1. Vá para Settings (Configurações)
2. Observe o console do backend (terminal onde rodou `python main.py`)

### 6. Analise os logs do backend

Você deve ver algo como:
```
[Auth] get_current_user - Token recebido (primeiros 20 chars): eyJhbGciOiJIUzI1NiIs...
[Auth] verify_token - Decodificando token...
[Auth] verify_token - JWT_SECRET (primeiros 20 chars): datasniffer-secret-...
[Auth] verify_token - Token decodificado com sucesso
[Auth] verify_token - Payload: {'user_id': '2a5cf2c5-...', 'email': 'admin@datasniffer.ai', 'role': 'admin', 'exp': 1733...}
[Auth] verify_token - Expiration: 1733..., Now: 1733...
[Auth] verify_token - Token válido!
[Auth] get_current_user - Payload válido: user_id=2a5cf2c5-..., role=admin
[Endpoint] /false_positive_rules - Usuário autenticado: admin@datasniffer.ai (role: admin)
[Endpoint] /false_positive_rules - Buscando regras para user_id: 2a5cf2c5-...
[Endpoint] /false_positive_rules - Encontradas X regras
```

## Possíveis causas do erro 401

### 1. Token não está sendo enviado
**Sintoma**: Não aparece log `[Auth] get_current_user - Token recebido`
**Solução**: Verificar se o token está no localStorage e se o helper api.ts está sendo usado

### 2. Token expirado
**Sintoma**: Log mostra `[Auth] verify_token - Token expirado!`
**Solução**: Fazer logout e login novamente (token dura 24h)

### 3. JWT_SECRET diferente
**Sintoma**: Log mostra erro de decodificação JWT
**Solução**: Verificar se o JWT_SECRET no .env é o mesmo usado para criar o token

### 4. Token malformado
**Sintoma**: Log mostra erro de parsing JWT
**Solução**: Limpar localStorage e fazer login novamente

### 5. Problema de CORS
**Sintoma**: Erro no console do navegador antes de chegar ao backend
**Solução**: Verificar configuração CORS no backend

## Próximos passos

Após executar os testes acima, compartilhe:
1. Os logs do backend (terminal)
2. Os logs do frontend (console do navegador)
3. O conteúdo do localStorage (auth_token)

Com essas informações, poderei identificar exatamente onde está o problema.
