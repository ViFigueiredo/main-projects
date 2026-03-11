# Sistema de Logging Estruturado

## Visão Geral

Sistema de logging profissional com:
- ✅ Logs estruturados em JSON (produção) ou legíveis (desenvolvimento)
- ✅ Separação por empresa (companyId)
- ✅ Categorização por módulo/tecnologia
- ✅ Ofuscação automática de credenciais e dados sensíveis
- ✅ Níveis de log (DEBUG, INFO, WARN, ERROR)
- ✅ Contexto rico (operação CRUD, rota, timing, etc)
- ✅ Filtro de erros esperados (401, 403, 404)

## Uso Básico

```typescript
import { logger, LogCategory, OperationType } from "@/lib/logger";

// Log simples
logger.info(LogCategory.SYSTEM, "Aplicação iniciada");

// Log com contexto
logger.info(LogCategory.API, "Instância criada", {
  companyId: "abc123",
  instanceId: "inst_456",
  operation: OperationType.CREATE,
});

// Log de erro
logger.error(
  LogCategory.DATABASE,
  "Falha ao conectar",
  error,
  { companyId: "abc123" }
);
```

## Uso em APIs

```typescript
import { getRequestContext, logApiSuccess, logApiError } from "@/lib/logger/api-logger";
import { OperationType } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const session = await getSessionFromRequest(request);
  const context = getRequestContext(request, session);

  try {
    // ... sua lógica aqui ...
    
    logApiSuccess(OperationType.CREATE, "/api/v1/instances", context, startTime);
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError(
      OperationType.CREATE,
      "/api/v1/instances",
      error as Error,
      context,
      startTime,
      500
    );
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

## Uso em Providers

```typescript
import { logProviderOperation, logProviderError, logMessageSend } from "@/lib/logger/provider-logger";

// Log de operação
logProviderOperation("WUZAPI", "getStatus", {
  companyId: "abc123",
  instanceId: "inst_456",
});

// Log de erro (filtra 401, 403, 404 automaticamente)
logProviderError("WUZAPI", "getStatus", error, {
  companyId: "abc123",
  instanceId: "inst_456",
});

// Log de envio de mensagem
logMessageSend("WUZAPI", {
  companyId: "abc123",
  instanceId: "inst_456",
  phone: "5511999999999",
  messageType: "text",
  success: true,
});
```

## Uso em Campanhas

```typescript
import { logger, LogCategory } from "@/lib/logger";

logger.campaign("Campanha iniciada", campaignId, {
  companyId: "abc123",
  totalLeads: 100,
  instanceId: "inst_456",
});
```

## Uso em Billing

```typescript
import { logger } from "@/lib/logger";

logger.billing("Pagamento confirmado", {
  companyId: "abc123",
  planId: "plan_789",
  amount: 99.90,
  paymentId: "pay_123",
});
```

## Categorias Disponíveis

### Tecnologias/Providers
- `WUZAPI` - Provider WUZAPI
- `UAZAPI` - Provider UAZAPI
- `PAPI` - Provider PAPI
- `META_CLOUD` - Meta Cloud API
- `AWS_S3` - AWS S3

### Módulos do Sistema
- `AUTH` - Autenticação
- `API` - APIs REST
- `CAMPAIGN` - Campanhas
- `INSTANCE` - Instâncias WhatsApp
- `LEAD` - Leads/Contatos
- `MESSAGE` - Mensagens
- `BILLING` - Faturamento
- `WEBHOOK` - Webhooks
- `QUEUE` - Filas
- `SCHEDULER` - Agendador
- `DATABASE` - Banco de dados

### Infraestrutura
- `BULLMQ` - BullMQ
- `QSTASH` - QStash
- `PRISMA` - Prisma ORM
- `SYSTEM` - Sistema geral

## Tipos de Operação

- `CREATE` - Criação
- `READ` - Leitura
- `UPDATE` - Atualização
- `DELETE` - Deleção
- `SEND` - Envio
- `CONNECT` - Conexão
- `DISCONNECT` - Desconexão
- `SCHEDULE` - Agendamento
- `PROCESS` - Processamento
- `VALIDATE` - Validação
- `AUTHENTICATE` - Autenticação

## Ofuscação Automática

O sistema ofusca automaticamente campos sensíveis:
- password, token, apiKey, apiToken
- userToken, adminToken, instanceToken
- accessToken, refreshToken, secret
- privateKey, authorization, x-api-key
- cookie, session

Exemplo:
```typescript
logger.info(LogCategory.API, "Request", {
  apiToken: "abc123def456ghi789",
  userId: "user_123",
});

