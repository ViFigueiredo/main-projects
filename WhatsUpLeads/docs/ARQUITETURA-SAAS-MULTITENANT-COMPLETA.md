# Arquitetura SaaS Multitenant - Guia Completo de Implementação

Este documento serve como guia prático para replicar a arquitetura SaaS multitenant em outros projetos.

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura de Usuários e Permissões](#2-estrutura-de-usuários-e-permissões)
3. [Sistema de Empresas (Multi-Tenancy)](#3-sistema-de-empresas-multi-tenancy)
4. [Sistema de Planos](#4-sistema-de-planos)
5. [Integração Asaas (Billing)](#5-integração-asaas-billing)
6. [Rotas e APIs](#6-rotas-e-apis)
7. [Middleware e Proteção](#7-middleware-e-proteção)
8. [Schema do Banco de Dados](#8-schema-do-banco-de-dados)
9. [Checklist de Implementação](#9-checklist-de-implementação)

---

## 1. Visão Geral da Arquitetura

### Diagrama de Hierarquia

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           ADMIN MASTER                                   │
│  • Acesso total ao sistema (todas as empresas)                          │
│  • Gerencia empresas, planos, configurações globais                     │
│  • Empresa com flag isMaster: true                                      │
│  • Plano ilimitado (isUnlimited: true)                                  │
│  • Credenciais via variáveis de ambiente                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EMPRESAS CLIENTES                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐       │
│  │   Empresa A      │  │   Empresa B      │  │   Empresa C      │       │
│  │   Plano PRO      │  │   Plano FREE     │  │   Plano ENTERPRISE│      │
│  │                  │  │                  │  │                  │       │
│  │  ┌────────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │       │
│  │  │ ADMIN (3)  │  │  │  │ ADMIN (1)  │  │  │  │ ADMIN (5)  │  │       │
│  │  │ MEMBER (5) │  │  │  │ MEMBER (2) │  │  │  │ MEMBER (20)│  │       │
│  │  └────────────┘  │  │  └────────────┘  │  │  └────────────┘  │       │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

### Conceitos Principais

| Conceito | Descrição |
|----------|-----------|
| **Tenant** | Cada empresa é um tenant isolado com seus próprios dados |
| **Admin Master** | Super usuário com acesso a tudo (definido via ENV) |
| **Company** | Entidade que agrupa usuários e recursos |
| **Plan** | Define limites e recursos disponíveis |
| **Billing** | Integração com Asaas para cobranças |

---

## 2. Estrutura de Usuários e Permissões

### Tipos de Usuário

#### 2.1 Admin Master
- **Único** no sistema
- Credenciais definidas via variáveis de ambiente
- Acessa rotas `/admin/*`
- Pode gerenciar TODAS as empresas
- Não precisa de billing

```typescript
// .env
ADMIN_EMAIL=admin@seudominio.com
ADMIN_PASSWORD=senha-segura-aqui
```

#### 2.2 Usuários de Empresa (Clientes)

```typescript
enum UserRole {
  ADMIN   // Admin - acesso total dentro da empresa (gerencia usuários, recursos e configurações)
  MEMBER  // Membro - acesso limitado às funcionalidades (somente leitura em algumas áreas)
}
```

### Matriz de Permissões

| Funcionalidade | ADMIN | MEMBER |
|----------------|-------|--------|
| Ver dashboard | ✅ | ✅ |
| Criar/editar leads | ✅ | ✅ |
| Criar/editar campanhas | ✅ | ✅ |
| Ver mensagens | ✅ | ✅ |
| Ver instâncias | ✅ | ✅ (somente leitura) |
| Conectar/desconectar instâncias | ✅ | ❌ |
| Criar/editar instâncias | ✅ | ❌ |
| Gerenciar credenciais | ✅ | ❌ |
| Gerenciar usuários | ✅ | ❌ |
| Ver/gerenciar billing | ✅ | ❌ |
| Alterar plano | ✅ | ❌ |
| Configurações empresa | ✅ | ❌ |
| Documentação API | ✅ | ❌ |

---

## 3. Sistema de Empresas (Multi-Tenancy)

### Modelo de Dados

```prisma
model Company {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  email     String   @unique
  
  // Status
  active    Boolean  @default(true)
  isMaster  Boolean  @default(false) // Empresa do admin master
  
  // API Access
  apiKey    String   @unique @default(cuid())
  apiSecret String   @default(cuid())
  
  // Plano
  planId        String?
  plan          Plan?    @relation(fields: [planId], references: [id])
  planExpiresAt DateTime?
  
  // Contadores de uso (resetados mensalmente)
  usedMessages  Int @default(0)
  usageResetAt  DateTime @default(now())
  
  // Relations
  users       User[]
  billingCustomer BillingCustomer?
  // ... outros recursos
}
```

### Isolamento de Dados

Todas as queries devem filtrar por `companyId`:

```typescript
// ✅ CORRETO - Sempre filtrar por empresa
const leads = await prisma.lead.findMany({
  where: { companyId: session.companyId }
});

// ❌ ERRADO - Nunca buscar sem filtro de empresa
const leads = await prisma.lead.findMany();
```

### Criação de Empresa Master

```typescript
// lib/auth.ts
export async function getOrCreateMasterCompany() {
  const masterEmail = getMasterCredentials().email;

  // Busca ou cria plano ilimitado
  let unlimitedPlan = await prisma.plan.findFirst({
    where: { isUnlimited: true },
  });

  if (!unlimitedPlan) {
    unlimitedPlan = await prisma.plan.create({
      data: {
        name: "master",
        displayName: "Master (Ilimitado)",
        isUnlimited: true,
        maxInstances: 999999,
        maxUsers: 999999,
        // ... outros limites altos
      },
    });
  }

  // Busca ou cria empresa master
  let masterCompany = await prisma.company.findFirst({
    where: { OR: [{ isMaster: true }, { email: masterEmail }] },
  });

  if (!masterCompany) {
    masterCompany = await prisma.company.create({
      data: {
        name: "Admin Master",
        slug: "admin-master",
        email: masterEmail,
        isMaster: true,
        planId: unlimitedPlan.id,
      },
    });
  }

  return { companyId: masterCompany.id, planId: unlimitedPlan.id };
}
```

---

## 4. Sistema de Planos

### Modelo de Dados


```prisma
model Plan {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String?
  
  // Limites (adapte conforme seu sistema)
  maxInstances      Int @default(1)
  maxCampaigns      Int @default(5)
  maxLeadLists      Int @default(3)
  maxLeads          Int @default(1000)
  maxMessagesMonth  Int @default(5000)
  maxUsers          Int @default(2)
  
  // Preço (em centavos)
  priceMonthly  Int @default(0)
  priceYearly   Int @default(0)
  
  // Flags
  isDefault     Boolean @default(false)  // Plano FREE padrão
  isUnlimited   Boolean @default(false)  // Plano master
  active        Boolean @default(true)
  
  // Ordem de exibição
  sortOrder     Int @default(0)
  
  companies Company[]
}
```

### Tipos de Plano

| Tipo | Billing | Limites | Expiração |
|------|---------|---------|-----------|
| **FREE** | Não requer | Limitado | Não expira |
| **Pago** | Obrigatório | Conforme plano | Expira após ciclo |
| **Master** | Não requer | Ilimitado | Não expira |

### Lógica de Verificação de Limites

```typescript
// lib/plan-limits.ts

export async function getPlanStatus(companyId: string): Promise<PlanStatus> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      plan: true,
      billingCustomer: true,
      _count: {
        select: {
          instances: true,
          campaigns: true,
          leads: true,
          users: true,
        },
      },
    },
  });

  const isMasterCompany = company.isMaster === true;
  const isUnlimitedPlan = company.plan?.isUnlimited ?? false;
  const isFreeOrUnlimitedPlan = isUnlimitedPlan || (company.plan?.priceMonthly === 0);
  
  // Lógica de billing:
  // - Master company: nunca precisa de billing
  // - Plano ilimitado: nunca precisa de billing
  // - Plano FREE (priceMonthly = 0): não precisa de billing
  // - Planos pagos: precisa de billing configurado
  const billingRequired = !isMasterCompany && !isFreeOrUnlimitedPlan;
  
  return {
    plan: company.plan,
    limits: { /* limites do plano */ },
    usage: { /* uso atual */ },
    canUse: { /* booleanos por recurso */ },
    billingRequired,
    billingConfigured: !!company.billingCustomer,
    planExpired: company.planExpiresAt ? new Date(company.planExpiresAt) < new Date() : false,
  };
}

// Helper para usar em APIs
export async function requireLimit(companyId: string, resource: string) {
  const check = await checkLimit(companyId, resource);
  
  if (!check.allowed) {
    return {
      error: `Limite de ${resource} atingido (${check.current}/${check.limit}). Faça upgrade.`,
      status: 403,
    };
  }
  return {};
}

export async function requireBilling(companyId: string) {
  const status = await getPlanStatus(companyId);
  
  if (status.billingRequired && !status.billingConfigured) {
    return { error: "Configure seus dados de pagamento.", status: 402 };
  }
  
  if (status.planExpired) {
    return { error: "Seu plano expirou. Renove para continuar.", status: 402 };
  }
  return {};
}
```

### Uso nas APIs

```typescript
// app/api/dashboard/leads/route.ts
export async function POST(request: NextRequest) {
  const companyId = request.headers.get("x-company-id")!;
  
  // Verifica billing
  const billingCheck = await requireBilling(companyId);
  if (billingCheck.error) {
    return NextResponse.json({ error: billingCheck.error }, { status: billingCheck.status });
  }
  
  // Verifica limite
  const limitCheck = await requireLimit(companyId, "leads");
  if (limitCheck.error) {
    return NextResponse.json({ error: limitCheck.error }, { status: limitCheck.status });
  }
  
  // Cria o recurso...
}
```

---

## 5. Integração Asaas (Billing)

### Variáveis de Ambiente

```env
# Asaas
ASAAS_API_KEY=sua_api_key_aqui
ASAAS_SANDBOX=true  # false em produção
ASAAS_WEBHOOK_TOKEN=token_para_validar_webhooks
```

### Modelos de Dados para Billing

```prisma
// Cliente no Asaas (vinculado à Company)
model BillingCustomer {
  id              String   @id @default(cuid())
  asaasCustomerId String   @unique // ID do cliente no Asaas
  
  name            String
  email           String
  cpfCnpj         String
  phone           String?
  
  // Endereço
  postalCode      String?
  address         String?
  addressNumber   String?
  city            String?
  state           String?
  
  companyId       String   @unique
  company         Company  @relation(fields: [companyId], references: [id])
  
  subscriptions   Subscription[]
  payments        Payment[]
}

// Pagamentos/Cobranças
model Payment {
  id              String   @id @default(cuid())
  asaasPaymentId  String   @unique
  
  value           Int      // Em centavos
  dueDate         DateTime
  paymentDate     DateTime?
  billingType     BillingType  // BOLETO, CREDIT_CARD, PIX
  status          PaymentStatus
  
  invoiceUrl      String?
  pixQrCode       String?
  pixCopyPaste    String?
  externalReference String? // ID do plano
  
  customerId      String
  customer        BillingCustomer @relation(...)
}

enum PaymentStatus {
  PENDING
  RECEIVED
  CONFIRMED
  OVERDUE
  REFUNDED
  // ... outros
}
```

### Cliente Asaas (lib/billing/asaas.ts)

```typescript
const ASAAS_API_URL = process.env.ASAAS_SANDBOX === "true" 
  ? "https://sandbox.asaas.com/api/v3"
  : "https://api.asaas.com/v3";

async function asaasRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${ASAAS_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "access_token": process.env.ASAAS_API_KEY!,
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.errors?.[0]?.description || "Erro Asaas");
  return data;
}

// Criar cliente
export async function createCustomer(customer: AsaasCustomer) {
  return asaasRequest<AsaasCustomer>("/customers", {
    method: "POST",
    body: JSON.stringify(customer),
  });
}

// Criar cobrança
export async function createPayment(payment: AsaasPayment) {
  return asaasRequest("/payments", {
    method: "POST",
    body: JSON.stringify(payment),
  });
}

// Obter QR Code PIX
export async function getPaymentPixQrCode(id: string) {
  return asaasRequest(`/payments/${id}/pixQrCode`);
}
```

### Webhook Asaas

```typescript
// app/api/webhooks/asaas/route.ts
export async function POST(request: NextRequest) {
  // Valida token
  const webhookToken = request.headers.get("asaas-access-token");
  if (webhookToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  
  if (payload.payment) {
    const { payment } = payload;
    
    // Busca pagamento local
    const localPayment = await prisma.payment.findUnique({
      where: { asaasPaymentId: payment.id },
      include: { customer: { include: { company: true } } },
    });

    if (!localPayment) return NextResponse.json({ received: true });

    // Atualiza status
    await prisma.payment.update({
      where: { id: localPayment.id },
      data: {
        status: payment.status,
        paymentDate: payment.paymentDate ? new Date(payment.paymentDate) : null,
      },
    });

    // Se pagamento confirmado, ativa o plano
    if (["RECEIVED", "CONFIRMED"].includes(payment.status)) {
      const planId = localPayment.externalReference; // ID do plano
      
      if (planId) {
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + 1); // +1 mês

        await prisma.company.update({
          where: { id: localPayment.customer.companyId },
          data: { planId, planExpiresAt: newExpiry },
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
```

### Fluxo de Contratação de Plano

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. Seleciona   │────▶│  2. Verifica    │────▶│  3. Cria        │
│     Plano       │     │     Billing     │     │     Cobrança    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  6. Plano       │◀────│  5. Webhook     │◀────│  4. Usuário     │
│     Ativado     │     │     Asaas       │     │     Paga        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## 6. Rotas e APIs

### Estrutura de Rotas


```
app/
├── admin/                    # Área do Admin Master
│   ├── layout.tsx           # Layout com verificação isMaster
│   ├── page.tsx             # Dashboard admin
│   ├── companies/           # CRUD de empresas
│   ├── plans/               # CRUD de planos
│   ├── users/               # Todos os usuários
│   ├── billing/             # Visão geral de billing
│   └── settings/            # Configurações globais
│
├── dashboard/               # Área do Cliente
│   ├── layout.tsx           # Layout com verificação de empresa
│   ├── page.tsx             # Dashboard da empresa
│   ├── plans/               # Seleção de planos
│   ├── billing/             # Configuração de billing
│   ├── users/               # Usuários da empresa
│   └── [recursos]/          # Recursos específicos do sistema
│
├── login/                   # Autenticação
│   └── page.tsx
│
└── api/
    ├── admin/               # APIs do Admin Master
    │   ├── companies/       # CRUD empresas
    │   ├── plans/           # CRUD planos
    │   ├── users/           # CRUD usuários
    │   ├── billing/         # Gestão billing
    │   └── stats/           # Estatísticas globais
    │
    ├── dashboard/           # APIs do Cliente
    │   ├── plans/           # Listar/selecionar planos
    │   ├── billing/         # Configurar billing
    │   ├── users/           # Usuários da empresa
    │   ├── plan-status/     # Status do plano atual
    │   └── [recursos]/      # Recursos específicos
    │
    ├── auth/                # Autenticação
    │   ├── login/
    │   └── logout/
    │
    ├── webhooks/            # Webhooks externos
    │   └── asaas/           # Webhook do Asaas
    │
    └── v1/                  # API pública (via API Key)
        └── [recursos]/
```

### APIs do Admin Master

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/admin/companies` | Lista todas empresas |
| POST | `/api/admin/companies` | Cria empresa |
| GET | `/api/admin/companies/[id]` | Detalhes empresa |
| PUT | `/api/admin/companies/[id]` | Atualiza empresa |
| DELETE | `/api/admin/companies/[id]` | Remove empresa |
| GET | `/api/admin/plans` | Lista planos |
| POST | `/api/admin/plans` | Cria plano |
| PUT | `/api/admin/plans/[id]` | Atualiza plano |
| DELETE | `/api/admin/plans/[id]` | Remove plano |
| GET | `/api/admin/users` | Lista todos usuários |
| GET | `/api/admin/stats` | Estatísticas globais |
| GET | `/api/admin/billing` | Visão geral billing |

### APIs do Dashboard (Cliente)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/dashboard/plans` | Lista planos disponíveis |
| GET | `/api/dashboard/plans/current` | Plano atual da empresa |
| POST | `/api/dashboard/plans/select` | Seleciona/contrata plano |
| GET | `/api/dashboard/plan-status` | Status completo do plano |
| GET | `/api/dashboard/billing` | Dados de billing |
| POST | `/api/dashboard/billing` | Configura billing |
| GET | `/api/dashboard/users` | Usuários da empresa |
| POST | `/api/dashboard/users` | Cria usuário |
| PUT | `/api/dashboard/users/[id]` | Atualiza usuário |
| DELETE | `/api/dashboard/users/[id]` | Remove usuário |

### APIs de Webhook

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/webhooks/asaas` | Recebe eventos do Asaas |

---

## 7. Middleware e Proteção

### Middleware Principal

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas - não requer autenticação
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/webhooks") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  // Rotas admin - só master
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await verifySession(token);
    if (!session || !session.isMaster) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  }

  // Rotas do dashboard - usuários autenticados
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/dashboard")) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const session = await verifySession(token);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Master tentando acessar dashboard redireciona para admin
    if (session.isMaster && pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // Adiciona companyId no header para as APIs usarem
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-company-id", session.companyId!);
    requestHeaders.set("x-user-id", session.userId);
    requestHeaders.set("x-user-role", session.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

### Autenticação (JWT)

```typescript
// lib/auth-edge.ts
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export interface SessionPayload {
  userId: string;
  email: string;
  role: "MASTER" | "OWNER" | "ADMIN" | "MEMBER";
  companyId?: string;
  companyName?: string;
  isMaster: boolean;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function getMasterCredentials() {
  return {
    email: process.env.ADMIN_EMAIL!,
    password: process.env.ADMIN_PASSWORD!,
  };
}

export function isMasterEmail(email: string): boolean {
  return email === getMasterCredentials().email;
}
```

### Login

```typescript
// app/api/auth/login/route.ts
export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  // Verifica se é admin master
  if (isMasterEmail(email)) {
    const master = getMasterCredentials();
    if (password !== master.password) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const { companyId } = await getOrCreateMasterCompany();
    
    const token = await createSession({
      userId: "master",
      email,
      role: "MASTER",
      companyId,
      isMaster: true,
    });

    const response = NextResponse.json({ success: true, redirect: "/admin" });
    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
    });

    return response;
  }

  // Login de usuário normal
  const user = await prisma.user.findUnique({
    where: { email },
    include: { company: true },
  });

  if (!user || !await verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
  }

  const token = await createSession({
    userId: user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId,
    companyName: user.company.name,
    isMaster: false,
  });

  const response = NextResponse.json({ success: true, redirect: "/dashboard" });
  response.cookies.set("session", token, { /* ... */ });

  return response;
}
```

---

## 8. Schema do Banco de Dados

### Schema Completo (Prisma)


```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// PLANOS
// ============================================
model Plan {
  id          String   @id @default(cuid())
  name        String   @unique
  displayName String
  description String?
  
  // Limites (adapte para seu sistema)
  maxInstances      Int @default(1)
  maxCampaigns      Int @default(5)
  maxLeadLists      Int @default(3)
  maxLeads          Int @default(1000)
  maxMessagesMonth  Int @default(5000)
  maxUsers          Int @default(2)
  
  // Preço (em centavos)
  priceMonthly  Int @default(0)
  priceYearly   Int @default(0)
  
  // Flags
  isDefault     Boolean @default(false)
  isUnlimited   Boolean @default(false)
  active        Boolean @default(true)
  sortOrder     Int @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  companies Company[]
  
  @@map("plans")
}

// ============================================
// EMPRESAS (TENANTS)
// ============================================
model Company {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  email     String   @unique
  
  active    Boolean  @default(true)
  isMaster  Boolean  @default(false)
  
  // API Access
  apiKey    String   @unique @default(cuid())
  apiSecret String   @default(cuid())
  
  // Plano
  planId        String?
  plan          Plan?    @relation(fields: [planId], references: [id])
  planExpiresAt DateTime?
  
  // Contadores de uso
  usedMessages  Int @default(0)
  usageResetAt  DateTime @default(now())
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  users           User[]
  billingCustomer BillingCustomer?
  // ... adicione seus recursos aqui
  
  @@map("companies")
}

// ============================================
// USUÁRIOS
// ============================================
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  name         String
  passwordHash String?
  role         UserRole @default(MEMBER)
  active       Boolean  @default(true)
  
  companyId String
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  lastLoginAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@map("users")
}

enum UserRole {
  OWNER
  ADMIN
  MEMBER
}

// ============================================
// BILLING
// ============================================
model BillingCustomer {
  id              String   @id @default(cuid())
  asaasCustomerId String   @unique
  
  name            String
  email           String
  cpfCnpj         String
  phone           String?
  
  postalCode      String?
  address         String?
  addressNumber   String?
  complement      String?
  province        String?
  city            String?
  state           String?
  
  companyId       String   @unique
  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  subscriptions   Subscription[]
  payments        Payment[]
  
  @@map("billing_customers")
}

model Subscription {
  id                  String   @id @default(cuid())
  asaasSubscriptionId String   @unique
  
  planId              String
  value               Int
  cycle               BillingCycle @default(MONTHLY)
  
  nextDueDate         DateTime
  startDate           DateTime @default(now())
  endDate             DateTime?
  status              SubscriptionStatus @default(ACTIVE)
  
  customerId          String
  customer            BillingCustomer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@map("subscriptions")
}

enum BillingCycle {
  MONTHLY
  QUARTERLY
  SEMIANNUALLY
  YEARLY
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  EXPIRED
  OVERDUE
}

model Payment {
  id              String   @id @default(cuid())
  asaasPaymentId  String   @unique
  
  value           Int
  netValue        Int?
  dueDate         DateTime
  paymentDate     DateTime?
  billingType     BillingType
  status          PaymentStatus @default(PENDING)
  
  invoiceUrl      String?
  invoiceNumber   String?
  bankSlipUrl     String?
  pixQrCode       String?
  pixCopyPaste    String?
  transactionReceiptUrl String?
  
  description     String?
  externalReference String?
  
  customerId      String
  customer        BillingCustomer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@map("payments")
}

enum BillingType {
  BOLETO
  CREDIT_CARD
  PIX
  UNDEFINED
}

enum PaymentStatus {
  PENDING
  RECEIVED
  CONFIRMED
  OVERDUE
  REFUNDED
  RECEIVED_IN_CASH
  REFUND_REQUESTED
  REFUND_IN_PROGRESS
  CHARGEBACK_REQUESTED
  CHARGEBACK_DISPUTE
  AWAITING_CHARGEBACK_REVERSAL
  DUNNING_REQUESTED
  DUNNING_RECEIVED
  AWAITING_RISK_ANALYSIS
  DELETED
}
```

---

## 9. Checklist de Implementação

### Fase 1: Estrutura Base

- [ ] Configurar banco de dados PostgreSQL
- [ ] Criar schema Prisma com modelos base (Plan, Company, User)
- [ ] Configurar variáveis de ambiente
- [ ] Implementar autenticação JWT
- [ ] Criar middleware de proteção de rotas

### Fase 2: Admin Master

- [ ] Criar função `getOrCreateMasterCompany()`
- [ ] Implementar login do admin master
- [ ] Criar layout e páginas do admin
- [ ] Implementar CRUD de empresas
- [ ] Implementar CRUD de planos
- [ ] Implementar listagem de usuários

### Fase 3: Multi-Tenancy

- [ ] Criar fluxo de cadastro de empresa
- [ ] Implementar isolamento de dados por `companyId`
- [ ] Criar dashboard do cliente
- [ ] Implementar CRUD de usuários da empresa
- [ ] Implementar sistema de roles (OWNER, ADMIN, MEMBER)

### Fase 4: Sistema de Planos

- [ ] Criar plano FREE padrão
- [ ] Criar plano Master ilimitado
- [ ] Implementar `getPlanStatus()`
- [ ] Implementar `requireLimit()`
- [ ] Implementar `requireBilling()`
- [ ] Criar página de seleção de planos

### Fase 5: Integração Asaas

- [ ] Criar conta no Asaas (sandbox primeiro)
- [ ] Configurar variáveis de ambiente do Asaas
- [ ] Implementar cliente Asaas (`lib/billing/asaas.ts`)
- [ ] Criar modelos de billing no Prisma
- [ ] Implementar criação de cliente no Asaas
- [ ] Implementar criação de cobrança
- [ ] Configurar webhook do Asaas
- [ ] Implementar ativação de plano via webhook

### Fase 6: Testes e Produção

- [ ] Testar fluxo completo no sandbox
- [ ] Testar empresa FREE sem billing
- [ ] Testar upgrade para plano pago
- [ ] Testar webhook de pagamento
- [ ] Testar expiração de plano
- [ ] Migrar para produção do Asaas

---

## Variáveis de Ambiente Necessárias

```env
# Banco de Dados
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Autenticação
JWT_SECRET="sua-chave-secreta-muito-longa-e-segura"
ADMIN_EMAIL="admin@seudominio.com"
ADMIN_PASSWORD="senha-segura-do-admin"

# Asaas
ASAAS_API_KEY="sua_api_key_do_asaas"
ASAAS_SANDBOX="true"  # false em produção
ASAAS_WEBHOOK_TOKEN="token_para_validar_webhooks"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Dicas de Implementação

### 1. Sempre Filtrar por Empresa
```typescript
// Em TODAS as queries de recursos
const recursos = await prisma.recurso.findMany({
  where: { companyId: session.companyId }
});
```

### 2. Verificar Limites Antes de Criar
```typescript
const limitCheck = await requireLimit(companyId, "recurso");
if (limitCheck.error) return error(limitCheck);
```

### 3. Usar Transações para Operações Críticas
```typescript
await prisma.$transaction(async (tx) => {
  await tx.payment.update({ ... });
  await tx.company.update({ ... });
});
```

### 4. Logs para Debug de Billing
```typescript
console.log("[ASAAS WEBHOOK]", { event, paymentId, status });
```

### 5. Tratar Erros do Asaas
```typescript
try {
  await createPayment(data);
} catch (error) {
  // Asaas retorna erros descritivos
  return { error: error.message };
}
```

---

## Conclusão

Esta arquitetura permite:

1. **Escalabilidade**: Cada empresa é isolada, facilitando crescimento
2. **Flexibilidade**: Planos configuráveis com diferentes limites
3. **Monetização**: Integração completa com Asaas para cobranças
4. **Segurança**: Middleware protege rotas, JWT para autenticação
5. **Manutenibilidade**: Código organizado e bem estruturado

Para adaptar a outro sistema, substitua os recursos específicos (leads, campanhas, instâncias) pelos recursos do seu domínio, mantendo a mesma estrutura de empresas, planos e billing.
