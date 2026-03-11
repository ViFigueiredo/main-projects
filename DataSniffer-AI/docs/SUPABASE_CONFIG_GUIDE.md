# 🔧 Guia de Configuração do Supabase

## ❌ Erro Atual

```
[Errno 11001] getaddrinfo failed
```

**Causa:** O arquivo `backend/.env` está com URLs de teste que não existem.

## ✅ Como Configurar

### 1. Acesse seu Projeto Supabase

1. Vá para https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione seu projeto (ou crie um novo)

### 2. Obtenha as Credenciais

#### A. URL do Projeto
1. No dashboard do projeto, vá em **Settings** (⚙️)
2. Clique em **API**
3. Copie a **Project URL**
   - Exemplo: `https://xyzabcdefgh.supabase.co`

#### B. Service Role Key
1. Na mesma página **API**
2. Role até **Project API keys**
3. Copie a **service_role** key (não a anon key!)
   - ⚠️ **IMPORTANTE:** Esta chave é secreta, nunca compartilhe!

### 3. Atualize o arquivo `.env`

Edite o arquivo `backend/.env`:

```env
# Configurações do Supabase
SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui

# Chave secreta para JWT tokens (altere em produção!)
JWT_SECRET=datasniffer-secret-key-change-in-production

# Configurações do Cloudflare Turnstile
TURNSTILE_SECRET=0x4AAAAAACFb_EzsOWiM6YLqmHWuYWmEppY

# Configurações do servidor
PORT=5000

# Configurações do OpenRouter (opcional)
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=google/gemini-2.0-flash-lite-preview-02-05:free
```

### 4. Verifique a Configuração

Depois de atualizar o `.env`:

1. **Reinicie o backend:**
   ```bash
   # Pare o servidor (Ctrl+C)
   cd backend
   python main.py
   ```

2. **Teste a conexão:**
   - Tente fazer login novamente
   - Você deve ver nos logs:
     ```
     [Auth] Tentando login para: admin@datasniffer.ai
     [Auth] Resposta Supabase: 200
     [Auth] User ID: ...
     ```

## 🔍 Verificação Rápida

Para verificar se suas credenciais estão corretas, você pode testar no terminal:

```bash
# Windows PowerShell
$env:SUPABASE_URL="https://seu-project.supabase.co"
$env:SUPABASE_KEY="sua-service-role-key"

# Teste a conexão
curl "$env:SUPABASE_URL/rest/v1/" -H "apikey: $env:SUPABASE_KEY"
```

Se retornar algo como `{"message":"..."}`, a conexão está OK!

## 📋 Checklist

- [ ] Acessei o dashboard do Supabase
- [ ] Copiei a Project URL
- [ ] Copiei a service_role key
- [ ] Atualizei o arquivo `backend/.env`
- [ ] Reiniciei o backend
- [ ] Testei o login

## ⚠️ Problemas Comuns

### 1. "Invalid API key"
- Você copiou a **anon key** em vez da **service_role key**
- Solução: Copie a chave correta (service_role)

### 2. "Project not found"
- A URL está incorreta
- Solução: Verifique se copiou a URL completa do projeto

### 3. Ainda dá erro de DNS
- Verifique sua conexão com a internet
- Tente acessar a URL do Supabase no navegador

## 🎯 Próximos Passos

Depois de configurar:

1. O backend deve conectar com sucesso
2. Você poderá fazer login com:
   - **Admin:** `admin@datasniffer.ai` / `DataSniffer2025!Admin`
   - **User1:** `user1@test.com` / `test123`

## 📞 Suporte

Se precisar criar os usuários no Supabase, veja:
- `RLS_IMPLEMENTATION_COMPLETE.md` - Instruções completas
- `docs/SUPABASE_SETUP_GUIDE.md` - Guia de setup
