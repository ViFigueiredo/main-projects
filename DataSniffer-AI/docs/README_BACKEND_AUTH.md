# 🛡️ DataSniffer AI - Autenticação via Backend

## 📋 Resumo das Mudanças

Implementamos um sistema de autenticação **100% gerenciado pelo backend Python** para maior segurança. As chaves do Supabase não ficam mais expostas no frontend.

## 🔄 Arquitetura Nova

```
Frontend (Vue.js)          Backend (Python/FastAPI)
     ↓                              ↓
API HTTP (JWT)            Supabase (Service Role)
     ↓                              ↓
Verificação Local          Autenticação & RLS
```

## 📁 Arquivos Modificados

### Backend
- ✅ `backend/src/auth.py` - Módulo completo de autenticação
- ✅ `backend/main.py` - Endpoints de autenticação
- ✅ `backend/requirements.txt` - Dependências httpx, python-jose
- ✅ `backend/.env.example` - Variáveis de ambiente

### Frontend
- ✅ `frontend/src/stores/authBackend.ts` - Store via backend API
- ✅ `frontend/src/views/LoginView.vue` - Login via backend
- ✅ `frontend/src/router/index.ts` - Guards com novo store
- ✅ `frontend/.env.example` - Apenas URL do backend

### Documentação
- ✅ `docs/BACKEND_AUTH_SETUP.md` - Guia completo
- ✅ `scripts/remove-supabase-frontend.sh` - Script de limpeza

## 🚀 Como Usar

### 1. Configurar Backend

```bash
# Copiar variáveis de ambiente
cp backend/.env.example backend/.env

# Editar com suas credenciais
nano backend/.env
```

### 2. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configurar Frontend

```bash
# Copiar .env example
cp frontend/.env.example frontend/.env

# Apenas configurar URL do backend
echo "VITE_API_URL=http://localhost:5000" >> frontend/.env
```

### 4. Iniciar Serviços

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🔐 Segurança Implementada

### ✅ Tokens JWT Seguros
- Chave secreta configurável via `JWT_SECRET`
- Expiração de 24 horas
- Assinatura HMAC-SHA256

### ✅ Role-Based Access
- Verificação de role (admin/user)
- Proteção de endpoints administrativos

### ✅ Middleware de Autenticação
- Interceptor FastAPI
- Validação automática de tokens
- Tratamento de erros

### ✅ Proteção de Dados
- Chaves do Supabase apenas no backend
- Service Role Key para operações admin
- RLS (Row Level Security) mantido

## 📊 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|-----------|-------------|
| POST | `/auth/signin` | Login de usuário |
| POST | `/auth/signup` | Cadastro de usuário |
| POST | `/auth/signout` | Logout |
| GET | `/auth/me` | Obter usuário atual |
| GET | `/auth/verify` | Verificar token |

## 🧪 Testes

### Teste de Login

```bash
curl -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "master@datasniffer.ai", "password": "senha123"}'
```

### Teste de Proteção

```bash
# Sem token (deve falhar)
curl -X GET http://localhost:5000/auth/me

# Com token (deve funcionar)
curl -X GET http://localhost:5000/auth/me \
  -H "Authorization: Bearer <token>"
```

## 🔧 Variáveis de Ambiente

### Backend (.env)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=secret-key-here
TURNSTILE_SECRET=turnstile-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_TURNSTILE_SITE_KEY=site-key
```

## 🚨 Migração do Sistema Antigo

### Para Remover Sistema Antigo

```bash
# Executar script de limpeza
chmod +x scripts/remove-supabase-frontend.sh
./scripts/remove-supabase-frontend.sh
```

### Para Manter Backup

```bash
# Renomear store antigo
mv frontend/src/stores/auth.ts frontend/src/stores/auth_supabase.ts

# Manter cliente Supabase para referência
mv frontend/src/utils/supabaseClient.ts frontend/src/utils/supabaseClient_old.ts
```

## 📋 Checklist Final

- [ ] Backend configurado com credenciais Supabase
- [ ] Frontend configurado com URL do backend
- [ ] Usuário admin criado no Supabase
- [ ] Login funcionando
- [ ] Rotas protegidas funcionando
- [ ] CAPTCHA funcionando em produção
- [ ] Logs de autenticação ativos

## 🆘 Suporte

- **Documentação**: `docs/BACKEND_AUTH_SETUP.md`
- **Script de migração**: `scripts/remove-supabase-frontend.sh`
- **Exemplo de configuração**: `backend/.env.example`

---

**Resultado**: Sistema 100% seguro com autenticação centralizada no backend! 🔒