# 🔄 Workflow de Banco de Dados (Neon)

Este guia descreve o fluxo de trabalho para gerenciamento de branches do banco de dados Neon (Serverless Postgres), utilizado tanto em desenvolvimento quanto em produção.

## 1. Conceito Fundamental

O projeto utiliza o conceito de **Database Branching**:

- **Production:** Branch principal, contém dados reais. Conectada ao ambiente de produção (Docker Swarm).
- **Develop:** Branch de desenvolvimento, cópia (fork) da produção em um determinado momento. Conectada ao ambiente local (`.env.local`).

### Regras de Ouro

1.  **Independência:** Mudanças de dados em `production` NÃO afetam `develop` automaticamente (e vice-versa).
2.  **Schema:** Alterações de estrutura (tabelas, colunas) são aplicadas via migrações (`src/lib/migrations`), garantindo consistência.
3.  **Sync Manual:** A sincronização de dados (trazer dados reais para dev) é um processo manual e intencional.

## 2. Connection Strings

As URLs de conexão são gerenciadas via variáveis de ambiente.

- **Produção:** `DATABASE_URL` definida no Docker Swarm / Secret.
- **Desenvolvimento:** `DATABASE_URL` definida no arquivo `.env.local`.

## 3. Cenários de Uso

### Cenário A: Atualizar Develop com dados de Produção

_Quando: Você precisa testar uma funcionalidade com dados reais recentes ou seu banco local está "sujo"._

**⚠️ Aviso:** Isso **APAGA** todos os dados atuais da branch `develop` e a substitui por uma cópia fresca de `production`.

```bash
# Usando neonctl (CLI)
# 1. (Opcional) Ver diferenças de schema
neonctl branches schema-diff develop production --project-id <PROJECT_ID>

# 2. Resetar develop para ser igual a production
neonctl branches restore develop production --project-id <PROJECT_ID>
```

### Cenário B: Criar uma nova branch de Feature

_Quando: Você vai trabalhar em uma mudança complexa de banco de dados e não quer quebrar o ambiente de develop compartilhado._

```bash
# Criar branch 'feature-x' a partir de 'develop'
neonctl branches create --name feature-x --parent develop --project-id <PROJECT_ID>

# Atualize seu .env.local com a nova URL gerada
```

### Cenário C: Deploy em Produção

O deploy de schema em produção é **automático** via script de migração na inicialização da aplicação (ver [Deploy e Migrações](DATABASE_MIGRATION_DEPLOYMENT.md)).
Não é necessário rodar comandos manuais de DDL (CREATE/ALTER) no banco de produção.

## 4. Comandos Úteis (Cheat Sheet)

| Ação                  | Comando                                      |
| --------------------- | -------------------------------------------- |
| Listar branches       | `neonctl branches list`                      |
| Ver connection string | `neonctl connection-string <branch_name>`    |
| Restaurar branch      | `neonctl branches restore <target> <source>` |

## 5. Referências

- [Documentação Oficial Neon](https://neon.tech/docs)
- [Deploy e Migrações](DATABASE_MIGRATION_DEPLOYMENT.md)
