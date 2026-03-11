# Guia: Criando Nova API Workspace

Este guia mostra como criar uma nova API route compartilhada entre Super Admin e Tenant.

## 📁 Estrutura de Arquivos

```
app/api/admin/workspace/
└── nova-feature/
    ├── route.ts           # GET (list) e POST (create)
    └── [id]/
        ├── route.ts       # GET, PUT, DELETE
        └── action/        # Ações específicas (opcional)
            └── route.ts
```

## 🚀 Passo a Passo

### 1. Crie a pasta da feature

```bash
mkdir -p app/api/admin/workspace/nova-feature/[id]
```

### 2. Crie o arquivo principal (route.ts)

```typescript
// app/api/admin/workspace/nova-feature/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceCompanyId } from "@/lib/workspace-auth";

// GET: Lista todos os itens
export async function GET(request: NextRequest) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  try {
    const items = await prisma.novaFeature.findMany({
      where: { companyId: companyId! },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("[NOVA_FEATURE] GET error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados" },
      { status: 500 }
    );
  }
}

// POST: Cria novo item
export async function POST(request: NextRequest) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  try {
    const body = await request.json();
    const { name, description } = body;

    // Validação
    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const item = await prisma.novaFeature.create({
      data: {
        name,
        description,
        companyId: companyId!,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("[NOVA_FEATURE] POST error:", error);
    return NextResponse.json(
      { error: "Erro ao criar" },
      { status: 500 }
    );
  }
}
```

### 3. Crie o arquivo de item específico ([id]/route.ts)

```typescript
// app/api/admin/workspace/nova-feature/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWorkspaceCompanyId } from "@/lib/workspace-auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: Busca item por ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  const { id } = await params;

  try {
    const item = await prisma.novaFeature.findFirst({
      where: { id, companyId: companyId! },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[NOVA_FEATURE] GET by ID error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar item" },
      { status: 500 }
    );
  }
}

// PUT: Atualiza item
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  const { id } = await params;

  try {
    // Verifica se existe e pertence à empresa
    const existing = await prisma.novaFeature.findFirst({
      where: { id, companyId: companyId! },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, active } = body;

    const item = await prisma.novaFeature.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(typeof active === "boolean" && { active }),
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("[NOVA_FEATURE] PUT error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar" },
      { status: 500 }
    );
  }
}

// DELETE: Remove item
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  const { companyId, error, status } = await getWorkspaceCompanyId(request);
  if (error) {
    return NextResponse.json({ error }, { status: status || 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.novaFeature.findFirst({
      where: { id, companyId: companyId! },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    await prisma.novaFeature.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[NOVA_FEATURE] DELETE error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir" },
      { status: 500 }
    );
  }
}
```

## ✅ Checklist

- [ ] Usa `getWorkspaceCompanyId` para autenticação
- [ ] Filtra dados por `companyId`
- [ ] Usa `companyId!` (non-null assertion)
- [ ] Retorna status codes apropriados
- [ ] Logs com prefixo identificável `[NOME_FEATURE]`
- [ ] Try/catch em todas as operações
- [ ] Validação de inputs no POST/PUT

## 🧪 Testando

```bash
# Como Super Admin
curl -X GET http://localhost:3000/api/admin/workspace/nova-feature \
  -H "Cookie: auth_token=..."

# Como Tenant (deve ver apenas seus dados)
curl -X GET http://localhost:3000/api/admin/workspace/nova-feature \
  -H "Cookie: auth_token=..."
```

## 📝 Notas

- Sempre use `await params` para acessar parâmetros de rota (Next.js 15+)
- O `companyId` é garantido não-null após a verificação de erro, mas TypeScript não infere isso
- Use `companyId!` para indicar que você sabe que não é null
