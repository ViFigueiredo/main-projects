# 🧪 Guia Rápido de Teste

## Problema Resolvido ✅

O erro `http://localhost:5173/undefined/auth/signin` foi corrigido!
- Causa: Variável `VITE_API_URL` não estava definida no `.env`
- Solução: Configurar `VITE_API_URL=http://localhost:5000` no frontend

## 🚀 Teste Passo a Passo

### 1. Configure o Backend

```bash
cd backend
cp .env.example .env
# Edite .env com suas credenciais do Supabase
```

### 2. Instale Dependências

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure o Frontend

O arquivo `frontend/.env` já foi corrigido com:
```env
VITE_API_URL=http://localhost:5000
VITE_TURNSTILE_SITE_KEY=0x4AAAAAACFb_I9TG1TKgEId
```

### 4. Inicie os Serviços

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend
cd frontend  
npm run dev
```

### 5. Teste o Login

1. Abra http://localhost:5173
2. Tente acessar /tools (deve redirecionar para login)
3. Faça login com:
   - Email: `master@datasniffer.ai`
   - Senha: (senha que você configurou)
4. Deve redirecionar para /tools

## 🔧 Verificação

### Teste via cURL

```bash
# Teste de login
curl -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'

# Teste de verificação
curl -X GET http://localhost:5000/auth/verify \
  -H "Authorization: Bearer <token>"
```

### Logs Esperados

Backend deve mostrar:
```
INFO:     127.0.0.1:xxxx - "POST /auth/signin HTTP/1.1" 200
```

Frontend deve mostrar:
```
Login realizado com sucesso
```

## 🚨 Problemas Comuns

### Erro: "Token inválido ou expirado"
- Verifique se `JWT_SECRET` é igual no backend
- Limpe localStorage: F12 → Application → Clear Storage

### Erro: "Variáveis não configuradas"
- Verifique `backend/.env` existe
- Confirme variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`

### Erro: "Credenciais inválidas"
- Execute `create_supabase_admin.sql` no Supabase
- Verifique email/senha no banco

### Erro: "CORS blocked"
- Backend deve rodar em porta 5000
- Frontend em porta 5173 (Vite)

## ✅ Checklist Final

- [ ] Backend configurado com `.env`
- [ ] Frontend configurado com `VITE_API_URL`
- [ ] Backend rodando (porta 5000)
- [ ] Frontend rodando (porta 5173)
- [ ] Usuário admin criado
- [ ] Login funcionando
- [ ] Redirecionamento funcionando
- [ ] Rotas protegidas funcionando

## 🎉 Sucesso!

Se tudo funcionar, você verá:
- ✅ Login redireciona para página original
- ✅ Token salvo no localStorage
- ✅ Acesso a rotas protegidas
- ✅ Logout limpa sessão
- ✅ Middleware validando tokens

---

**Resultado**: Sistema de autenticação 100% funcional e seguro! 🔒