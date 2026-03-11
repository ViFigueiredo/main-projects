# Instruções para Copilot - DataSniffer AI

## 🚫 IMPORTANTE - NÃO FAZER

### 1. **NÃO INICIAR O SERVIDOR**

- **NUNCA** use `python main.py` em terminal com `isBackground=true`
- **NUNCA** use `python -u main.py` ou similar
- **NUNCA** tente reiniciar o backend automaticamente
- O usuário vai iniciar/gerenciar o servidor manualmente
- Deixe o servidor rodando enquanto você faz testes

### 2. **Evitar Conflito de Terminais**

- Não execute comandos no mesmo terminal onde o servidor está rodando
- Use `requests` library ou `Invoke-WebRequest` para fazer calls HTTP
- Não execute scripts Python que importem `main.py` enquanto servidor está ativo

## ✅ FAZER

### 1. **Para Testes e Desenvolvimento**

- Use `requests.get()`, `requests.post()` para fazer chamadas HTTP
- Use `Invoke-WebRequest` do PowerShell para testes rápidos
- Crie scripts que usem a API via HTTP, não import direto

### 2. **Antes de fazer modificações**

- Sempre validar sintaxe com `python -m py_compile arquivo.py`
- Testar imports com `python -c "import modulo; print('OK')"`
- NÃO execute o servidor para testar - use a API

### 3. **Workflow Correto**

1. Modificar código
2. Validar sintaxe (py_compile)
3. Fazer request HTTP para API (servidor já está rodando)
4. Verificar resposta
5. Se houver erro, corrigir e repetir 2-4

## 📋 Checklist Antes de Cada Ação

- [ ] Servidor já está rodando em outro terminal?
- [ ] Vou usar HTTP requests ou import Python?
- [ ] Se for import de main.py, é realmente necessário?
- [ ] Posso fazer isso via API HTTP?

## 🔗 Endpoints Disponíveis

### Crawling

- `POST /crawl/{session_id}` - Iniciar crawling
- `GET /crawled_urls/{session_id}` - Listar URLs descobertas
- `GET /url_details/{session_id}/{url_id}` - Detalhes completos de URL

### Vulnerabilidades

- `GET /route_vulnerabilities/{session_id}` - Vulnerabilidades por severidade
- `GET /exploitable_routes/{session_id}` - Rotas mais perigosas
- `GET /url_details/{session_id}/{url_id}` - Análise detalhada com resposta + vulns

### Histórico

- `GET /history` - Histórico de sessões
- `GET /requests/{session_id}` - Requisições da sessão

## 🛠️ Exemplo de Uso Correto

```python
import requests

# Server já está rodando em outro terminal!
session_id = 1  # Você cria via DB ou API

# Fazer crawling
resp = requests.post("http://localhost:5000/crawl/1")
print(resp.json())

# Ver URL com vulnerabilidades
resp = requests.get("http://localhost:5000/url_details/1/10")
print(resp.json())
```

## ⚠️ O Que Não Fazer

```python
# ❌ NÃO FAZER ISSO!
import main  # Vai iniciar o servidor!
from main import app  # Vai inicializar FastAPI!

# ❌ NÃO FAZER ISSO!
import subprocess
subprocess.Popen(["python", "main.py"])  # Conflito de terminal!
```
