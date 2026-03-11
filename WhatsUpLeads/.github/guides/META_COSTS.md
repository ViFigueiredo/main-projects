# Guia: Sistema de Custos Meta Cloud

Este guia explica como funciona o sistema de custos do Meta Cloud API no projeto.

## 💰 Visão Geral

O sistema rastreia custos de mensagens enviadas via Meta Cloud API (WhatsApp Business API oficial).

```
┌──────────────────────────────────────────────────────────────┐
│                     Fluxo de Custos                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Preços no Banco                                          │
│     └─> meta_prices (centavos)                               │
│                                                              │
│  2. Atualização Automática                                   │
│     └─> Worker consulta cotação USD                          │
│     └─> Atualiza preços em BRL                               │
│                                                              │
│  3. Estimativa de Custo                                      │
│     └─> calculateEstimatedCost()                             │
│     └─> (marketing + utility + auth) × leads                 │
│                                                              │
│  4. Custo Real                                               │
│     └─> calculateActualCost()                                │
│     └─> Soma por tipo de mensagem enviada                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 📊 Modelo de Dados

### Tabela de Preços

```prisma
model MetaPrice {
  id           String   @id @default(cuid())
  category     String   @unique // "marketing", "utility", "authentication"
  priceUSD     Float    // Preço em dólares
  priceBRL     Int      // Preço em centavos (R$)
  usdRate      Float    // Cotação USD/BRL usada
  updatedAt    DateTime @updatedAt
}
```

### Métricas de Campanha

```prisma
model Campaign {
  // ...
  estimatedCost    Int?  // Custo estimado em centavos
  actualCost       Int?  // Custo real em centavos
  
  // Contadores por tipo
  marketingCount   Int @default(0)
  utilityCount     Int @default(0)
  authCount        Int @default(0)
}
```

## 🔧 Funções Principais

### lib/meta-cost-tracker.ts

```typescript
// Busca preços atualizados do banco
export async function getUpdatedMetaPrices(): Promise<MetaPricesConfig> {
  const prices = await prisma.metaPrice.findMany();
  
  return {
    marketing: prices.find(p => p.category === "marketing")?.priceBRL || 0,
    utility: prices.find(p => p.category === "utility")?.priceBRL || 0,
    authentication: prices.find(p => p.category === "authentication")?.priceBRL || 0,
  };
}

// Calcula custo estimado (ANTES de enviar)
export async function calculateEstimatedCost(
  leadCount: number,
  messageTypes: MessageTypeDistribution = { marketing: 100, utility: 0, auth: 0 }
): Promise<number> {
  const prices = await getUpdatedMetaPrices();
  
  const marketingLeads = Math.round(leadCount * (messageTypes.marketing / 100));
  const utilityLeads = Math.round(leadCount * (messageTypes.utility / 100));
  const authLeads = Math.round(leadCount * (messageTypes.auth / 100));
  
  return (
    marketingLeads * prices.marketing +
    utilityLeads * prices.utility +
    authLeads * prices.authentication
  );
}

