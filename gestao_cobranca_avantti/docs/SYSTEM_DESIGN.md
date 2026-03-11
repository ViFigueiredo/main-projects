# SYSTEM_DESIGN

## 1. Objetivo

Definir o desenho do sistema do **gestao_cobranca_avantti**, cobrindo frontend, backend, dados, storage e segurança.

## 2. Contexto Técnico

- Framework: Nuxt 4 + TypeScript
- UI: PrimeVue + Tailwind
- Backend: endpoints H3 em `server/api`
- Banco: Neon PostgreSQL via Prisma
- Storage: S3 compatível (Backblaze B2)
- Monitoramento: Sentry

## 3. Arquitetura de Alto Nível

1. **Camada de apresentação**
   - Dashboards, relatórios e módulos operacionais
2. **Camada de aplicação**
   - Regras de cobrança, autorização por papel e escopo
3. **Camada de dados**
   - Prisma para persistência e migrações
4. **Camada de integração**
   - Upload/consulta de documentos no S3 compatível

## 4. Fluxos Críticos

### 4.1 Acesso autenticado e autorização

1. Usuário autentica e recebe sessão/token
2. Backend valida papel e escopo antes da operação
3. Operações sensíveis (usuários, exportações) exigem perfil autorizado

### 4.2 Operação de cobrança

1. Filtros e consultas no frontend
2. API valida payload e permissões
3. Prisma executa query com escopo definido
4. Resultado alimenta visão de gestão e relatórios

### 4.3 Upload de arquivos

1. Cliente envia arquivo para endpoint interno
2. Backend valida tipo/tamanho/permissão
3. Arquivo é persistido em bucket S3 compatível
4. Metadados e vínculo de negócio ficam no banco

## 5. Segurança e Compliance Técnico

- Validação com Zod em entrada externa
- Hardening via `nuxt-security`
- Controle de acesso por papéis e regras de negócio
- Auditoria de ações sensíveis e identificação do ator

## 6. Operação e Deploy

- Build com `prisma migrate deploy` antes de `nuxt build`
- Opção de deploy em Vercel e Docker Swarm
- Configuração 100% via variáveis de ambiente

## 7. Riscos Técnicos

- Crescimento de complexidade de autorização por papéis + escopos
- Dependência de índices corretos para consultas analíticas
- Carga operacional em exportações e relatórios pesados
