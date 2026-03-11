# SYSTEM_DESIGN

## 1. Objetivo

Descrever o desenho do sistema do **WhatsUpLeads**, plataforma SaaS multi-tenant para campanhas WhatsApp com execução assíncrona.

## 2. Contexto Técnico

- Framework: Next.js (App Router) + TypeScript
- Persistência: PostgreSQL com Prisma (suporte Neon)
- Fila e jobs: Redis + BullMQ
- Integrações: provedores WhatsApp (PAPI, UazAPI, WuzAPI, Meta Cloud)
- Deploy: Docker/Docker Swarm + CI/CD

## 3. Arquitetura de Alto Nível

1. **Camada Web**
   - Interface administrativa, CRM e módulos de campanha
2. **Camada API**
   - Endpoints Next.js para autenticação, gestão e automação
3. **Camada assíncrona**
   - Worker dedicado para filas de envio/processamento
4. **Camada de dados**
   - PostgreSQL para entidades de negócio e Redis para filas/cache
5. **Integração externa**
   - Adaptadores por provedor WhatsApp

## 4. Fluxos Críticos

### 4.1 Disparo de campanha

1. Usuário configura campanha e público
2. API valida regras e enfileira lotes
3. Worker processa mensagens por provedor
4. Status e métricas retornam para o painel

### 4.2 Multi-tenant

1. Sessão identifica tenant/empresa
2. API aplica escopo de dados por tenant
3. Operações são auditáveis e segregadas

## 5. Segurança

- Autenticação e autorização por papéis
- Validação de entrada com schemas
- Proteção de segredos via env vars
- Regras de acesso por tenant em toda operação de dados

## 6. Operação e Deploy

- App web e worker executam como serviços independentes
- Migração de banco automatizada no pipeline/deploy
- Suporte a deploy em Swarm com runbooks dedicados

## 7. Riscos Técnicos

- Dependência de estabilidade dos provedores WhatsApp
- Acúmulo de filas em picos sem autoscaling adequado
- Custos de infra aumentando com throughput de campanhas
