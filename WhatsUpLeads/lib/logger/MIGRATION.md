# Guia de Migração para o Novo Sistema de Logging

## Substituições Comuns

### 1. Console.log simples

**Antes:**
```typescript
console.log("[WUZAPI] Status response:", result);
```

**Depois:**
```typescript
import { logProviderResponse } from "@/lib/logger/provider-logger";

logProviderResponse("WUZAPI", "getStatus", result, {
  companyId,
  instanceId,
});
```

### 2. Console.error

**Antes:**
```typescript
console.error("[WUZAPI] Erro ao obter status:", error);
```

**Depois:**
```typescript
import { logProviderError } from "@/lib/logger/provider-logger";

logProviderError("WUZAPI", "getStatus", error as Error, {
  companyId,
  instanceId,
});
```

### 3. Logs de API

**Antes:**
```typescript
export async function POST(request: NextRequest) {
  try {
    // ... lógica ...
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
```

**Depois:**
```typescript
import { getRequestContext, logApiSuccess, logApiError } from "@/lib/logger/api-logger";
import { OperationType } from "@/lib/logger";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const session = await getSessionFromRequest(request);
  const context = getRequestContext(request, session);

  try {
    // ... lógica ...
    
    logApiSuccess(OperationType.CREATE, request.nextUrl.pathname, context, startTime);
    return NextResponse.json({ success: true });
  } catch (error) {
    logApiError(
      OperationType.CREATE,
      request.nextUrl.pathname,
      error as Error,
      context,
      startTime,
      500
    );
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
```

### 4. Logs de Queue/Scheduler

**Antes:**
```typescript
console.log("[SCHEDULER] Agendando mensagem:", { phone, delay });
```

**Depois:**
```typescript
import { logger, LogCategory } from "@/lib/logger";

logger.info(LogCategory.SCHEDULER, "Agendando mensagem", {
  companyId,
  campaignId,
  phone,
  delay,
});
```

### 5. Logs de Billing

**Antes:**
```typescript
console.log("[BILLING] Pagamento confirmado:", paymentId);
```

**Depois:**
```typescript
import { logger } from "@/lib/logger";

logger.billing("Pagamento confirmado", {
  companyId,
  paymentId,
  amount,
  planId,
});
```

## Arquivos Prioritários para Migração

### Alta Prioridade (APIs principais)
1. `app/api/v1/instances/route.ts`
2. `app/api/v1/instances/[id]/route.ts`
3. `app/api/v1/campaigns/route.ts`
4. `app/api/v1/messages/send/route.ts`
5. `app/api/auth/login/route.ts`

### Média Prioridade (Providers)
1. `lib/providers/wuzapi.provider.ts`
2. `lib/providers/uazapi.provider.ts`
3. `lib/providers/papi.provider.ts`
4. `lib/providers/meta-cloud.provider.ts`

### Baixa Prioridade (Workers e Webhooks)
1. `lib/queue/campaign-worker.ts`
2. `lib/queue/bullmq.ts`
3. `lib/webhooks/forwarder.ts`

## Checklist de Migração

- [ ] Importar helpers de logging apropriados
- [ ] Substituir console.log por logger.info/debug
- [ ] Substituir console.error por logger.error
- [ ] Substituir console.warn por logger.warn
- [ ] Adicionar contexto (companyId, instanceId, etc)
- [ ] Adicionar timing em operações importantes
- [ ] Remover logs de debug desnecessários
- [ ] Testar em desenvolvimento
- [ ] Verificar formato JSON em produção

## Benefícios Após Migração

✅ Logs estruturados e pesquisáveis
✅ Separação por empresa para multi-tenancy
✅ Ofuscação automática de credenciais
✅ Filtro de erros esperados (401, 403, 404)
✅ Contexto rico para debugging
✅ Pronto para integração com Sentry/DataDog
✅ Melhor performance (menos logs em produção)
