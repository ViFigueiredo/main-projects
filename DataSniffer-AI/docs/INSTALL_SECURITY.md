# 🔧 Instalação de Ferramentas de Segurança

## Backend (Python)

### 1. Instalar dependências principais
```bash
cd backend
pip install -r requirements.txt
```

### 2. Instalar dependências de desenvolvimento e segurança
```bash
pip install -r requirements-dev.txt
```

Isso instalará:
- `bandit` - SAST para Python
- `safety` - Scanner de vulnerabilidades
- `pip-audit` - Auditoria de dependências
- `pytest` - Framework de testes
- `locust` - Load testing
- `black`, `flake8`, `mypy` - Code quality
- `slowapi` - Rate limiting

### 3. Verificar instalação
```bash
bandit --version
safety --version
pip-audit --version
locust --version
```

## Frontend (Node.js)

### 1. Instalar dependências
```bash
cd frontend
pnpm install
```

Isso instalará:
- `eslint-plugin-security` - Plugin de segurança para ESLint

### 2. Verificar instalação
```bash
pnpm run lint
```

## Executar Primeira Verificação

### Backend
```bash
# Scan completo
python backend/run_security_scan.py

# Secret scanner
python backend/scripts/detect_secrets.py
```

### Frontend
```bash
cd frontend
pnpm run lint
pnpm audit
```

## Troubleshooting

### Erro: "Module not found"
```bash
# Reinstalar dependências
pip install -r backend/requirements-dev.txt --force-reinstall
```

### Erro: "Command not found: locust"
```bash
# Instalar locust globalmente
pip install locust
```

### Erro: ESLint plugin security
```bash
cd frontend
pnpm install eslint-plugin-security --save-dev
```

## Próximos Passos

1. Configure variáveis de ambiente (`.env`)
2. Execute os scans de segurança
3. Revise os relatórios em `backend/logs/`
4. Configure CI/CD no GitHub

Ver: [SECURITY_QUICKSTART.md](SECURITY_QUICKSTART.md)
