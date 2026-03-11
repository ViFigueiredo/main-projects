# Guia: Adicionando Novo Provider WhatsApp

Este guia mostra como adicionar suporte a um novo provider de WhatsApp no sistema.

## 🏗️ Arquitetura de Providers

O sistema suporta múltiplos providers de WhatsApp:

```
lib/providers/
├── types.ts          # Interfaces compartilhadas
├── wuzapi.ts         # Provider WuzAPI
├── uazapi.ts         # Provider UazAPI  
├── papi.ts           # Provider PAPI
└── [novo-provider].ts # Seu novo provider
```

## 📋 Estrutura de um Provider

Cada provider deve implementar a interface `WhatsAppProvider`:

```typescript
// lib/providers/types.ts
export interface WhatsAppProvider {
  name: string;
  
  // Gerenciamento de instância
  createInstance(config: InstanceConfig): Promise<InstanceResult>;
  deleteInstance(instanceId: string): Promise<void>;
  getInstanceStatus(instanceId: string): Promise<InstanceStatus>;
  
  // QR Code / Conexão
  getQRCode(instanceId: string): Promise<QRCodeResult>;
  disconnect(instanceId: string): Promise<void>;
  
  // Envio de mensagens
  sendTextMessage(instanceId: string, phone: string, text: string): Promise<SendResult>;
  sendMediaMessage(instanceId: string, phone: string, media: MediaPayload): Promise<SendResult>;
  sendTemplateMessage(instanceId: string, phone: string, template: TemplatePayload): Promise<SendResult>;
  
  // Webhooks
  parseWebhook(payload: unknown): WebhookEvent | null;
}
```

## 🚀 Passo a Passo

### 1. Crie o Arquivo do Provider

```typescript
// lib/providers/novo-provider.ts
import { WhatsAppProvider, InstanceConfig, InstanceResult, InstanceStatus, QRCodeResult, SendResult, MediaPayload, TemplatePayload, WebhookEvent } from "./types";

export class NovoProvider implements WhatsAppProvider {
  name = "novo-provider";
  
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[NovoProvider] ${response.status}: ${error}`);
    }

    return response.json();
  }

  // Implementar métodos obrigatórios...
  
  async createInstance(config: InstanceConfig): Promise<InstanceResult> {
    const result = await this.request<{ id: string }>("/instances", {
      method: "POST",
      body: JSON.stringify(config),
    });
    
    return {
      instanceId: result.id,
      status: "created",
    };
  }

  async deleteInstance(instanceId: string): Promise<void> {
    await this.request(`/instances/${instanceId}`, {
      method: "DELETE",
    });
  }

  async getInstanceStatus(instanceId: string): Promise<InstanceStatus> {
    const result = await this.request<{ status: string }>(`/instances/${instanceId}/status`);
    
    return {
      connected: result.status === "connected",
      status: result.status,
    };
  }

  async getQRCode(instanceId: string): Promise<QRCodeResult> {
    const result = await this.request<{ qrcode: string }>(`/instances/${instanceId}/qrcode`);
    
    return {
      qrcode: result.qrcode,
      expires: Date.now() + 60000, // 1 minuto
    };
  }

  async disconnect(instanceId: string): Promise<void> {
    await this.request(`/instances/${instanceId}/disconnect`, {
      method: "POST",
    });
  }

  async sendTextMessage(
    instanceId: string, 
    phone: string, 
    text: string
  ): Promise<SendResult> {
    const result = await this.request<{ messageId: string }>(`/instances/${instanceId}/send/text`, {
      method: "POST",
      body: JSON.stringify({ phone, text }),
    });
    
    return {
      success: true,
      messageId: result.messageId,
    };
  }

  async sendMediaMessage(
    instanceId: string,
    phone: string,
    media: MediaPayload
  ): Promise<SendResult> {
    const result = await this.request<{ messageId: string }>(`/instances/${instanceId}/send/media`, {
      method: "POST",
      body: JSON.stringify({ phone, ...media }),
    });
    
    return {
      success: true,
      messageId: result.messageId,
    };
  }

  async sendTemplateMessage(
    instanceId: string,
    phone: string,
    template: TemplatePayload
  ): Promise<SendResult> {
    const result = await this.request<{ messageId: string }>(`/instances/${instanceId}/send/template`, {
      method: "POST",
      body: JSON.stringify({ phone, ...template }),
    });
    
    return {
      success: true,
      messageId: result.messageId,
    };
  }

  parseWebhook(payload: unknown): WebhookEvent | null {
    // Adaptar para o formato de webhook do novo provider
    const data = payload as Record<string, unknown>;
    
    if (!data.type || !data.instanceId) {
      return null;
    }

    switch (data.type) {
      case "message_received":
        return {
          type: "message",
          instanceId: data.instanceId as string,
          from: data.from as string,
          text: data.text as string,
          timestamp: new Date().toISOString(),
        };
      
      case "status_change":
        return {
          type: "status",
          instanceId: data.instanceId as string,
          status: data.status as string,
        };
      
      default:
        return null;
    }
  }
}
```

### 2. Exporte o Provider

```typescript
// lib/providers/index.ts
export { WuzAPIProvider } from "./wuzapi";
export { UazAPIProvider } from "./uazapi";
export { PAPIProvider } from "./papi";
export { NovoProvider } from "./novo-provider"; // Adicione esta linha
export * from "./types";
```

### 3. Adicione ao Enum do Prisma

```prisma
// prisma/schema.prisma
enum WhatsAppProvider {
  WUZAPI
  UAZAPI
  PAPI
  NOVO_PROVIDER  // Adicione esta linha
}
```

Execute a migration:
```bash
pnpm prisma migrate dev --name add_novo_provider
```

### 4. Crie Factory para Instanciar

```typescript
// lib/providers/factory.ts
import { WuzAPIProvider, UazAPIProvider, PAPIProvider, NovoProvider } from "./index";
import type { WhatsAppProvider } from "./types";

