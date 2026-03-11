# Vulnerabilidades e Testes do DataSniffer AI

Este documento detalha todas as vulnerabilidades que o DataSniffer AI é capaz de detectar, como os testes são realizados e onde encontrar a lógica correspondente no código.

---

## 1. SQL Injection (SQLi)

O DataSniffer AI realiza testes ativos para detectar falhas de injeção de SQL em parâmetros de URL (GET) e formulários.

### 🔍 O que é testado?

- **Parâmetros GET:** URLs como `http://alvo.com/produto?id=10`.
- **Formulários:** Campos de login, busca e cadastro.
- **Tipos de SQLi:**
  - **Error-Based:** Tenta provocar erros no banco de dados.
  - **Boolean-Based:** Verifica se a resposta da página muda com condições verdadeiras/falsas (`OR 1=1`).
  - **Blind SQLi:** Mede o tempo de resposta do servidor (`SLEEP(5)`).

### 🛠️ Como funciona no código?

- **Arquivo:** `backend/src/active_fuzzer.py`
- **Funções Principais:**
  - `scan_url_for_sqli(url)`: Extrai parâmetros da URL e injeta payloads.
  - `scan_forms_for_sqli(page)`: Usa o navegador (Playwright) para preencher e enviar formulários com payloads.
- **Payloads:** Definidos na lista `SQL_INJECTION_PAYLOADS` (ex: `' OR '1'='1`, `UNION SELECT`).

---

## 2. Cross-Site Scripting (XSS)

Detecta XSS Refletido, onde o servidor retorna o input do usuário sem sanitização.

### 🔍 O que é testado?

- Injeção de scripts em parâmetros de URL.
- Verificação se o script é executado no navegador.

### 🛠️ Como funciona no código?

- **Arquivo:** `backend/src/active_fuzzer.py` e `backend/src/crawler.py`
- **Lógica:**
  1.  O sistema gera URLs com payloads XSS (ex: `<script>console.log('XSS')</script>`).
  2.  O Crawler abre essas URLs em um navegador real (headless).
  3.  Ele monitora o console do navegador e o DOM para ver se o payload foi executado.
- **Payloads:** Lista `XSS_PAYLOADS`.

---

## 3. Análise Passiva de Conteúdo

Analisa o corpo das respostas HTTP em busca de dados sensíveis ou configurações perigosas.

### 🔍 O que é testado?

- **Exposição de Segredos:** Chaves de API, Tokens, Emails.
- **Funções Perigosas:** Uso de `eval()` ou `dangerouslySetInnerHTML` no JavaScript.
- **Erros de Servidor:** Stack traces que revelam tecnologias internas.

### 🛠️ Como funciona no código?

- **Arquivo:** `backend/src/analyzer.py`
- **Função:** `analyze_content(content)`
- **Lógica:** Usa Expressões Regulares (Regex) para varrer o HTML/JS retornado pelo servidor.

---

## 4. Vulnerabilidades de Rota e Configuração

Verifica se rotas específicas ou cabeçalhos de segurança estão configurados corretamente.

### 🔍 O que é testado?

- **Arquivos Sensíveis:** `.env`, `.git/config`, backups (`.bak`).
- **Endpoints Administrativos:** `/admin`, `/dashboard` sem proteção.
- **Cabeçalhos de Segurança:** Falta de HSTS, CSP, X-Frame-Options.
- **Path Traversal:** Tentativas de acessar arquivos do sistema (`../../etc/passwd`).

### 🛠️ Como funciona no código?

- **Arquivo:** `backend/src/route_vulnerability_detector.py`
- **Classe:** `RouteVulnerabilityDetector`
- **Lógica:**
  - Compara a URL e o status code com padrões conhecidos (`VULNERABILITY_PATTERNS`).
  - Exemplo: Se acessar `/admin` retornar 200 OK sem pedir senha, gera um alerta de "Authentication Bypass".

---

## 5. Análise com IA (Opcional)

Se configurado, o sistema pode enviar trechos de código suspeitos para uma IA analisar.

### 🔍 O que é testado?

- Trechos de código JavaScript ou HTML complexos que as regras estáticas não conseguem entender.

### 🛠️ Como funciona no código?

- **Arquivo:** `backend/src/analyzer.py`
- **Função:** `query_openrouter(snippet)`
- **Lógica:** Envia o snippet para a API OpenRouter (ex: Gemini/GPT) pedindo uma análise de segurança.

---

## Resumo Técnico

| Vulnerabilidade         | Método de Teste          | Arquivo Principal                 |
| :---------------------- | :----------------------- | :-------------------------------- |
| **SQL Injection**       | Fuzzing Ativo (GET/POST) | `active_fuzzer.py`                |
| **XSS Refletido**       | Execução em Browser Real | `crawler.py`                      |
| **Segredos (API Keys)** | Regex (Análise Estática) | `analyzer.py`                     |
| **Arquivos Sensíveis**  | Checagem de Rota/Status  | `route_vulnerability_detector.py` |
| **Path Traversal**      | Padrão de URL            | `route_vulnerability_detector.py` |
