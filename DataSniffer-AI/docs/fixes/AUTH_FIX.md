# 🔧 Correção de Erro de Autenticação

## ❌ Problema Encontrado

Erro: "Login falhou: Erro interno no servidor"

### Causa Raiz
O token JWT estava sendo criado com `exp` (expiration) como float, mas o JWT espera um int.

```python
# ❌ ERRADO
"exp": datetime.now(timezone.utc).timestamp() + 3600 * 24

# ✅ CORRETO
"exp": int(datetime.now(timezone.utc).timestamp() + 3600 * 24)
```

## ✅ Correções Aplicadas

### 1. backend/src/auth.py

**Função `sign_in()`:**
- ✅ Convertido `exp` para int
- ✅ Adicionados logs detalhados para debug
- ✅ Melhorado tratamento de erros com traceback

**Função `sign_up()`:**
- ✅ Convertido `exp` para int

**Função `verify_token()`:**
- ✅ Convertido timestamp de comparação para int

## 🔄 Como Aplicar

### 1. Reiniciar o Backend
```bash
# Pare o backend (Ctrl+C)
cd backend
python main.py
```

### 2. Testar Login
```bash
cd frontend
pnpm dev
```

Acesse http://localhost:5173/login e tente fazer login com:
- Email: `admin@datasniffer.ai`
- Senha: `DataSniffer2025!Admin`

## 📋 Logs Esperados

Agora o backend vai mostrar logs detalhados:

```
[Auth] Tentando login para: admin@datasniffer.ai
[Auth] Resposta Supabase: 200
[Auth] User ID: 2a5cf2c5-51e4-4173-b6e6-9c07aac7e07d
[Auth] Perfil encontrado: True
[Auth] Token JWT criado com sucesso
```

Se houver erro, verá o traceback completo para debug.

## ✅ Status

**Correção aplicada!** Reinicie o backend e teste novamente.
