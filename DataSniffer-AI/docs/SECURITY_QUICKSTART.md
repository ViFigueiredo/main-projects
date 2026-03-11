# 🛡️ Security Quick Start

Guia rápido para executar verificações de segurança no DataSniffer AI.

## 📦 Instalação

### Backend
```bash
cd backend
pip install -r requirements.txt
pip install -r requirements-dev.txt
```

### Frontend
```bash
cd frontend
pnpm install
```

## 🔍 Executar Scans

### 1. Scan Completo (Backend)
```bash
python backend/run_security_scan.py
```

Executa:
- ✅ Bandit (SAST)
- ✅ Safety (dependency scan)
- ✅ pip-audit
- ✅ Flake8 (code quality)
- ✅ MyPy (type checking)

### 2. Secret Scanner
```bash
python backend/scripts/detect_secrets.py
```

Detecta:
- API keys
- JWT secrets
- Passwords
- Private keys
- Tokens expostos

### 3. Frontend Lint
```bash
cd frontend
pnpm run lint
```

Executa ESLint com plugin de segurança.

### 4. Load Testing
```bash
locust -f backend/scripts/load_test.py --host=http://localhost:5000
```

Acesse: http://localhost:8089

## ⚙️ Configuração

### Variáveis de Ambiente

Copie `.env.example` para `.env`:
```bash
cp backend/.env.example backend/.env
```

Configure:
```bash
# Produção
ALLOWED_ORIGINS=https://datasniffer.ai
ALLOWED_HOSTS=datasniffer.ai,api.datasniffer.ai
ENVIRONMENT=production

# Desenvolvimento
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5000
ALLOWED_HOSTS=localhost,127.0.0.1
ENVIRONMENT=development
```

## 🚀 CI/CD

O workflow `.github/workflows/security.yml` executa automaticamente:
- A cada push para `main` ou `develop`
- Em pull requests
- Diariamente às 2am UTC

## 📊 Relatórios

Relatórios são salvos em:
- `backend/logs/bandit_report.json`
- `backend/logs/safety_report.json`
- `backend/logs/pip_audit_report.json`
- `backend/logs/security_scan_report.json`

## ✅ Checklist de Deploy

- [ ] `python backend/run_security_scan.py` passa
- [ ] `python backend/scripts/detect_secrets.py` retorna 0 secrets
- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado
- [ ] Security headers verificados
- [ ] Rate limiting testado
- [ ] Load test executado

## 📚 Documentação Completa

Ver: [docs/fixes/SECURITY_IMPLEMENTATION.md](docs/fixes/SECURITY_IMPLEMENTATION.md)
