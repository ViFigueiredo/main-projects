# 🚀 Quick Start - DataSniffer AI

Guia rápido para começar a usar o DataSniffer AI em 5 minutos.

## 📋 Pré-requisitos

- Python 3.13+
- Node.js 20.19+ ou 22.12+
- pnpm 10.23+
- Conta Supabase (gratuita)

## ⚡ Instalação Rápida

### 1. Clone e Configure

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/datasniffer-ai.git
cd datasniffer-ai

# Backend
cd backend
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Frontend
cd ../frontend
pnpm install
```

### 2. Configure Supabase

1. Crie conta em [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Vá em SQL Editor e execute:

```sql
-- Copie e cole o conteúdo de backend/db/supabase_schema.sql
```

4. Vá em Settings → API e copie:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configure .env

```bash
cd backend
cp .env.example .env
```

Edite `backend/.env`:
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
JWT_SECRET=datasniffer-secret-key-change-in-production
```

### 4. Crie Usuário Admin

No Supabase Dashboard → Authentication → Users → Add User:
- Email: `admin@datasniffer.ai`
- Password: `DataSniffer2025!Admin`

Depois, no SQL Editor:
```sql
-- Promover para admin
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'admin@datasniffer.ai';
```

## 🎮 Iniciar Aplicação

### Terminal 1 - Backend
```bash
cd backend
python main.py
```
✅ Backend rodando em: `http://localhost:5000`

### Terminal 2 - Frontend
```bash
cd frontend
pnpm dev
```
✅ Frontend rodando em: `http://localhost:5173`

## 🔐 Primeiro Acesso

1. Abra `http://localhost:5173`
2. Login:
   - Email: `admin@datasniffer.ai`
   - Senha: `DataSniffer2025!Admin`
3. Você verá o dashboard principal

## 🎯 Primeira Análise

### Modo 1: Proxy Interceptador

1. Clique em **"New Session"**
2. Configure:
   - Target URL: `https://httpbin.org/get`
   - Method: `GET`
3. Clique em **"Start Proxy"**
4. Veja requisições sendo capturadas em tempo real
5. Clique em qualquer requisição para ver detalhes

### Modo 2: Análise Profunda (Browser)

1. Clique em **"New Session"**
2. Configure:
   - Target URL: `https://example.com`
   - Method: `GET`
3. Marque opções de análise:
   - ✅ Analyze Network Logs
   - ✅ Check Cookies
   - ✅ Inspect Local Storage
4. Clique em **"Analyze with Browser"**
5. Aguarde análise (pode levar alguns segundos)
6. Veja vulnerabilidades detectadas

## 📊 Explorar Funcionalidades

### Dashboard (Sessions)
- Visualize histórico de análises
- Veja contagem de vulnerabilidades
- Acesse análises anteriores

### Traffic
- Veja requisições interceptadas
- Filtre por método, status, URL
- Inspecione headers, body, cookies

### Analysis
- Veja vulnerabilidades detectadas
- Filtre por severidade (Critical, High, Medium, Low)
- Clique em "Explain with AI" para detalhes

### Settings
- Configure OpenRouter API key (opcional)
- Gerencie False Positive Rules
- Ajuste configurações

### Admin Panel (apenas admin)
- Gerencie usuários
- Veja sessões ativas
- Promova/rebaixe usuários

## 🔧 Configurações Opcionais

### OpenRouter AI (Explicações de Vulnerabilidades)

1. Crie conta em [openrouter.ai](https://openrouter.ai)
2. Gere API key
3. Em Settings:
   - OpenRouter API Key: `sua-key`
   - Model: `google/gemini-2.0-flash-lite-preview-02-05:free`
4. Agora você pode usar "Explain with AI" nas vulnerabilidades

### Cloudflare Turnstile (CAPTCHA)

1. Crie conta em [Cloudflare](https://cloudflare.com)
2. Vá em Turnstile e crie site
3. Adicione em `.env`:
   ```bash
   TURNSTILE_SECRET=sua-secret-key
   ```
4. CAPTCHA será exigido em produção (desabilitado em localhost)

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verifique se .env está configurado
cat backend/.env

# Verifique se dependências estão instaladas
pip list | grep fastapi

# Verifique logs
python main.py
```

### Frontend não inicia
```bash
# Limpe cache e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Verifique versão do Node
node --version  # Deve ser 20.19+ ou 22.12+
```

### Erro 401 Unauthorized
1. Faça logout
2. Limpe localStorage (F12 → Application → Local Storage → Clear)
3. Faça login novamente

### Erro de conexão com Supabase
1. Verifique `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no `.env`
2. Verifique se projeto Supabase está ativo
3. Verifique se schema SQL foi executado

## 📚 Próximos Passos

1. **Leia a documentação completa**: [README.md](../README.md)
2. **Entenda a arquitetura**: [components.json](../components.json)
3. **Regras de desenvolvimento**: [AI_RULES.md](../AI_RULES.md)
4. **Guias técnicos**: [docs/guides/](guides/)

## 🆘 Precisa de Ajuda?

- **Documentação**: [docs/](.)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/datasniffer-ai/issues)
- **Fixes comuns**: [docs/fixes/](fixes/)

---

**Tempo estimado**: 5-10 minutos  
**Dificuldade**: Fácil  
**Última atualização**: 2025-12-08
