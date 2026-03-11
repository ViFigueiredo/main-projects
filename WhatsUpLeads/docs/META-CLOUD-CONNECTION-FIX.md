# 🔧 Meta Cloud Connection Fix

## 🚨 Problema Identificado

Quando um admin de tenancy criava uma instância Meta Cloud e tentava conectar, recebia:
```
POST /api/dashboard/instances/cmkl3ido100019xv8adgla6xy/connect 400 in 3.2s
```

A instância ficava desconectada e não mostrava erro na interface.

## 🔍 Causa Raiz

### 1. **API Bloqueando Meta Cloud (CORRIGIDO)**
O endpoint `/api/dashboard/instances/[id]/connect/route.ts` estava **bloqueando explicitamente** conexões Meta Cloud:

```typescript
// ❌ CÓDIGO ANTIGO (INCORRETO)
if (instance.provider === "AWS_S3" || instance.provider === "META_CLOUD") {
  return NextResponse.json({ error: "Este provider não suporta conexão manual" }, { status: 400 });
}
```

### 2. **Interface Sem Tratamento de Erro (CORRIGIDO)**
A função `handleConnect` na interface não tratava erros, então o usuário não via mensagem de erro:

```typescript
// ❌ CÓDIGO ANTIGO (SEM TRATAMENTO DE ERRO)
const res = await fetch(`/api/dashboard/instances/${id}/connect`, { method: "POST" });
if (res.ok) {
  setInstances((prev) => prev.map((i) => (i.id === id ? { ...i, status: "CONNECTING" } : i)));
}
// ❌ Não tratava erro 400!
```

## ✅ Correções Aplicadas

### 1. **API Endpoint Corrigido**
**Arquivo**: `app/api/dashboard/instances/[id]/connect/route.ts`

```typescript
// ✅ NOVO CÓDIGO (CORRETO)
// Meta Cloud e AWS S3 têm fluxos diferentes
if (instance.provider === "AWS_S3") {
  return NextResponse.json({ error: "AWS S3 não suporta conexão manual" }, { status: 400 });
}

// Para Meta Cloud, verificar status em vez de conectar
if (instance.provider === "META_CLOUD") {
  try {
    const provider = getProvider(instance.provider);
    const status = await provider.getStatus(
      instance.providerData as Record<string, unknown>
    );

    // Atualiza status no banco
    const newStatus = status.status.toUpperCase() as "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "BANNED";
    await prisma.instance.update({
      where: { id },
      data: {
        status: newStatus,
        phoneNumber: status.phoneNumber,
        profileName: status.profileName,
        profilePic: status.profilePic,
      },
    });

    return NextResponse.json({
      status: status.status,
      phoneNumber: status.phoneNumber,
      profileName: status.profileName,
      message: "Status da instância Meta Cloud atualizado",
    });
  } catch (error) {
    console.error("[Dashboard Connect Meta Cloud] Erro:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao verificar status" },
      { status: 500 }
    );
  }
}
```

### 2. **API Status Endpoint Corrigido**
**Arquivo**: `app/api/dashboard/instances/[id]/status/route.ts`

```typescript
// ✅ Para Meta Cloud, sempre verificar status real via API
if (instance.provider === "META_CLOUD") {
  try {
    const provider = getProvider(instance.provider);
    const status = await provider.getStatus(
      instance.providerData as Record<string, unknown>
    );

    // Atualiza status no banco
    const newStatus = status.status.toUpperCase() as "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "BANNED";
    await prisma.instance.update({
      where: { id },
      data: {
        status: newStatus,
        phoneNumber: status.phoneNumber,
        profileName: status.profileName,
        profilePic: status.profilePic,
      },
    });

    return NextResponse.json({
      status: status.status,
      phoneNumber: status.phoneNumber,
      profileName: status.profileName,
    });
  } catch (error) {
    console.error("[Dashboard Status Meta Cloud] Erro:", error);
    // Em caso de erro, marca como desconectado
    await prisma.instance.update({
      where: { id },
      data: { status: "DISCONNECTED" },
    });
    return NextResponse.json({
      status: "disconnected",
      phoneNumber: null,
      profileName: null,
    });
  }
}
```

### 3. **Interface com Tratamento de Erro**
**Arquivo**: `app/dashboard/instances/instances-list.tsx`

```typescript
// ✅ NOVO CÓDIGO (COM TRATAMENTO DE ERRO)
const handleConnect = async (id: string) => {
  const instance = instances.find((i) => i.id === id);
  if (!instance) return;

  // Se for WUZAPI, UAZAPI ou PAPI, abre modal de QR Code
  if (["WUZAPI", "UAZAPI", "PAPI"].includes(instance.provider)) {
    setQrModal(instance);
  } else {
    // META_CLOUD usa outro fluxo
    try {
      const res = await fetch(`/api/dashboard/instances/${id}/connect`, { method: "POST" });
      
      if (res.ok) {
        const data = await res.json();
        setInstances((prev) => prev.map((i) => (i.id === id ? { 
          ...i, 
          status: "CONNECTED" as const,
          phoneNumber: data.phoneNumber || i.phoneNumber,
          profileName: data.profileName || i.profileName
        } : i)));
        
        setNotification({
          isOpen: true,
          title: "Sucesso",
          message: data.message || "Instância conectada com sucesso!",
          variant: "success",
        });
      } else {
        const errorData = await res.json();
        setNotification({
          isOpen: true,
          title: "Erro de Conexão",
          message: errorData.error || "Erro ao conectar instância",
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Erro ao conectar:", error);
      setNotification({
        isOpen: true,
        title: "Erro",
        message: "Erro de rede ao conectar instância",
        variant: "error",
      });
    }
  }
};
```

## 🎯 Como Meta Cloud Funciona Agora

### **Fluxo Correto:**
1. **Usuário clica "Conectar"** → `handleConnect()` é chamado
2. **Interface faz POST** → `/api/dashboard/instances/{id}/connect`
3. **API verifica provider** → Se for Meta Cloud, chama `provider.getStatus()`
4. **Provider consulta Meta API** → Verifica se credenciais são válidas
5. **API atualiza banco** → Status, telefone, nome do perfil
6. **Interface recebe resposta** → Mostra sucesso ou erro
7. **Status atualizado** → Instância fica "Conectada" ou mostra erro

### **Diferenças dos Outros Providers:**
- **WUZAPI/UAZAPI/PAPI**: Precisam de QR Code para conectar
- **Meta Cloud**: Já está "conectado" se as credenciais são válidas
- **AWS S3**: Não tem conceito de conexão

## 🚀 Deploy das Correções

```bash
# 1. Build da nova versão
npm run docker:build

# 2. Deploy da stack
docker stack deploy -c docker-stack-corrected.yml whatsup

# 3. Testar conexão Meta Cloud
# Agora deve funcionar sem erro 400
```

## 🧪 Script de Teste

Criado script para testar: `scripts/test-meta-cloud-connect.js`

```bash
# Executar teste
node scripts/test-meta-cloud-connect.js
```

## ✅ Resultado Esperado

Agora quando o admin clicar "Conectar" em uma instância Meta Cloud:

1. **✅ Sem erro 400** - API não bloqueia mais
2. **✅ Feedback visual** - Mostra sucesso ou erro específico
3. **✅ Status correto** - Instância fica conectada se credenciais válidas
4. **✅ Dados atualizados** - Telefone e nome do perfil aparecem

---

**Resumo**: O problema era que a API estava bloqueando Meta Cloud incorretamente e a interface não mostrava erros. Agora ambos estão corrigidos.