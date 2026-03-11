# Plano de Migração de Banco de Dados (Produção)
**Data:** 23/01/2026
**Status:** Análise Pré-Deploy

## 1. Diagnóstico do Estado Atual

Foi realizada uma análise comparativa entre:
1.  **Schema do Banco de Produção** (URL: `...aws.neon.tech/intranet`)
2.  **Arquivos de Migração em Develop** (`src/lib/migrations/*.sql`)
3.  **Schema do Banco Local/Develop**

### Resultados da Análise
*   **Total de Migrações em Arquivo:** 64 arquivos.
*   **Total de Migrações Aplicadas em Produção:** 64 migrações.
*   **Sincronização:** O banco de produção está **100% sincronizado** com a base de código atual (branch develop). Todas as migrações, incluindo as recentes de 22/01/2026 (`fix_app_links_tenant`, `backfill_company_id`, etc.), já constam como aplicadas.

## 2. Funcionalidades Recentes (Login Screen Tenant)

A nova funcionalidade de "Configuração de Tenant na Tela de Login" utiliza a tabela `system_settings`.

*   **Tabela Alvo:** `system_settings`
*   **Colunas Necessárias:** `key`, `value`, `company_id`.
*   **Verificação:** A tabela já existe em produção e possui a coluna `company_id` (verificada via script de inspeção).
*   **Estratégia de Dados:**
    *   A aplicação foi desenvolvida para inserir automaticamente a chave `login_screen_tenant_id` caso não exista (`INSERT ... ON CONFLICT`).
    *   **Não é necessário** criar uma migração de schema (DDL) para esta feature.

## 3. Plano de Ação Recomendado

Como não há pendências de schema, o plano se resume a validação e monitoramento.

### Passo 1: Verificação de Sanidade (Opcional)
Para garantir que o ambiente está pronto para receber o novo código, pode-se executar a seguinte query de leitura (sem impacto):

```sql
-- Verificar se já existe alguma configuração de login salva
SELECT * FROM system_settings WHERE key = 'login_screen_tenant_id';
```

### Passo 2: Deploy da Aplicação
1.  Realizar o deploy do código (Next.js).
2.  Acessar a área de Super Admin -> Configurações do Sistema.
3.  Salvar a configuração de "Tenant da Tela de Login".
4.  Verificar se o registro foi criado no banco.

### Passo 3: Rollback (Se necessário)
Caso haja problemas com a nova lógica, reverter a versão do código (rollback do deploy) é suficiente, pois não houve alterações estruturais no banco de dados que quebrem a versão anterior.

## 4. Conclusão
**Nenhuma intervenção manual no banco de dados é necessária.** O ambiente de produção está pronto para receber a versão atual da branch `develop`.
