# 🔧 Admin Workspace Meta Cloud Connection Fix

## 🎯 Objetivo

Replicar a funcionalidade de conexão Meta Cloud do **dashboard de tenancy** para o **admin workspace**, permitindo que admin master conecte instâncias Meta Cloud com botões de conectar/desconectar.

## 🔍 Situação Anterior

### **Admin Workspace (Master)**
- ❌ **Sem botão conectar** para Meta Cloud
- ❌ **Apenas QR Code** para WUZAPI/UAZAPI/PAPI
- ❌ **Sem feedback** de conexão/erro
- ❌ **Status não atualizado** para Meta Cloud

### **Dashboard (Tenancy)**
- ✅ **Botão conectar** funcionando
- ✅ **Tratamento de erro** implementado
- ✅ **Feedback visual** com notificações
- ✅ **Status atualizado** corretamente

## ✅ Correções Implementadas

### **1. Novos Endpoints de API**

#### **`/api/admin/workspace/instances/[id]/connect`**
```typescript
// Replica funcionalidade do dashboard para admin master
// Suporta Meta Cloud + outros providers
// Tratamento específico por provider
// Atualiza status no banco
```

#### **`/api/admin/workspace/instances/[id]/disconnect`**
```typescript
// Desconecta instâncias WUZAPI/UAZAPI/PAPI
// Meta Cloud não suporta desconexão manual
// Atualiza status no banco
```

### **2. Endpoint de Status Atualizado**

**Arquivo**: `app/api/admin/workspace/instances/[id]/status/route.ts`

```typescript
// ✅ Meta Cloud agora verifica status real via API
if (instance.provider === "META_CLOUD") {
  try {
    const provider = getProvider(instance.provider);
    const status = await provider.getStatus(providerData);
    
    // Atualiza banco com dados reais
    await prisma.instance.update({
      where: { id },
      data: {
        status: newStatus,
        phoneNumber: status.phoneNumber,
        profileName: status.profileName,
      },
    });
    
    return NextResponse.json({
      status: status.status,
      phoneNumber: status.phoneNumber,
      profileName: status.profileName,
      connected: status.status === "connected",
    });
  } catch (error) {
    // Em caso de erro, marca como desconectado
    await prisma.instance.update({
      where: { id },
      data: { status: "DISCONNECTED" },
    });
  }
}
```

### **3. Interface Atualizada**

**Arquivo**: `app/admin/workspace/instances/instances-list.tsx`

#### **Botões de Ação Adicionados:**
```typescript
{/* Botão de conectar para instâncias desconectadas */}
{instance.status !== "CONNECTED" && (
  <>
    {["WUZAPI", "UAZAPI", "PAPI"].includes(instance.provider) && (
      <button onClick={() => setQrModal(instance)} title="Conectar via QR Code">
        <QrCode className="h-4 w-4" />
      </button>
    )}
    {instance.provider === "META_CLOUD" && (
      <button onClick={() => handleConnect(instance.id)} title="Conectar Meta Cloud">
        <Wifi className="h-4 w-4" />
      </button>
    )}
  </>
)}

{/* Botão de desconectar para instâncias conectadas */}
{instance.status === "CONNECTED" && ["WUZAPI", "UAZAPI", "PAPI"].includes(instance.provider) && (
  <button onClick={() => handleDisconnect(instance.id)} title="Desconectar">
    <WifiOff className="h-4 w-4" />
  </button>
)}
```

