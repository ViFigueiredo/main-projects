# Exemplos de Uso do Neon Database

## Seu Setup Atual

- **Projeto:** Portal_Avantti
- **ID:** restless-morning-33051903
- **Região:** aws-us-east-1
- **Branches:**
  - `br-bold-cloud-ad7sd46x` (principal)
  - `production`

## 1. Criar uma Branch para Desenvolvimento

```bash
# Criar uma nova branch de desenvolvimento
neonctl branches create --project-id restless-morning-33051903 --name development

# Pegar a connection string da nova branch
neonctl connection-string --project-id restless-morning-33051903 --branch development --role-name neondb_owner
```

Adicione ao `.env.local`:
```env
DATABASE_URL_DEV="postgresql://..."
```

## 2. Testar Mudanças de Schema com Segurança

```bash
# Criar branch para testar uma migração
neonctl branches create --project-id restless-morning-33051903 --name migration-test

# Pegar connection string
neonctl connection-string --project-id restless-morning-33051903 --branch migration-test --role-name neondb_owner
```

Agora você pode testar mudanças sem afetar produção!

## 3. Executar SQL Diretamente

```bash
# Listar todas as tabelas
neonctl sql --project-id restless-morning-33051903 "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"

# Contar usuários
neonctl sql --project-id restless-morning-33051903 "SELECT COUNT(*) FROM users;"

# Criar uma tabela de teste
neonctl sql --project-id restless-morning-33051903 --branch development "
  CREATE TABLE test_table (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
"
```

## 4. Usar no Código (já configurado!)

Seu arquivo `src/lib/db.ts` já está usando o Neon:

```typescript
import postgres from 'postgres';

const db = postgres(process.env.DATABASE_URL!);

// Exemplo de query
const users = await db`SELECT * FROM users WHERE is_admin = true`;

// Exemplo de insert
await db`
  INSERT INTO users (email, password_hash, is_admin)
  VALUES (${email}, ${passwordHash}, false)
`;
```

## 5. Recursos Únicos do Neon

### Autoscaling
Seu banco escala automaticamente baseado na carga. Sem configuração necessária!

### Scale-to-Zero
Branches de desenvolvimento suspendem automaticamente após inatividade, economizando custos.

### Point-in-Time Recovery
```bash
# Restaurar para um ponto específico no tempo
neonctl branches create --project-id restless-morning-33051903 \
  --name recovery-point \
  --parent production \
  --timestamp "2025-12-09T10:00:00Z"
```

## 6. Workflow Recomendado

1. **Desenvolvimento:** Use uma branch `development` para trabalho diário
2. **Testes:** Crie branches temporárias para testar migrações
3. **Produção:** Mantenha a branch `production` estável
4. **Limpeza:** Delete branches antigas após merge

```bash
# Listar branches
neonctl branches list --project-id restless-morning-33051903

# Deletar branch antiga
neonctl branches delete --project-id restless-morning-33051903 --branch migration-test
```

## 7. Monitoramento

Acesse o console do Neon para ver:
- Uso de compute e storage
- Queries mais lentas
- Conexões ativas
- Métricas de performance

**Console:** https://console.neon.tech/app/projects/restless-morning-33051903

## Comandos Úteis

```bash
# Ver informações do projeto
neonctl projects get restless-morning-33051903

# Listar databases
neonctl databases list --project-id restless-morning-33051903

# Ver roles/usuários
neonctl roles list --project-id restless-morning-33051903

# Ver operações recentes
neonctl operations list --project-id restless-morning-33051903
```
