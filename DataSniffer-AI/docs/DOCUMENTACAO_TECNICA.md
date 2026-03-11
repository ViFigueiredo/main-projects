# DataSniffer AI - Documentação Técnica

## 1. Visão Geral da Arquitetura

O DataSniffer AI é uma plataforma de análise de segurança web composta por:

- **Backend (`backend/`)**: API REST em FastAPI responsável por interceptação de tráfego, persistência em banco, crawling, análise de vulnerabilidades e integração com IA.
- **Módulos de análise (`backend/src/`)**: onde ficam o crawler, analisadores de rotas, detectores de vulnerabilidade, testes de SQLi, etc.
- **Banco de dados (`backend/db/`)**: camada de persistência (SQLite + helpers Python) para sessões, requisições, URLs crawleadas, vulnerabilidades e regras de falsos positivos.
- **Frontend (`frontend/`)**: SPA em Vue 3/TypeScript que consome a API para exibir tráfego, vulnerabilidades, histórico e ferramentas auxiliares.

Fluxo típico:

1. O usuário configura alvo e inicia a interceptação de tráfego via frontend.
2. O proxy registra as requisições/respostas no banco.
3. O usuário dispara crawling e análises; os módulos em `src/` processam cada rota/URL.
4. Vulnerabilidades são detectadas (regras estáticas, heurísticas e testes ativos, como SQLi).
5. Opcionalmente, IA é usada para explicar achados e sugerir correções.
6. O frontend consome os endpoints de histórico, análise e crawling para exibir tudo de forma consolidada.

---

## 2. Backend FastAPI (`backend/main.py`)

### 2.1. Inicialização

- Configura paths via `config` e inicializa o banco com `database.init_db()`.
- Ativa CORS liberado para consumir a API do frontend.
- Em Windows, ajusta o event loop de `asyncio` para suportar Playwright.
- Mantém estado global do processo de proxy (`proxy_process`) e conexões WebSocket.

### 2.2. Principais Endpoints HTTP

#### Monitoramento e histórico

- `GET /status` – status do processo de proxy.
- `GET /proxy/status` – status do proxy + última sessão, quantidade de requisições capturadas e total de sessões.
- `GET /proxy/test_capture` – verifica se a sessão atual está recebendo requisições (lista amostra de até 10).
- `GET /history` – histórico de sessões.
- `DELETE /history` – limpa todo o histórico.

#### Requisições e sessões

- `GET /requests` – lista geral de requisições (com paginação simples via `limit`).
- `GET /requests/{session_id}` – requisições de uma sessão específica.

#### Análise de sessão

- `GET /analysis/{session_id}`  
  Retorna o resultado de análise de browser armazenado no banco para a sessão. Caso não exista, agrega vulnerabilidades diretamente das requisições interceptadas, gerando um objeto de resultado com:
  - `target_url` – alvo da sessão;
  - `vulnerabilities` – lista consolidada de vulnerabilidades;
  - metadados (`network_logs`, `cookies`, `sources`, etc.), com flag `is_aggregated` indicando que é resultado derivado.

#### Dados de crawling

- `DELETE /crawl_data` – limpa todos os dados de crawling/fuzzing de todas as sessões.
- `DELETE /crawl_run/{crawl_run_id}` – remove um run de crawling específico.
- `DELETE /session/{session_id}/crawl_data` – remove apenas os dados de crawling de uma sessão.

#### Regras de falsos positivos

- `GET /false_positive_rules` – lista regras cadastradas.
- `POST /false_positive_rules` – cria nova regra.
- `PUT /false_positive_rules/{rule_id}` – atualiza regra.
- `DELETE /false_positive_rules/{rule_id}` – remove regra.

Essas regras são usadas para marcar e filtrar vulnerabilidades que o usuário considera falsos positivos com base em padrões (URL, categoria, mensagem, etc.).

#### Reanálise com regras atualizadas