// Output: { apiToken: "abc1...i789", userId: "user_123" }
```

## Formato de Saída

### Desenvolvimento
```
[2024-01-14T10:30:00.000Z] [INFO] [API] POST /api/v1/instances {
  "companyId": "abc123",
  "operation": "CREATE",
  "duration": 150
}
```

### Produção (JSON)
```json
{
  "timestamp": "2024-01-14T10:30:00.000Z",
  "level": "INFO",
  "category": "API",
  "message": "POST /api/v1/instances",
  "context": {
    "companyId": "abc123",
    "operation": "CREATE",
    "duration": 150
  }
}
```

## Integração com Serviços Externos

O logger está preparado para integração com:
- **Sentry** - Rastreamento de erros
- **DataDog** - Métricas e APM
- **CloudWatch Logs** - Logs AWS
- **Elasticsearch** - Busca e análise
- **Grafana Loki** - Agregação de logs

Para adicionar integração, edite o método `log()` em `lib/logger/index.ts`.

## Boas Práticas

1. **Sempre inclua companyId** quando disponível
2. **Use o contexto apropriado** para cada tipo de log
3. **Não logue dados sensíveis** manualmente (o sistema já ofusca)
4. **Use DEBUG apenas em desenvolvimento**
5. **Inclua timing** em operações importantes
6. **Adicione IDs relevantes** (instanceId, campaignId, etc)

## Exemplos Completos

### API de Criação de Instância
```typescript
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const session = await getSessionFromRequest(request);
  const context = getRequestContext(request, session);

  try {
    const body = await request.json();
    
    const instance = await prisma.instance.create({
      data: {
        name: body.name,
        provider: body.provider,
        companyId: session.companyId,
      },
    });

    logApiSuccess(OperationType.CREATE, request.nextUrl.pathname, {
      ...context,
      instanceId: instance.id,
      provider: instance.provider,
    }, startTime);

    return NextResponse.json({ instance });
  } catch (error) {
    logApiError(
      OperationType.CREATE,
      request.nextUrl.pathname,
      error as Error,
      context,
      startTime,
      500
    );
    return NextResponse.json({ error: "Failed to create instance" }, { status: 500 });
  }
}
```

### Provider com Logging
```typescript
async getStatus(instanceData: Record<string, unknown>): Promise<InstanceStatus> {
  const context = {
    instanceId: instanceData.instanceId as string,
    companyId: instanceData.companyId as string,
  };

  try {
    logProviderOperation("WUZAPI", "getStatus", context);
    
    const result = await this.userRequest(/* ... */);
    
    logInstanceStatus("WUZAPI", context.instanceId, result.status, context);
    
    return { status: result.status };
  } catch (error) {
    logProviderError("WUZAPI", "getStatus", error as Error, context);
    return { status: "disconnected" };
  }
}
```

### Campanha com Logging
```typescript
async function startCampaign(campaignId: string, companyId: string) {
  logger.campaign("Iniciando campanha", campaignId, {
    companyId,
    timestamp: new Date().toISOString(),
  });

  try {
    // ... lógica da campanha ...
    
    logger.campaign("Campanha iniciada com sucesso", campaignId, {
      companyId,
      totalMessages: 100,
      duration: 1500,
    });
  } catch (error) {
    logger.error(LogCategory.CAMPAIGN, "Falha ao iniciar campanha", error as Error, {
      companyId,
      campaignId,
    });
  }
}
```