// Calcula custo real (DEPOIS de enviar)
export async function calculateActualCost(
  marketingCount: number,
  utilityCount: number,
  authCount: number
): Promise<number> {
  const prices = await getUpdatedMetaPrices();
  
  return (
    marketingCount * prices.marketing +
    utilityCount * prices.utility +
    authCount * prices.authentication
  );
}
```

## 📡 API de Preços

### GET /api/meta-pricing

Retorna preços atuais em centavos:

```json
{
  "prices": {
    "marketing": 72,       // R$ 0,72
    "utility": 35,         // R$ 0,35
    "authentication": 28   // R$ 0,28
  },
  "usdRate": 5.25,
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### POST /api/admin/meta-pricing

Atualiza preços manualmente (apenas admin):

```json
{
  "marketing": 72,
  "utility": 35,
  "authentication": 28,
  "usdRate": 5.25
}
```

## 🔄 Atualização Automática

O sistema possui um worker que atualiza preços automaticamente:

```typescript
// scripts/auto-sync-usd-rates.js

// Busca cotação USD atual
const usdRate = await fetchUSDRate();

// Preços base em USD (do Meta)
const BASE_PRICES_USD = {
  marketing: 0.14,
  utility: 0.067,
  authentication: 0.053,
};

// Converte para BRL em centavos
const newPrices = {
  marketing: Math.round(BASE_PRICES_USD.marketing * usdRate * 100),
  utility: Math.round(BASE_PRICES_USD.utility * usdRate * 100),
  authentication: Math.round(BASE_PRICES_USD.authentication * usdRate * 100),
};

// Atualiza no banco
await prisma.metaPrice.upsert({...});
```

## 📱 Uso em Campanhas

### Ao Criar Campanha

```typescript
// Calcula estimativa baseada em leads
const estimatedCost = await calculateEstimatedCost(
  leads.length,
  { marketing: 100, utility: 0, auth: 0 }
);

await prisma.campaign.create({
  data: {
    // ...
    estimatedCost,
    leadCount: leads.length,
  },
});
```

### Ao Iniciar Campanha

```typescript
// app/api/admin/workspace/campaigns/[id]/start/route.ts

// Recalcula custo com preços atuais
const estimatedCost = await calculateEstimatedCost(
  campaign.leadCount || 0,
  { marketing: 100, utility: 0, auth: 0 }
);

await prisma.campaign.update({
  where: { id: campaignId },
  data: {
    status: "SENDING",
    estimatedCost,
    startedAt: new Date(),
  },
});
```

### Durante o Envio

```typescript
// Incrementa contador por tipo de mensagem
await prisma.campaign.update({
  where: { id: campaignId },
  data: {
    marketingCount: { increment: 1 },
    // ou utilityCount, authCount
  },
});
```

### Ao Finalizar Campanha

```typescript
// Calcula custo real baseado em envios
const actualCost = await calculateActualCost(
  campaign.marketingCount,
  campaign.utilityCount,
  campaign.authCount
);

await prisma.campaign.update({
  where: { id: campaignId },
  data: {
    status: "COMPLETED",
    actualCost,
    finishedAt: new Date(),
  },
});
```

## 🖥️ Exibição no Frontend

### Formatação de Valores

```typescript
// Centavos para reais
function formatCurrency(centavos: number): string {
  const reais = centavos / 100;
  return reais.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

// Uso
formatCurrency(7200);  // "R$ 72,00"
formatCurrency(35);    // "R$ 0,35"
```

### Componente de Preços

```tsx
function PriceDisplay({ prices }: { prices: MetaPrices }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-slate-800 p-4 rounded-lg">
        <span className="text-slate-400 text-sm">Marketing</span>
        <p className="text-white text-xl font-bold">
          {formatCurrency(prices.marketing)}
        </p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <span className="text-slate-400 text-sm">Utility</span>
        <p className="text-white text-xl font-bold">
          {formatCurrency(prices.utility)}
        </p>
      </div>
      <div className="bg-slate-800 p-4 rounded-lg">
        <span className="text-slate-400 text-sm">Authentication</span>
        <p className="text-white text-xl font-bold">
          {formatCurrency(prices.authentication)}
        </p>
      </div>
    </div>
  );
}
```

### Estimativa em Tempo Real

```tsx
function CostEstimate({ leadCount }: { leadCount: number }) {
  const [prices, setPrices] = useState<MetaPrices | null>(null);
  
  useEffect(() => {
    fetch("/api/meta-pricing")
      .then(res => res.json())
      .then(data => setPrices(data.prices));
  }, []);

  if (!prices) return null;

  const estimated = leadCount * prices.marketing;

  return (
    <div className="text-slate-400">
      Custo estimado: {" "}
      <span className="text-white font-bold">
        {formatCurrency(estimated)}
      </span>
    </div>
  );
}
```

## ⚠️ Importante

1. **Sempre em centavos** - Armazene valores em centavos para evitar problemas com float
2. **Recalcule no início** - Sempre recalcule o custo estimado ao iniciar uma campanha
3. **Use preços do banco** - Nunca use valores hardcoded, sempre busque do banco
4. **Async functions** - `calculateEstimatedCost` e `calculateActualCost` são async
5. **Formate apenas na exibição** - Mantenha centavos no código, converta só para exibir

## 📝 Categorias de Mensagem (Meta)

| Categoria | Uso | Custo |
|-----------|-----|-------|
| Marketing | Promoções, newsletters, ofertas | Mais caro |
| Utility | Confirmações, atualizações de pedido | Médio |
| Authentication | Códigos de verificação, OTPs | Mais barato |

O sistema atualmente assume 100% marketing para campanhas, mas pode ser ajustado.