- `POST /reanalyze/{session_id}`  
  Recebe do frontend a lista **atual** de vulnerabilidades exibidas para o usuário, reaplica as regras de falsos positivos (`database.is_false_positive`) e devolve:
  - `vulnerabilities` filtradas;
  - contagem original, filtrada e nova total;
  - `applied_rules_summary` com resumo de quais regras foram usadas e quantas vulnerabilidades removeram.

#### Configurações de IA (OpenRouter)

- `GET /settings`  
  Retorna `openrouter_api_key` e `openrouter_model` salvos no banco.
- `POST /settings`  
  Persiste/atualiza essas configurações (o backend não depende de `.env`, pode buscar direto do banco).

> Observação: outros endpoints em `main.py` gerenciam WebSockets, controle do proxy e chamadas para IA (explicação de vulnerabilidade, relatórios, etc.), usando `src/openrouter_client.py`.

### 2.3. Encerramento

No evento `@app.on_event("shutdown")`, o backend:

- Fecha o browser persistente (`close_persistent_browser`).
- Finaliza o processo de proxy se estiver em execução.

---

## 3. Módulos de Análise Secundária (`backend/src/`)

### 3.1. `analyzer.py` – Análise Estática + IA

Responsável por inspecionar **conteúdo de resposta** (HTML, JS, etc.) em busca de padrões perigosos.

#### Regras estáticas principais

- Busca uso de `eval(` em JavaScript → indica potencial RCE/XSS.
- Detecta `dangerouslySetInnerHTML` em código React → risco de XSS.
- Procura padrões de chaves/segredos: nomes como `api_key`, `secret_key`, `access_token` associados a valores longos.

Se qualquer uma dessas regras acionar e a variável de ambiente `OPENROUTER_API_KEY` estiver definida, o módulo:

1. Recorta um trecho do conteúdo (até ~1000 caracteres).
2. Monta um prompt em inglês pedindo análise de vulnerabilidades (XSS, injection, exposição de dados sensíveis).
3. Chama `post_chat_completion` em `src/openrouter_client.py` para obter análise de IA.
4. Inclui esse texto de IA na lista de vulnerabilidades como `"AI Analysis: ..."`.

Resultado: `analyze_content(content: str) -> List[str]` devolve uma lista de strings descrevendo riscos identificados.

### 3.2. `route_vulnerability_detector.py` – Heurística de Rotas

Focado em analisar **URLs/rotas** (não o corpo) e inferir vulnerabilidades potenciais baseado em padrões.

#### Tipos de vulnerabilidade modelados

- Autenticação/autorização (bypass, endpoints de login, reset de senha, etc.).
- SQL Injection em parâmetros numéricos e endpoints de busca/filtro.
- Path Traversal em endpoints de download/arquivo.
- SSRF em endpoints que recebem `url`, `target`, etc.
- Exposição de informações (arquivos de backup, `.env`, `/debug`, `/swagger`, etc.).
- Exposição de chaves de API.
- Endpoints de debug/admin.

Cada `VulnerabilityType` possui:

- Lista de **regex** para casar com URLs.
- Descrição.
- Severidade (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`).
- Sugestões de testes ativos (ex.: payloads para SQLi, SSRF, redirects).

#### Funções principais

- `analyze_route(url, status_code, content_type, is_auth_required) -> List[Dict]`

  - Normaliza a URL (lowercase, remoção de query para parte de path).
  - Percorre todos os padrões; se algum casar, gera um objeto de vulnerabilidade com:
    - `type`, `severity`, `description`;
    - `url`, `status_code`, `content_type`, `is_auth_required`;
    - `confidence` ajustada pelo status HTTP (200/302 vs. 401/403 vs. 404);
    - `recommended_tests` com cenários sugeridos.

- `batch_analyze_routes(routes: List[Dict]) -> Dict`
  - Recebe lista de rotas com metadados.
  - Agrupa vulnerabilidades por tipo e severidade, retornando estatísticas agregadas.

Este módulo é intensamente utilizado pelo crawler para dar contexto de risco a cada URL descoberta.

### 3.3. `crawler.py` – Crawling + Detecção de Vulns + SQLi

Implementa o fluxo de crawling assíncrono com Playwright + `requests`.

#### Entrada

- `session_id`: ID da sessão cujas requisições servirão como ponto de partida.
- `max_depth`: profundidade máxima de navegação.
- `base_url` (opcional): URL base da aplicação alvo (se não informada, é inferida da primeira URL da sessão).
- `additional_urls` (opcional): lista de URLs extras informadas pelo usuário para testar explicitamente.

#### Passos principais

1. Recupera URLs únicas da sessão (`get_unique_urls_from_session`).
2. Infere `base_url` caso não fornecida.
3. Monta fila `to_visit` com `(url, depth)` e conjunto `visited`.
4. Detecta framework/rotas comuns via `get_common_routes_for_url` e adiciona rotas padrão (login, admin, etc.).
5. Cria um `crawl_run` no banco para registrar estatísticas.
6. Inicia Playwright (`async_playwright`) com navegador headless.
7. Para cada nível de profundidade até `max_depth`:
   - Decide para cada URL se vai usar **`requests`** (quando a URL tem parâmetros, focando em status/content-type) ou **Playwright** (sem parâmetros, permitindo extração de links e formulários).
   - Calcula `status_code`, `content_type` e tenta obter `response_content`.
   - Classifica a URL como válida ou não (com confiança e motivo: redirect, auth requerida, 404 etc.).
   - Chama `RouteVulnerabilityDetector.analyze_route` para obter vulnerabilidades baseada na rota.
   - Usa `extract_url_parameters` + `scan_url_for_sqli` para testar **parâmetros GET** com payloads de SQL injection.
   - Para páginas carregadas via Playwright, usa `scan_forms_for_sqli` para testar **formulários** com payloads de SQLi.
   - Constrói um vetor `vulnerabilities` com todas as descobertas (heurísticas + SQLi em query + SQLi em formulários).
   - Calcula `risk_level` (CRITICAL/HIGH/MEDIUM/LOW) baseado na severidade máxima.
   - Chama `save_crawled_url` gravando:
     - URL, profundidade, status, content-type;
     - flags de validade, confiança e justificativa;
     - vulnerabilidades (JSON serializado);
     - nível de risco;
     - conteúdo de resposta (limitado) e headers.
   - Se a página for HTML e veio por Playwright, extrai links (`<a href=...>`) com BeautifulSoup, normaliza, limita ao mesmo host e adiciona novos URLs para próximos níveis.

Ao final, fecha o browser e chama `finalize_crawl_run` com estatísticas:

- `crawled_count`, `valid_urls`, `invalid_urls`, `total_vulnerabilities`, `summary` textual.

O retorno da função `crawl_from_scan` é um dicionário com mensagem, contagem de URLs e `crawl_run_id`.

### 3.4. Outros módulos relevantes

- `browser_inspector.py` – gerencia um browser persistente para inspeção mais rica (network, sources, storage) durante a interceptação.
- `common_routes.py` – conjunto de rotas comuns por framework/stack, usado pelo crawler para forçar descoberta de endpoints sensíveis típicos.
- `route_validator.py` – heurísticas adicionais de validação/classificação de rotas.
- `sqli_param_tester.py` – funções auxiliares para extrair parâmetros de URLs e testar com payloads de SQL injection, inclusive em formulários.
- `openrouter_client.py` – wrapper para chamadas ao OpenRouter (modelos de IA) com timeouts e tratamento de erro.

---

## 4. Banco de Dados (`backend/db/database.py`)

O módulo de banco encapsula todas as operações com SQLite, incluindo:

- Criação de tabelas (sessões, requisições interceptadas, resultados de análise de browser, URLs crawleadas, falsos positivos, configurações, etc.).
- Funções de leitura/escrita usadas pelos endpoints:
  - `init_db()` – inicialização do schema.
  - `get_history()`, `get_all_requests()`, `get_requests_by_session()`.
  - `get_analysis_result(session_id)`, `update_analysis_vulnerabilities(session_id, vulns)`.
  - `save_crawled_url(...)`, `create_crawl_run(...)`, `finalize_crawl_run(...)`, `clear_crawl_data()`, etc.
  - `get_false_positive_rules()`, `add_false_positive_rule(...)`, `update_false_positive_rule(...)`, `delete_false_positive_rule(...)`, `is_false_positive(...)`.
  - `save_setting(key, value)`, `get_setting(key)` para integrações como OpenRouter.

Ele é o ponto central para **persistir vulnerabilidades** e associá-las a sessões, URLs, runs de crawling e regras de falsos positivos.

---

## 5. Frontend (`frontend/`)

### 5.1. Stack

- Vue 3 + Composition API (`src/main.ts`, `src/App.vue`).
- Vite como bundler.
- Pinia para stores de estado (`src/stores/`).
- Componentes de alto nível em `src/views/` e `src/components/`.

### 5.2. Principais views

- `AnalysisView.vue` – consome `/analysis/{session_id}` para exibir vulnerabilidades agregadas, detalhes de resposta, evidências e explicações de IA.
- `CrawlingView.vue` – dispara crawling via endpoint correspondente (no backend) e mostra progresso/lista de URLs crawleadas.
- `TrafficView.vue` / `TrafficViewSimple.vue` – exibem as requisições interceptadas para uma sessão (`/requests/{session_id}`).
- `ConfigView.vue` / `SettingsView.vue` – gerenciam configurações do backend (por exemplo chave/modelo do OpenRouter via `/settings`).
- `VulnerabilitiesGuideView.vue` / `HttpCodesGuideView.vue` – documentação de apoio para interpretar achados.

### 5.3. Stores e utilitários

- `stores/traffic.ts` – coordena estado de tráfego capturado, sessões ativas e filtros.
- `utils/Base64Custom.ts` – rotinas utilitárias de codificação Base64 usadas para trafegar payloads complexos.
- `components/VulnerabilityInfo*.vue` – UI para detalhar e explicar vulnerabilidades retornadas pelo backend.

---

## 6. Como a Aplicação Detecta Vulnerabilidades

A detecção é feita em **camadas**, combinando diferentes estratégias:

1. **Interceptação de tráfego** (proxy + banco): cada requisição/resposta fica registrada com metadados, permitindo inspeção posterior de status, headers, corpo e tempo.
2. **Análise estática de conteúdo** (`analyzer.py`):
   - Regras de regex buscam padrões claramente perigosos (uso de `eval`, exposição de segredos, etc.).
   - Em caso de suspeita, IA (OpenRouter) é opcionalmente consultada para validar e enriquecer o diagnóstico.
3. **Heurística de rotas** (`route_vulnerability_detector.py`):
   - A partir de URLs e parâmetros, identifica classes de vulnerabilidade prováveis (SQLi, SSRF, Path Traversal, bypass de auth, etc.).
   - Marca severidade e confiança com base no tipo de endpoint e status HTTP.
4. **Crawling ativo + testes de SQLi** (`crawler.py` + `sqli_param_tester.py`):
   - Varre o site a partir das URLs coletadas e de rotas comuns.
   - Testa parâmetros de query e campos de formulários com payloads de SQL Injection.
   - Quando há indícios fortes (p. ex. mensagens de erro típicas, respostas inconsistentes), registra vulnerabilidades de SQLi com evidências e payloads.
5. **Regras de falsos positivos** (`database.is_false_positive` + `/reanalyze/{session_id}`):
   - Usuário pode cadastrar padrões que representam alerta falso para seu contexto.
   - A reanálise remove vulnerabilidades correspondentes, mantendo o relatório final mais limpo.

O resultado dessa pipeline é um conjunto rico de vulnerabilidades: cada uma com tipo/categoria, severidade, URL/rota, localização, evidências, payloads de teste e testes recomendados para confirmação manual.

---

## 7. Como Usar a Aplicação (Fluxo Técnico)

### 7.1. Preparar ambiente

1. Instalar dependências do backend (`backend/requirements.txt`) e Playwright.
2. Instalar frontend (`frontend/package.json`).
3. Iniciar o backend (FastAPI) e o frontend (Vite).
   > Conforme seu fluxo atual, o servidor backend é iniciado manualmente por você (não é responsabilidade desta documentação explicar scripts específicos de start).

### 7.2. Iniciar interceptação e sessão

1. Na UI, configurar alvo/proxy (conforme oferece o frontend).
2. Navegar pela aplicação alvo com o navegador apontando para o proxy.
3. Confirmar via `GET /proxy/status` ou UI equivalente que requisições estão sendo capturadas.

### 7.3. Executar análise de vulnerabilidades

1. Selecionar a sessão desejada (via UI ou `GET /history`).
2. Disparar crawling para essa sessão (via botão no frontend ou endpoint correspondente que chama `crawl_from_scan`).
3. Acompanhar progresso na view de crawling; URLs válidas, inválidas e vulnerabilidades aparecem agregadas.
4. Abrir a view de análise (`AnalysisView.vue`) para ver o resumo da sessão via `/analysis/{session_id}`.

### 7.4. Filtrar falsos positivos

1. Criar regras de falso positivo via UI ou endpoints `/false_positive_rules`.
2. Para uma sessão específica, chamar `/reanalyze/{session_id}` passando a lista de vulnerabilidades atuais (frontend já faz isso automaticamente).
3. Verificar o resumo retornado (quantas vulnerabilidades removidas, quais regras usadas).

### 7.5. Ajustar IA

1. Cadastrar ou alterar `openrouter_api_key` e `openrouter_model` via `/settings`.
2. Usar botões/ações no frontend que disparam explicações de vulnerabilidades individuais ou criação de relatórios (os endpoints internos chamam `openrouter_client` conforme necessário).

---

## 8. Extensão e Customização

- **Novas regras estáticas**: adicionar padrões em `analyzer.py` (regex adicionais) ou criar novos detectores especializados.
- **Novos tipos de rota/vulnerabilidade**: estender `VulnerabilityType` e `VULNERABILITY_PATTERNS` em `route_vulnerability_detector.py` (inclusão de regex, severidade e testes recomendados).
- **Novas estratégias de fuzzing**: aproveitar o esqueleto de `sqli_param_tester.py` para testar outros vetores (XSS, XXE, etc.) e acoplar no loop de `crawler.py`.
- **Personalização de relatórios**: usar os dados persistidos no banco (tabelas de vulnerabilidades, URLs, sessões, runs) para gerar relatórios formais externos (PDF, DOCX, etc.) em scripts sob `backend/scripts/`.

---

## 9. Referência Rápida de Módulos

- `backend/main.py` – API FastAPI, gestão de sessões, histórico, configurações, reanálise e integração com IA.
- `backend/src/analyzer.py` – análise estática de conteúdo + consulta opcional à IA.
- `backend/src/crawler.py` – crawling assíncrono, detecção de vulnerabilidades de rota e SQLi.
- `backend/src/route_vulnerability_detector.py` – heurística de rotas e classificação de risco.
- `backend/src/sqli_param_tester.py` – extração de parâmetros + testes ativos de SQL injection.
- `backend/src/browser_inspector.py` – inspeção dinâmica com Playwright.
- `backend/db/database.py` – todas as operações de persistência (sessões, requisições, vulnerabilidades, regras, configurações).
- `frontend/src/views/*` – telas principais: tráfego, análise, crawling, guias.
- `frontend/src/stores/*` – estado global (tráfego, configurações, etc.).

Este arquivo consolida a visão técnica de como a aplicação é organizada, como os módulos interagem e como a detecção de vulnerabilidades é conduzida ponta a ponta.