export function createProvider(
  type: string, 
  baseUrl: string, 
  apiKey: string
): WhatsAppProvider {
  switch (type.toUpperCase()) {
    case "WUZAPI":
      return new WuzAPIProvider(baseUrl, apiKey);
    case "UAZAPI":
      return new UazAPIProvider(baseUrl, apiKey);
    case "PAPI":
      return new PAPIProvider(baseUrl, apiKey);
    case "NOVO_PROVIDER":
      return new NovoProvider(baseUrl, apiKey);
    default:
      throw new Error(`Provider não suportado: ${type}`);
  }
}
```

### 5. Adicione API para QR Code

```typescript
// app/api/admin/workspace/instances/novo-provider/qrcode/route.ts
import { NextResponse } from "next/server";
import { getWorkspaceCompanyId } from "@/lib/workspace-auth";
import { prisma } from "@/lib/prisma";
import { createProvider } from "@/lib/providers/factory";

export async function GET(request: Request) {
  try {
    const companyId = await getWorkspaceCompanyId();
    if (!companyId) {
      return NextResponse.json(
        { error: "Sem permissão para acessar instâncias" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const instanceId = searchParams.get("instanceId");
    
    if (!instanceId) {
      return NextResponse.json(
        { error: "instanceId é obrigatório" },
        { status: 400 }
      );
    }

    // Busca credenciais
    const instance = await prisma.whatsAppInstance.findFirst({
      where: {
        id: instanceId,
        companyId,
        provider: "NOVO_PROVIDER",
      },
      include: {
        credential: true,
      },
    });

    if (!instance || !instance.credential) {
      return NextResponse.json(
        { error: "Instância não encontrada" },
        { status: 404 }
      );
    }

    // Cria provider e obtém QR Code
    const provider = createProvider(
      "NOVO_PROVIDER",
      instance.credential.baseUrl,
      instance.credential.apiKey
    );

    const qrResult = await provider.getQRCode(instance.externalId);

    return NextResponse.json({
      qrcode: qrResult.qrcode,
      expires: qrResult.expires,
    });
  } catch (error) {
    console.error("[NovoProvider QRCode] Error:", error);
    return NextResponse.json(
      { error: "Erro ao obter QR Code" },
      { status: 500 }
    );
  }
}
```

### 6. Adicione Webhook Handler

```typescript
// app/api/webhooks/novo-provider/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NovoProvider } from "@/lib/providers/novo-provider";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Valida autenticação do webhook (se necessário)
    const signature = request.headers.get("x-webhook-signature");
    // ... validar signature
    
    // Parse do evento
    const provider = new NovoProvider("", ""); // Apenas para usar parseWebhook
    const event = provider.parseWebhook(payload);
    
    if (!event) {
      return NextResponse.json({ error: "Evento inválido" }, { status: 400 });
    }

    // Processa evento
    switch (event.type) {
      case "message":
        await handleIncomingMessage(event);
        break;
      case "status":
        await handleStatusChange(event);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NovoProvider Webhook] Error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

async function handleIncomingMessage(event: WebhookEvent) {
  // Salvar mensagem no banco
}

async function handleStatusChange(event: WebhookEvent) {
  // Atualizar status da instância
}
```

### 7. Adicione UI para Seleção

```tsx
// Onde o usuário seleciona o provider
<select
  value={selectedProvider}
  onChange={(e) => setSelectedProvider(e.target.value)}
  className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
>
  <option value="WUZAPI">WuzAPI</option>
  <option value="UAZAPI">UazAPI</option>
  <option value="PAPI">PAPI</option>
  <option value="NOVO_PROVIDER">Novo Provider</option>
</select>
```

### 8. Adicione Configuração de Credenciais

Se o novo provider precisar de campos diferentes:

```tsx
// app/admin/workspace/credentials/credential-form.tsx
{provider === "NOVO_PROVIDER" && (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1">
        Campo Específico
      </label>
      <input
        type="text"
        value={specificField}
        onChange={(e) => setSpecificField(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700 text-white"
      />
    </div>
  </div>
)}
```

## ✅ Checklist

- [ ] Arquivo do provider criado em `lib/providers/`
- [ ] Implementa interface `WhatsAppProvider`
- [ ] Exportado em `lib/providers/index.ts`
- [ ] Enum adicionado no Prisma schema
- [ ] Migration executada
- [ ] Factory atualizada para instanciar novo provider
- [ ] API de QR Code criada
- [ ] Webhook handler implementado
- [ ] UI atualizada para seleção do provider
- [ ] Formulário de credenciais adaptado
- [ ] Testado criação de instância
- [ ] Testado conexão via QR Code
- [ ] Testado envio de mensagem
- [ ] Testado recebimento de webhook

## 📝 Considerações

1. **Mantenha padrão de tipos** - Use sempre as interfaces de `types.ts`
2. **Trate erros adequadamente** - Log detalhado para debug
3. **Adapte webhooks** - Cada provider tem formato diferente
4. **Documente especificidades** - Campos extras, limitações, etc.
5. **Teste exaustivamente** - Diferentes cenários de conexão/desconexão