#### **Funções de Conexão Adicionadas:**
```typescript
const handleConnect = async (id: string) => {
  try {
    const res = await fetch(`/api/admin/workspace/instances/${id}/connect`, { method: "POST" });
    
    if (res.ok) {
      const data = await res.json();
      // Atualiza estado local
      setInstances((prev) => prev.map((i) => (i.id === id ? { 
        ...i, 
        status: "CONNECTED",
        phoneNumber: data.phoneNumber || i.phoneNumber,
        profileName: data.profileName || i.profileName
      } : i)));
      
      // Mostra notificação de sucesso
      setNotification({
        isOpen: true,
        title: "Sucesso",
        message: data.message || "Instância conectada com sucesso!",
        variant: "success",
      });
    } else {
      // Mostra erro específico
      const errorData = await res.json();
      setNotification({
        isOpen: true,
        title: "Erro de Conexão",
        message: errorData.error || "Erro ao conectar instância",
        variant: "error",
      });
    }
  } catch (error) {
    // Erro de rede
    setNotification({
      isOpen: true,
      title: "Erro",
      message: "Erro de rede ao conectar instância",
      variant: "error",
    });
  }
};
```

#### **Sistema de Notificações:**
```typescript
// Modal de notificação com feedback visual
{notification.isOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div className="w-full max-w-md rounded-xl bg-slate-800 p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          notification.variant === "success" ? "bg-green-500/20" : 
          notification.variant === "error" ? "bg-red-500/20" : "bg-yellow-500/20"
        }`}>
          {notification.variant === "success" ? (
            <Check className="h-5 w-5 text-green-400" />
          ) : (
            <X className="h-5 w-5 text-red-400" />
          )}
        </div>
        <h2 className="text-lg font-semibold text-white">{notification.title}</h2>
      </div>
      <p className="text-slate-300 mb-6">{notification.message}</p>
      <button onClick={() => setNotification({ ...notification, isOpen: false })}>
        OK
      </button>
    </div>
  </div>
)}
```

## 🎯 Funcionalidades Implementadas

### **Para Meta Cloud:**
- ✅ **Botão "Conectar"** (ícone Wifi)
- ✅ **Verificação de status** via Meta API
- ✅ **Atualização automática** de dados no banco
- ✅ **Feedback visual** de sucesso/erro
- ✅ **Não tem botão desconectar** (Meta Cloud não suporta)

### **Para WUZAPI/UAZAPI/PAPI:**
- ✅ **Botão "Conectar"** (ícone QR Code) - **mantido**
- ✅ **Botão "Desconectar"** (ícone WifiOff) - **novo**
- ✅ **Modal QR Code** - **mantido**
- ✅ **Feedback visual** - **novo**

### **Para AWS S3:**
- ✅ **Sem botões** (não suporta conexão)
- ✅ **Apenas configurações** - **mantido**

## 🚀 Como Testar

### **1. Deploy das Correções:**
```bash
npm run docker:build
docker stack deploy -c docker-stack-corrected.yml whatsup
```

### **2. Testar Admin Workspace:**
1. **Login como admin master**
2. **Ir para Admin → Workspace → Instâncias**
3. **Criar instância Meta Cloud** (se não tiver)
4. **Clicar botão "Conectar"** (ícone Wifi)
5. **Verificar feedback** (sucesso ou erro específico)
6. **Status deve atualizar** para "Conectado"

### **3. Testar Outros Providers:**
1. **WUZAPI/UAZAPI/PAPI**: QR Code + botão desconectar
2. **AWS S3**: Apenas configurações
3. **Todos**: Feedback visual com notificações

## 📊 Comparação Final

| Funcionalidade | Dashboard (Tenancy) | Admin Workspace (Master) |
|---|---|---|
| **Meta Cloud Connect** | ✅ Funcionando | ✅ **AGORA FUNCIONA** |
| **QR Code Providers** | ✅ Funcionando | ✅ Funcionando |
| **Botão Desconectar** | ✅ Funcionando | ✅ **AGORA FUNCIONA** |
| **Feedback Visual** | ✅ Funcionando | ✅ **AGORA FUNCIONA** |
| **Tratamento de Erro** | ✅ Funcionando | ✅ **AGORA FUNCIONA** |
| **Status Atualizado** | ✅ Funcionando | ✅ **AGORA FUNCIONA** |

---

**Resumo**: Admin workspace agora tem **paridade completa** com dashboard de tenancy para conexão de instâncias Meta Cloud, incluindo botões, feedback visual e tratamento de erros.