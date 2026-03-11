# SYSTEM_DESIGN

## 1. Objetivo

Descrever o desenho arquitetural do **DataSniffer-AI** para análise de segurança web com processamento em tempo real e suporte multi-tenant.

## 2. Contexto Técnico

- Frontend: Vue 3 + TypeScript + Vite + PrimeVue
- Backend: FastAPI (Python) + WebSocket
- Módulos de análise: mitmproxy, Playwright, crawler, fuzzing
- Persistência e auth: Supabase (PostgreSQL + RLS)
- IA: integração via OpenRouter para explicações de vulnerabilidades

## 3. Arquitetura de Alto Nível

1. **Camada UI**
   - Sessões, tráfego, análises e configurações
2. **Camada API**
   - Endpoints REST e canal WebSocket
3. **Camada de motores de análise**
   - Proxy interceptador, browser automation, crawler e fuzzer
4. **Camada de dados**
   - Supabase com isolamento por usuário/tenant via RLS

## 4. Fluxos Críticos

### 4.1 Sessão de análise

1. Usuário autentica e inicia sessão
2. Backend aciona módulos de captura/análise
3. Eventos fluem em tempo real por WebSocket
4. Achados são persistidos no Supabase

### 4.2 Gestão de falsos positivos

1. Usuário cria regras (regex/wildcard/padrões)
2. Backend aplica regras no pipeline de detecção
3. Resultado final prioriza achados acionáveis

## 5. Segurança

- JWT com expiração controlada
- RLS ativo no banco para isolamento de dados
- Limites de requisição e validação de input em endpoints críticos
- Proteção para credenciais e segredos via variáveis de ambiente

## 6. Operação

- Backend: `python main.py`
- Frontend: `pnpm dev`
- Dependências de análise (mitmproxy/playwright) devem ser versionadas e monitoradas

## 7. Riscos Técnicos

- Alto consumo de CPU/memória em análises profundas paralelas
- Dependência de componentes externos (browser/proxy/IA)
- Ruído em detecção sem governança de regras

## 8. Próximos Passos

- Isolar workers de análise em processos dedicados
- Padronizar trilha de auditoria por sessão
- Definir contratos de versionamento para resultados de scanner
