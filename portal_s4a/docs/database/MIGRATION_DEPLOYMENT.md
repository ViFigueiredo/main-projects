# Guia de Migrações de Banco de Dados e Deploy Seguro

Este documento descreve como funciona o sistema de migrações de banco de dados do projeto, com foco especial na automação e segurança durante o processo de deploy em produção.

## 1. Visão Geral

O projeto utiliza um sistema de migrações baseado em SQL puro (`.sql`), gerenciado automaticamente pela aplicação ao iniciar. Este sistema garante que o schema do banco de dados esteja sempre sincronizado com a versão do código em execução, sem necessidade de intervenção manual perigosa.

**Principais Componentes:**
*   **Diretório de Migrações:** `src/lib/migrations/*.sql`
*   **Tabela de Controle:** `schema_migrations` (no banco de dados)
*   **Executor:** `src/instrumentation.ts` e `src/lib/migrations/runner.ts`

## 2. Automação no Startup

Ao realizar o deploy em produção, o script de inicialização do Next.js (`instrumentation.ts`) é executado automaticamente antes que a aplicação comece a receber requisições.

### O Fluxo de Execução:
1.  **Inicialização do Servidor:** O container Docker sobe e inicia o processo Node.js.
2.  **Hook de Instrumentação:** O arquivo `src/instrumentation.ts` é acionado.
3.  **Verificação de Migrações:** O sistema lê todos os arquivos `.sql` na pasta de migrações.
4.  **Comparação com o Banco:** Consulta a tabela `schema_migrations` para identificar quais arquivos já foram aplicados.
5.  **Aplicação Sequencial:** Apenas as **novas** migrações são executadas, na ordem correta (alfabética/data).
6.  **Inicialização de Tabelas Base:** Executa `initializeDb()` para garantir tabelas core (como `employees`) caso não existam.

> **Nota:** Se todas as migrações já estiverem aplicadas, o sistema não faz nada e inicia a aplicação imediatamente.

## 3. Mecanismos de Segurança

O processo foi desenhado para ser seguro e não destrutivo (idempotente).

### 3.1. Tabela de Rastreamento (`schema_migrations`)
Cada migração executada com sucesso é registrada nesta tabela com seu nome, data de execução e checksum. Isso impede que o mesmo script rode duas vezes.

### 3.2. Idempotência (IF NOT EXISTS)
As migrações e scripts de inicialização utilizam cláusulas de segurança do SQL:
*   `CREATE TABLE IF NOT EXISTS`: Cria a tabela apenas se ela não existir.
*   `ADD COLUMN IF NOT EXISTS`: Adiciona colunas apenas se faltarem.
*   `DO $$ ... END $$`: Blocos PL/PGSQL para lógicas condicionais complexas.

Isso significa que mesmo se o script rodar acidentalmente em um banco atualizado, ele não causará erros nem apagará dados.

### 3.3. Transações Atômicas
Idealmente, cada arquivo de migração deve ser escrito para rodar dentro de uma transação. Se ocorrer um erro no meio do script, todas as alterações daquele script específico são revertidas, mantendo o banco em um estado consistente.

## 4. Processo de Deploy em Produção

Quando você executa o script de deploy (`scripts/deploy-production.ps1`):

1.  A nova imagem Docker é construída com o código atualizado e os arquivos `.sql` mais recentes.
2.  A imagem é enviada para o registro (GitHub Container Registry).
3.  O Docker Swarm atualiza os serviços em produção.
4.  Assim que os novos containers iniciam, o processo de migração descrito acima (Seção 2) roda automaticamente.

**Resultado:** O banco de dados é atualizado "Just-in-Time" para suportar as novas funcionalidades do código, sem downtime manual.

## 5. Procedimentos de Rollback e Erros

### Em caso de falha na migração:
O processo de inicialização irá logar o erro (`console.error`), mas por padrão em produção, ele pode permitir que a aplicação tente subir (dependendo da configuração `isProduction` no `instrumentation.ts`).
*   **Ação:** Verificar os logs do container para identificar o erro SQL específico.
*   **Correção:** Criar uma nova migração de correção (`fix_...sql`) e realizar um novo deploy. Evite editar arquivos de migração já aplicados.

### Em caso de necessidade de Rollback de Código:
Se você reverter a versão do Docker image para a anterior:
*   O código antigo rodará contra o banco de dados "novo" (já migrado).
*   Como as migrações são aditivas (criam tabelas, adicionam colunas), o código antigo geralmente continua funcionando (ignora as novas colunas).
*   **Cuidado:** Evite migrações destrutivas (DROP COLUMN) sem um período de transição/depreciação.

## 6. Referências de Código

*   **Hook de Inicialização:** [`src/instrumentation.ts`](../src/instrumentation.ts)
*   **Runner de Migração:** [`src/lib/migrations/runner.ts`](../src/lib/migrations/runner.ts)
*   **Configuração de Banco:** [`src/lib/db.ts`](../src/lib/db.ts)
