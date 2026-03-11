# Plano de Merge: Develop -> Production (Neon DB)

**Data:** 07/02/2026
**Solicitante:** User
**Executor:** Trae AI (via MCP/CLI)

Este documento detalha o plano para realizar o "merge" (sincronização) de dados e schema da branch `develop` para a branch `production` no banco de dados Neon.

## ⚠️ Considerações Importantes

No Neon (Postgres), diferentemente do Git, não existe um comando nativo de "merge" que mescle dados linha a linha automaticamente entre branches.
*   **Schema (Estrutura):** Gerenciado via Prisma Migrations.
*   **Dados (Conteúdo):** Requer estratégia específica (Seed, Dump/Restore ou Reset).

## Estratégia Proposta

### 1. Preparação e Segurança (Backup)
Antes de qualquer alteração, garantiremos um ponto de restauração da produção atual.
*   **Ação:** Criar uma branch de backup a partir da `main`/`production` atual.
*   **Comando:** `neon branch create backup-prod-20260207 --from main` (ou via Console/MCP).

### 2. Sincronização de Schema (Estrutura)
Garantir que a estrutura das tabelas em produção esteja igual a de desenvolvimento.
*   **Ferramenta:** Prisma ORM.
*   **Ação:** Aplicar migrações pendentes.
*   **Comando:** `npx prisma migrate deploy`
    *   *Nota:* Isso deve ser rodado apontando para a Connection String de Produção.

### 3. Sincronização de Dados
Aqui precisamos definir o que significa "merge de dados" para este contexto.

#### Opção A: Atualização de Dados Cadastrais (Seeds) - **Recomendada**
Se o objetivo é atualizar tabelas de sistema (Status, Tipos, Configurações) que foram alteradas em Dev.
*   **Ação:** Executar o script de seed.
*   **Comando:** `npx prisma db seed`

#### Opção B: Reset Completo (Cópia Exata) - **Destrutiva**
Se o objetivo é fazer a produção ser *exatamente* igual ao desenvolvimento (sobrescrevendo dados reais de produção).
*   **Ação:** Resetar a branch main para o estado da develop (Compute + Data).
*   **Risco:** Perda de dados criados apenas em produção (novas faturas, logs, etc) desde a última sincronia.

#### Opção C: Migração de Dados Específica
Se houver tabelas específicas a serem copiadas.
*   **Ação:** Dump de tabelas específicas da develop e Restore na production.

## Plano de Execução Imediata (Padrão Seguro)

1.  **Verificar Conexão:** Confirmar acesso ao projeto Neon `cobranca_avantti`.
2.  **Backup:** Criar branch `backup-prod-pre-merge`.
3.  **Deploy de Schema:** Rodar `npx prisma migrate deploy` na env de produção.
4.  **Confirmação de Dados:** Aguardar instrução sobre qual estratégia de dados (A, B ou C) seguir.

---
**Status:** Aguardando aprovação do usuário para iniciar o Passo 1.
