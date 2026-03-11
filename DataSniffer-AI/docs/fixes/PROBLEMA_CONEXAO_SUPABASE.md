# 🔴 PROBLEMA: Erro de Conexão com Supabase

## ❌ Erro Atual

```
[Auth] ERRO no sign_in: [Errno 11001] getaddrinfo failed
httpx.ConnectError: [Errno 11001] getaddrinfo failed
```

## 🔍 Causa

O arquivo `backend/.env` está configurado com URLs de teste que não existem:

```env
SUPABASE_URL=https://test-project.supabase.co  ❌ NÃO EXISTE
SUPABASE_SERVICE_ROLE_KEY=test-key-123         ❌ INVÁLIDA
```

## ✅ Solução

### Passo 1: Obter Credenciais Reais

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Settings** → **API**
4. Copie:
   - **Project URL** (ex: `https://xyzabc.supabase.co`)
   - **service_role key** (a chave secreta, não a anon!)

### Passo 2: Atualizar `.env`

Edite `backend/.env` com suas credenciais reais:

```env
SUPABASE_URL=https://SEU-PROJECT-ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Passo 3: Testar Conexão

```bash
cd backend
python test_supabase_connection.py
```

Deve mostrar:
```
✅ CONEXÃO OK!
   Status: 200
```

### Passo 4: Reiniciar Backend

```bash
python main.py
```

### Passo 5: Testar Login

Acesse http://localhost:5173/login e faça login com:
- Email: `admin@datasniffer.ai`
- Senha: `DataSniffer2025!Admin`

## 📋 Checklist Rápido

- [ ] Tenho conta no Supabase
- [ ] Tenho um projeto criado
- [ ] Copiei a Project URL
- [ ] Copiei a service_role key (não a anon!)
- [ ] Atualizei `backend/.env`
- [ ] Testei com `test_supabase_connection.py`
- [ ] Reiniciei o backend
- [ ] Consegui fazer login

## 🆘 Ainda com Problemas?

### Se não tem projeto no Supabase:

1. Crie uma conta em https://supabase.com
2. Crie um novo projeto
3. Aguarde ~2 minutos para o projeto ficar pronto
4. Siga os passos acima

### Se não tem os usuários criados:

Execute as migrações SQL que estão em:
- `RLS_IMPLEMENTATION_COMPLETE.md`
- Ou use o Supabase MCP para criar

### Se a URL está correta mas ainda dá erro:

- Verifique sua conexão com internet
- Tente acessar a URL no navegador
- Verifique se não há firewall bloqueando

## 📚 Documentação Relacionada

- `SUPABASE_CONFIG_GUIDE.md` - Guia completo de configuração
- `RLS_IMPLEMENTATION_COMPLETE.md` - Setup completo do RLS
- `docs/SUPABASE_SETUP_GUIDE.md` - Guia de setup inicial
