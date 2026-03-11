# Resumo do Sistema de Logging

## 📁 Estrutura Criada

```
lib/logger/
├── index.ts                    # Sistema principal de logging
├── api-logger.ts               # Helpers para APIs
├── provider-logger.ts          # Helpers para Providers
├── README.md                   # Documentação completa
├── MIGRATION.md                # Guia de migração
├── SUMMARY.md                  # Este arquivo
└── examples/
    ├── api-route-example.ts    # Exemplo de rota de API
    └── provider-example.ts     # Exemplo de provider
```

## ✨ Características Principais

### 1. Logs Estruturados
- **Desenvolvimento**: Formato legível com cores
- **Produção**: JSON estruturado para parsing

### 2. Separação por Empresa
- Todos os logs incluem `companyId` quando disponível
- Facilita debugging multi-tenant
- Permite filtrar logs por cliente

### 3. Categorização
- **Providers**: WUZAPI, UAZAPI, PAPI, META_CLOUD, AWS_S3
- **Módulos**: AUTH, API, CAMPAIGN, INSTANCE, LEAD, MESSAGE, BILLING
- **Infraestrutura**: BULLMQ, QSTASH, PRISMA, SYSTEM

### 4. Ofuscação Automática
Campos sensíveis são automaticamente ofuscados:
- Tokens (apiToken, userToken, accessToken, etc)
- Senhas (password, secret, privateKey)
- Credenciais (authorization, x-api-key, cookie)

**Exemplo:**
```typescript
// Input
{ apiToken: "abc123def456ghi789", userId: "user_123" }

// Output
{ apiToken: "abc1...i789", userId: "user_123" }
```

### 5. Contexto Rico
Cada log pode incluir:
- `companyId` - ID da empresa
- `userId` - ID do usuário
- `instanceId` - ID da instância
- `campaignId` - ID da campanha
- `route` - Rota da API
- `operation` - Tipo de operação (CREATE, READ, UPDATE, DELETE, etc)
- `duration` - Tempo de execução em ms
- `statusCode` - Código HTTP de resposta

### 6. Filtro de Erros Esperados
Erros 401, 403 e 404 não são logados por padrão nos providers, pois são esperados quando:
- Credenciais são inválidas
- Instância não existe mais
- Sessão expirou

## 🚀 Como Usar

### Logs Simples
```typescript
import { logger, LogCategory } from "@/lib/logger";

logger.info(LogCategory.SYSTEM, "Aplicação iniciada");
logger.error(LogCategory.DATABASE, "Falha ao conectar", error);
```

### Logs de API
```typescript
import { getRequestContext, logApiSuccess, logApiError } from "@/lib/logger/api-logger";
import { OperationType } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const session = await getSessionFromRequest(request);
  const context = getRequestContext(request, session);

  try {
    // ... sua lógica ...
    logApiSuccess(OperationType.CREATE, "/api/v1/instances", context, startTime);
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError(OperationType.CREATE, "/api/v1/instances", error as Error, context, startTime, 500);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
```

### Logs de Provider
```typescript
import { logProviderOperation, logProviderError } from "@/lib/logger/provider-logger";

async getStatus(instanceData: Record<string, unknown>): Promise<InstanceStatus> {
  const context = {
    companyId: instanceData.companyId as string,
    instanceId: instanceData.instanceId as string,
  };

  try {
    logProviderOperation("WUZAPI", "getStatus", context);
    const result = await this.makeRequest(/* ... */);
    return { status: result.status };
  } catch (error) {
    logProviderError("WUZAPI", "getStatus", error as Error, context);
    return { status: "disconnected" };
  }
}
```

## 📊 Formato de Saída

### Desenvolvimento
```
[2024-01-14T10:30:00.000Z] [INFO] [API] CREATE /api/v1/instances {
  "companyId": "abc123",
  "instanceId": "inst_456",
  "provider": "WUZAPI",
  "duration": 150,
  "statusCode": 201
}
```

### Produção (JSON)
```json
{
  "timestamp": "2024-01-14T10:30:00.000Z",
  "level": "INFO",
  "category": "API",
  "message": "CREATE /api/v1/instances",
  "context": {
    "companyId": "abc123",
    "instanceId": "inst_456",
    "provider": "WUZAPI",
    "operation": "CREATE",
    "duration": 150,
    "statusCode": 201
  }
}
```

## 🔌 Integração com Serviços Externos

O sistema está preparado para integração com:

### Sentry (Rastreamento de Erros)
```typescript
// Em lib/logger/index.ts, método log()
if (level === LogLevel.ERROR && process.env.SENTRY_DSN) {
  Sentry.captureException(error, {
    tags: { category, companyId: context?.companyId },
    extra: context,
  });
}
```

### DataDog (Métricas e APM)
```typescript
// Em lib/logger/index.ts, método log()
if (process.env.DATADOG_API_KEY) {
  datadogLogger.log(entry);
}
```

### CloudWatch Logs (AWS)
```typescript
// Em lib/logger/index.ts, método log()
if (process.env.AWS_CLOUDWATCH_GROUP) {
  cloudwatch.putLogEvents({
    logGroupName: process.env.AWS_CLOUDWATCH_GROUP,
    logStreamName: context?.companyId || "default",
    logEvents: [{ message: formatted, timestamp: Date.now() }],
  });
}
```

## 📝 Próximos Passos

### Migração Gradual
1. ✅ Sistema de logging criado
2. ⏳ Migrar rotas de API principais
3. ⏳ Migrar providers (WUZAPI, UAZAPI, PAPI)
4. ⏳ Migrar workers e schedulers
5. ⏳ Migrar webhooks
6. ⏳ Adicionar integração com Sentry/DataDog

### Prioridades
1. **Alta**: APIs v1 (instances, campaigns, messages)
2. **Média**: Providers e workers
3. **Baixa**: Webhooks e utilitários

## 🎯 Benefícios

✅ **Debugging mais fácil** - Logs estruturados e pesquisáveis
✅ **Multi-tenancy** - Separação por empresa
✅ **Segurança** - Ofuscação automática de credenciais
✅ **Performance** - Menos logs em produção
✅ **Observabilidade** - Pronto para APM e monitoramento
✅ **Compliance** - Não expõe dados sensíveis
✅ **Escalabilidade** - Formato JSON para agregação

## 📚 Documentação

- `README.md` - Documentação completa com exemplos
- `MIGRATION.md` - Guia de migração do console.log
- `examples/` - Exemplos práticos de uso

## 🔧 Configuração

Nenhuma configuração adicional necessária! O sistema funciona out-of-the-box.

Para integração com serviços externos, adicione as variáveis de ambiente:
```env
# Sentry
SENTRY_DSN=https://...

# DataDog
DATADOG_API_KEY=...

# CloudWatch
AWS_CLOUDWATCH_GROUP=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

## 💡 Dicas

1. **Sempre inclua companyId** quando disponível
2. **Use timing** em operações importantes (startTime)
3. **Adicione IDs relevantes** (instanceId, campaignId, etc)
4. **Não logue dados sensíveis** manualmente (o sistema já ofusca)
5. **Use DEBUG apenas em desenvolvimento**
6. **Prefira contexto rico** a mensagens longas
