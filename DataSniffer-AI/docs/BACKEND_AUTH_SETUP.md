# Configuração de Autenticação via Backend

Este guia explica como configurar o sistema de autenticação que agora é gerenciado inteiramente pelo backend Python, proporcionando maior segurança.

## 🔄 O que mudou?

### Anterior (Frontend Direto)
- Frontend se conectava diretamente ao Supabase
- Chaves do Supabase expostas no navegador
- RLS (Row Level Security) gerenciado pelo cliente

### Atual (Backend Centralizado)
- Backend Python gerencia toda autenticação
- Chaves do Supabase ficam apenas no servidor
- Tokens JWT gerenciados pelo backend
- Maior segurança e controle

## 🚀 Configuração do Backend

### 1. Variáveis de Ambiente

Copie `.env.example` para `.env`:

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com suas credenciais:

```env
# Configurações do Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Chave secreta para JWT tokens (altere em produção!)
JWT_SECRET=datasniffer-secret-key-change-in-production

# Configurações do Cloudflare Turnstile
TURNSTILE_SECRET=0x4AAAAAACFb_EzsOWiM6YLqmHWuYWmEppY

# Configurações do servidor
PORT=5000
```

### 2. Instalar Dependências

```bash
cd backend
pip install -r requirements.txt
```

### 3. Criar Usuário Admin

Execute o script SQL no Supabase:

```sql
-- create_supabase_admin.sql
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  aud, 
  role
) VALUES (
  'admin-uuid-here',
  'master@datasniffer.ai',
  'hashed-password-here',
  NOW(),
  NOW(),
  'authenticated',
  'authenticated'
);

-- Criar perfil na tabela users
INSERT INTO public.users (
  id, 
  email, 
  role, 
  created_at, 
  updated_at
) VALUES (
  'admin-uuid-here',
  'master@datasniffer.ai',
  'admin',
  NOW(),
  NOW()
);
```

### 4. Iniciar Backend

```bash
cd backend
python main.py
```

## 🔌 Endpoints de Autenticação

### Login
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Cadastro
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Logout
```http
POST /auth/signout
Authorization: Bearer <token>
```

### Verificar Token
```http
GET /auth/verify
Authorization: Bearer <token>
```

### Obter Usuário Atual
```http
GET /auth/me
Authorization: Bearer <token>
```

## 🛡️ Segurança Implementada

### 1. Tokens JWT
- Tokens gerados pelo backend com chave secreta
- Tempo de expiração: 24 horas
- Assinatura HMAC-SHA256

### 2. Proteção de Rotas
- Middleware verifica token em rotas protegidas
- Role-based access control (admin/user)

### 3. Variáveis de Ambiente
- Chaves do Supabase não expostas no frontend
- Configuração segura via environment variables

## 🔄 Migração do Frontend

### 1. Remover Dependências Supabase

```bash
cd frontend
npm uninstall @supabase/supabase-js
```

### 2. Atualizar Store

O frontend agora usa `useAuthBackendStore`:

```typescript
import { useAuthBackendStore } from '../stores/authBackend'

const authStore = useAuthBackendStore()
```

### 3. Variáveis de Ambiente Frontend

Apenas a URL do backend é necessária:

```env
VITE_API_URL=http://localhost:5000
```

## 🧪 Testes

### 1. Testar Backend

```bash
# Teste de login
curl -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "master@datasniffer.ai", "password": "senha123"}'
```

### 2. Testar Frontend

1. Abra o frontend
2. Tente acessar rota protegida (ex: /tools)
3. Deve redirecionar para login
4. Faça login com credenciais
5. Deve redirecionar para rota original

## 🔧 Troubleshooting

### Erro: "Token inválido ou expirado"
- Verifique se JWT_SECRET é igual no backend
- Limpe localStorage do navegador

### Erro: "Credenciais inválidas"
- Verifique se usuário existe no Supabase
- Confirme senha está correta

### Erro: "Variáveis não configuradas"
- Verifique arquivo `.env` no backend
- Confirme nomes das variáveis

## 📋 Checklist de Segurança

- [ ] JWT_SECRET alterado para valor único
- [ ] SUPABASE_SERVICE_ROLE_KEY está seguro
- [ ] HTTPS em produção
- [ ] Rate limiting implementado
- [ ] Logs de autenticação ativos
- [ ] Backup de usuários configurado

## 🚀 Próximos Passos

1. Implementar refresh tokens
2. Adicionar rate limiting
3. Configurar OAuth (Google, GitHub)
4. Implementar 2FA
5. Logs de auditoria detalhados