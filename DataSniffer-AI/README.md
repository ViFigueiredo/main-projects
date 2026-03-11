# 🔍 DataSniffer AI

> Ferramenta avançada de análise de segurança web com IA, proxy interceptador e análise profunda de vulnerabilidades

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5-brightgreen.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-orange.svg)](https://supabase.com/)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Documentação](#-documentação)
- [Contribuindo](#-contribuindo)

## 🎯 Visão Geral

DataSniffer AI é uma plataforma completa para análise de segurança de aplicações web que combina:

- **Proxy Interceptador**: Captura e analisa tráfego HTTP/HTTPS em tempo real
- **Análise Profunda**: Inspeção de aplicações com browser automatizado (Playwright)
- **IA Integrada**: Explicações detalhadas de vulnerabilidades via OpenRouter
- **Crawling Inteligente**: Descoberta automática de endpoints e rotas
- **Fuzzing**: Testes automatizados de parâmetros e payloads
- **False Positive Management**: Sistema de regras para filtrar falsos positivos
- **Multi-tenant**: Suporte a múltiplos usuários com isolamento de dados (RLS)

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vue.js 3)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Sessions │  │ Traffic  │  │ Analysis │  │ Settings │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                          │                                    │
│                    API Helper (JWT)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/WebSocket
┌──────────────────────────┴──────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │  Proxy   │  │ Browser  │  │ Crawler  │   │
│  │   JWT    │  │ mitmproxy│  │Playwright│  │  Fuzzer  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                          │                                    │
│                    REST API Client                           │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────┴──────────────────────────────────┐
│              Supabase (PostgreSQL + Auth)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  RLS Enabled Tables:                                 │   │
│  │  • users • sessions • requests • analyses            │   │
│  │  • false_positive_rules • crawl_logs • settings      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Autenticação**: Frontend → Backend → Supabase Auth → JWT Token
2. **Análise**: Frontend → Backend → mitmproxy/Playwright → Detecção de Vulnerabilidades
3. **Armazenamento**: Backend → Supabase REST API (RLS ativo) → PostgreSQL
4. **Tempo Real**: mitmproxy → WebSocket → Frontend (logs em tempo real)

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização
- Login/Signup via Supabase Auth
- JWT tokens com expiração de 24h
- Role-based access control (admin/user)
- Row Level Security (RLS) para isolamento de dados

### 🕵️ Análise de Segurança
- **Proxy Interceptador**: Captura tráfego HTTP/HTTPS com mitmproxy
- **Análise Profunda**: Inspeção com browser real (Playwright)
- **Detecção de Vulnerabilidades**:
  - SQL Injection
  - XSS (Cross-Site Scripting)
  - IDOR (Insecure Direct Object Reference)
  - Sensitive Data Exposure
  - Security Misconfiguration
  - CSRF, Open Redirects, Path Traversal

### 🤖 IA e Automação
- Explicações detalhadas de vulnerabilidades via OpenRouter
- Crawling inteligente com validação de rotas
- Fuzzing automatizado de parâmetros
- Sistema de regras para false positives (regex, wildcards, JSON patterns)

### 📊 Dashboard e Relatórios
- Visualização de tráfego em tempo real
- Histórico de sessões e análises
- Estatísticas de vulnerabilidades
- Exportação de relatórios (em desenvolvimento)

### 👥 Multi-tenant
- Isolamento completo de dados entre usuários
- Painel administrativo para gerenciar usuários
- Configurações por usuário

## 🛠️ Tecnologias

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Proxy**: mitmproxy
- **Browser Automation**: Playwright
- **Auth**: Supabase Auth + PyJWT
- **HTTP Client**: httpx
- **WebSocket**: FastAPI WebSocket

### Frontend
- **Framework**: Vue.js 3 + TypeScript
- **State Management**: Pinia
- **Router**: Vue Router 4
- **UI Components**: PrimeVue 4
- **Styling**: Tailwind CSS 4
- **Build Tool**: Vite

### Database
- **Provider**: Supabase
- **Type**: PostgreSQL
- **Access**: REST API only (RLS enabled)
- **Auth**: Supabase Auth

### DevOps
- **Package Manager**: pnpm (frontend), pip (backend)
- **Environment**: python-dotenv
- **Docker**: Em desenvolvimento

## 🚀 Instalação

### Pré-requisitos
- Python 3.13+
- Node.js 20.19+ ou 22.12+
- pnpm 10.23+
- Conta Supabase (gratuita)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/datasniffer-ai.git
cd datasniffer-ai
```

### 2. Configure o Backend

```bash
cd backend

# Crie ambiente virtual
python -m venv .venv

# Ative o ambiente virtual
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# Instale dependências
pip install -r requirements.txt

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase
```

### 3. Configure o Frontend

```bash
cd frontend

# Instale dependências
pnpm install

# Configure variáveis de ambiente (opcional)
# Crie .env.local se necessário
echo "VITE_API_URL=http://localhost:5000" > .env.local
```

### 4. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Execute o schema SQL em `backend/db/supabase_schema.sql`
3. Copie as credenciais:
   - `SUPABASE_URL`: URL do projeto
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role key (Settings → API)

## ⚙️ Configuração

### Backend (.env)

```bash
# Supabase (OBRIGATÓRIO)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx

# JWT (OBRIGATÓRIO)
JWT_SECRET=datasniffer-secret-key-change-in-production

# Cloudflare Turnstile (OPCIONAL - desabilitado em localhost)
TURNSTILE_SECRET=xxx

# OpenRouter AI (OPCIONAL)
OPENROUTER_API_KEY=xxx
OPENROUTER_MODEL=google/gemini-2.0-flash-lite-preview-02-05:free

# Servidor
PORT=5000
```

### Frontend (.env.local - opcional)

```bash
VITE_API_URL=http://localhost:5000
```

## 🎮 Uso

### Iniciar Backend

```bash
cd backend
python main.py
```

Backend estará rodando em: `http://localhost:5000`

### Iniciar Frontend

```bash
cd frontend
pnpm dev
```

Frontend estará rodando em: `http://localhost:5173`

### Usuários de Teste

Após configurar o Supabase, crie os usuários de teste:

| Email | Senha | Role |
|-------|-------|------|
| admin@datasniffer.ai | DataSniffer2025!Admin | admin |
| user1@test.com | test123 | user |
| user2@test.com | test123 | user |

### Fluxo Básico

1. **Login**: Acesse `http://localhost:5173` e faça login
2. **Nova Sessão**: Clique em "New Session" no dashboard
3. **Configurar Análise**:
   - URL alvo
   - Método HTTP
   - Headers customizados (opcional)
4. **Escolher Modo**:
   - **Proxy**: Interceptação de tráfego
   - **Browser**: Análise profunda com Playwright
5. **Visualizar Resultados**: Veja vulnerabilidades detectadas
6. **Gerenciar False Positives**: Configure regras em Settings

## 📚 Documentação

### Estrutura de Documentação

```
docs/
├── README.md                    # Este arquivo
├── QUICK_START.md              # Guia rápido de início
├── fixes/                      # Correções e soluções
│   ├── FIX_ASYNCPG_ERROR.md
│   ├── SOLUCAO_401_COMPLETA.md
│   └── ...
└── guides/                     # Guias técnicos
    ├── RLS_IMPLEMENTATION_GUIDE.md
    ├── SUPABASE_CONFIG_GUIDE.md
    └── ...
```

### Documentos Importantes

- **[AI_RULES.md](AI_RULES.md)**: Regras para desenvolvimento com IA
- **[components.json](components.json)**: Estrutura completa do projeto
- **[docs/QUICK_START.md](docs/QUICK_START.md)**: Guia rápido de início
- **[docs/guides/RLS_IMPLEMENTATION_GUIDE.md](docs/guides/RLS_IMPLEMENTATION_GUIDE.md)**: Implementação de RLS

### API Documentation

Acesse a documentação interativa da API:
- Swagger UI: `http://localhost:5000/docs`
- ReDoc: `http://localhost:5000/redoc`

## 🔧 Desenvolvimento

### Estrutura do Projeto

```
datasniffer-ai/
├── backend/                    # Backend Python
│   ├── main.py                # FastAPI app
│   ├── src/                   # Módulos principais
│   │   ├── auth.py           # Autenticação
│   │   ├── browser_inspector.py
│   │   ├── crawler.py
│   │   └── ...
│   ├── db/                    # Database
│   │   ├── database.py       # Funções REST API
│   │   └── supabase_rest.py  # Cliente REST
│   └── proxy_addon.py        # mitmproxy addon
├── frontend/                  # Frontend Vue.js
│   ├── src/
│   │   ├── stores/           # Pinia stores
│   │   ├── views/            # Páginas
│   │   ├── components/       # Componentes
│   │   ├── utils/            # Utilitários
│   │   └── router/           # Rotas
│   └── package.json
├── docs/                      # Documentação
├── components.json            # Estrutura do projeto
├── AI_RULES.md               # Regras para IA
└── README.md                 # Este arquivo
```

### Padrões de Código

#### Backend
- Sempre usar REST API (nunca SQL direto)
- Adicionar `Depends(get_current_user)` em endpoints protegidos
- Usar `Depends(require_role("admin"))` para rotas admin
- Adicionar logs para debug

#### Frontend
- Usar helpers `getAPI/postAPI/putAPI/deleteAPI` de `utils/api.ts`
- NUNCA usar `fetch()` direto
- Usar `authBackendStore` para autenticação
- TypeScript strict mode

### Testing

```bash
# Backend
cd backend
pytest  # (em desenvolvimento)

# Frontend
cd frontend
pnpm test  # (em desenvolvimento)
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Diretrizes

- Siga os padrões em [AI_RULES.md](AI_RULES.md)
- Adicione testes para novas funcionalidades
- Atualize a documentação
- Use commits semânticos

## 🛡️ Segurança

DataSniffer AI implementa múltiplas camadas de segurança para deploy em produção:

### Ferramentas de Segurança
- ✅ **SAST**: Bandit, Flake8, MyPy
- ✅ **Dependency Scanning**: Safety, pip-audit, npm audit
- ✅ **Secret Scanner**: Script customizado
- ✅ **Rate Limiting**: slowapi (5/min login, 3/h signup)
- ✅ **Security Headers**: 8 headers implementados
- ✅ **CORS Seguro**: Origens e métodos restritos
- ✅ **Load Testing**: Locust
- ✅ **CI/CD Pipeline**: GitHub Actions com security checks

### Quick Start de Segurança

```bash
# Instalar ferramentas
pip install -r backend/requirements-dev.txt

# Executar scan completo
python backend/run_security_scan.py

# Detectar secrets expostas
python backend/scripts/detect_secrets.py

# Load testing
locust -f backend/scripts/load_test.py --host=http://localhost:5000
```

### Documentação de Segurança
- **[SECURITY_QUICKSTART.md](SECURITY_QUICKSTART.md)**: Guia rápido
- **[INSTALL_SECURITY.md](INSTALL_SECURITY.md)**: Instalação de ferramentas
- **[docs/SECURITY_SUMMARY.md](docs/SECURITY_SUMMARY.md)**: Resumo completo
- **[docs/fixes/SECURITY_IMPLEMENTATION.md](docs/fixes/SECURITY_IMPLEMENTATION.md)**: Documentação técnica

### Checklist de Deploy
- [ ] Scan de segurança passa (`run_security_scan.py`)
- [ ] Nenhuma secret exposta (`detect_secrets.py`)
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado
- [ ] Security headers verificados
- [ ] Rate limiting testado
- [ ] Load test executado

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- **Vinicius** - *Desenvolvimento inicial*

## 🙏 Agradecimentos

- [FastAPI](https://fastapi.tiangolo.com/)
- [Vue.js](https://vuejs.org/)
- [Supabase](https://supabase.com/)
- [mitmproxy](https://mitmproxy.org/)
- [Playwright](https://playwright.dev/)
- [OpenRouter](https://openrouter.ai/)

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/datasniffer-ai/issues)
- **Documentação**: [docs/](docs/)
- **Email**: seu-email@example.com

---

**Versão**: 1.2.0  
**Última atualização**: 2025-12-08  
**Security Level**: Production-ready

Feito com ❤️ e ☕
