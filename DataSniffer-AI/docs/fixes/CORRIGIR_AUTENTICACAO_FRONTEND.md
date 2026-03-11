# 🔧 Corrigir Autenticação no Frontend

## 🎯 Problema

O frontend não está enviando o token JWT nas requisições para `/history` e outros endpoints protegidos, resultando em erro 401.

## ✅ Solução Criada

### 1. Helper de API Criado

Arquivo: `frontend/src/utils/api.ts`

Funções disponíveis:
- `fetchAPI(endpoint, options)` - Fetch com token automático
- `getAPI(endpoint)` - GET com token
- `postAPI(endpoint, data)` - POST com token
- `putAPI(endpoint, data)` - PUT com token
- `deleteAPI(endpoint)` - DELETE com token

### 2. Atualização Necessária

Substituir todas as chamadas `fetch()` no `traffic.ts` por funções do helper.

## 📝 Exemplos de Conversão

### Antes (sem token):
```typescript
const response = await fetch(`${API_BASE_URL}/history`)
if (response.ok) {
  history.value = await response.json()
}
```

### Depois (com token automático):
```typescript
history.value = await getAPI('/history')
```

### Antes (POST sem token):
```typescript
const response = await fetch(`${API_BASE_URL}/start_proxy`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(config)
})
```

### Depois (POST com token):
```typescript
const response = await postAPI('/start_proxy', config)
```

## 🔄 Endpoints que Precisam de Atualização

No `frontend/src/stores/traffic.ts`:

- ✅ `/history` (GET) - JÁ ATUALIZADO
- [ ] `/requests` (GET)
- [ ] `/start_proxy` (POST)
- [ ] `/analyze_with_browser` (POST)
- [ ] `/analysis/{sessionId}` (GET)
- [ ] `/reanalyze/{sessionId}` (POST)
- [ ] `/history` (DELETE)
- [ ] `/settings` (GET/POST)
- [ ] `/explain_vulnerability` (POST)
- [ ] `/stop_proxy` (POST)
- [ ] `/false_positive_rules` (GET/POST/PUT/DELETE)
- [ ] `/crawl/{sessionId}` (POST)

## 🚀 Solução Rápida

Vou atualizar todos os endpoints principais agora!

## 📋 Checklist

- [x] Helper `api.ts` criado
- [x] Import adicionado no `traffic.ts`
- [x] `/history` atualizado
- [ ] Outros endpoints (fazendo agora...)
