# 🔐 Solução: Signed URLs (Bucket Privado)

## Por que não precisa tornar o bucket público?

Você está **100% correto**! Se temos credenciais válidas, **NÃO é necessário** tornar o bucket público.

## O Problema Anterior

A implementação antiga usava URLs diretas do navegador:

```typescript
// ❌ Problema: Navegador tenta acessar diretamente
<img src="https://s3.us-east-005.backblazeb2.com/portal-s4a/logos/..." />
```

**Limitações:**

- Navegador não tem acesso às credenciais (`.env.local` é servidor)
- Navegador não envia `Authorization` header
- Só funciona com bucket público + CORS

## ✅ Nova Solução: Signed URLs

Agora usamos **URLs pré-assinadas** com suas credenciais:

### Como Funciona:

1. **Servidor gera URL assinada** (tem acesso às credenciais)
2. **URL contém token temporário** (válido por 1 hora)
3. **Navegador usa URL assinada** (não precisa de credenciais)
4. **Backblaze B2 valida o token** (permite acesso mesmo com bucket privado)

### Fluxo:

```
Componente React (navegador)
    ↓
useSignedUrl hook
    ↓
GET /api/s3/signed-url?url=...
    ↓
Servidor (com credenciais)
    ↓
AWS SDK gera URL assinada
    ↓
Retorna URL com token temporário
    ↓
Navegador carrega imagem
    ↓
Backblaze B2 valida token (✅ ACESSO PERMITIDO)
```

## Arquivos Implementados

### 1. `/api/s3/signed-url/route.ts`

API endpoint que gera URLs assinadas usando credenciais do servidor.

### 2. `hooks/use-signed-url.tsx`

Hook React que:

- Busca signed URLs da API
- Faz cache inteligente
- Renova automaticamente antes de expirar
- Suporta múltiplas URLs simultaneamente

### 3. Componentes Atualizados

- `sidebar.tsx` - Usa `useSignedUrls` para logos
- `login-logo.tsx` - Novo componente client com signed URLs
- `login/page.tsx` - Renderiza logos via componente client

## Vantagens

### Segurança:

- ✅ Bucket permanece **PRIVADO**
- ✅ Não precisa configurar **CORS**
- ✅ Credenciais **nunca expostas** ao navegador
- ✅ URLs temporárias (expiram em 1 hora)

### Performance:

- ✅ Cache automático de URLs assinadas
- ✅ Renovação automática antes de expirar
- ✅ Sem necessidade de autenticação em cada request

### Manutenção:

- ✅ Não precisa configurar CORS no Backblaze B2
- ✅ Não precisa tornar bucket público
- ✅ Funciona out-of-the-box com qualquer S3-compatible storage

## Testando

### 1. Certifique-se que o bucket está PRIVADO

No Backblaze B2:

- **Bucket Type**: Private
- **Files in Bucket are**: Private

### 2. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

### 3. Verifique os logs no console do navegador

Você deve ver:

```
🔄 Buscando signed URL para: https://s3.us-east-005...
✅ Signed URL obtida: { expires: "2025-11-12T...", duration: "60 min" }
✅ Logo clara carregada (signed URL)
✅ Logo escura carregada (signed URL)
```

### 4. Teste no Network DevTools

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Recarregue a página
4. Procure por requisições com query params como:
   ```
   ?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...
   ```

Isso confirma que as URLs estão sendo assinadas!

## Configuração de Expiração

Por padrão, URLs expiram em **1 hora** (3600 segundos).

Para alterar, edite a chamada do hook:

```typescript
// 30 minutos
const [signedUrl, signedUrlDark] = useSignedUrls([url, urlDark], 1800);

// 6 horas
const [signedUrl, signedUrlDark] = useSignedUrls([url, urlDark], 21600);
```

**Recomendações:**

- Desenvolvimento: 1 hora (3600s)
- Produção: 6-12 horas (21600-43200s)

## Renovação Automática

O hook renova automaticamente **5 minutos antes** da expiração.

Exemplo com expiração de 1 hora:

- URL gerada às 10:00 (expira às 11:00)
- Renovação automática às 10:55
- Sem interrupção no carregamento

## Próximos Passos

### Remover CORS do Backblaze B2 (opcional)

Se você configurou CORS anteriormente, pode remover:

1. Acesse Backblaze B2 Console
2. Vá em Buckets → `portal-s4a`
3. Bucket Settings → CORS Rules
4. Delete todas as regras CORS

As imagens continuarão funcionando porque usam signed URLs!

### Tornar o bucket PRIVADO (obrigatório)

1. Acesse Backblaze B2 Console
2. Vá em Buckets → `portal-s4a`
3. Bucket Settings
4. **Bucket Type**: Private
5. **Files in Bucket are**: Private
6. Salve

Suas imagens continuarão carregando normalmente! 🎉

## Comparação: Antes vs Depois

| Aspecto     | Antes (URLs Diretas)      | Depois (Signed URLs)          |
| ----------- | ------------------------- | ----------------------------- |
| Bucket      | Público                   | **Privado** ✅                |
| CORS        | Obrigatório               | **Não necessário** ✅         |
| Segurança   | URLs públicas permanentes | URLs temporárias com token ✅ |
| Credenciais | Expostas no client?       | **Apenas no servidor** ✅     |
| Manutenção  | Configurar CORS           | **Zero configuração** ✅      |

## Troubleshooting

### Erro: "Failed to generate signed URL"

**Causa:** Credenciais inválidas no `.env.local`

**Solução:**

1. Verifique `STORAGE_ACCESS_KEY_ID` (25 caracteres)
2. Verifique `STORAGE_SECRET_ACCESS_KEY` (31+ caracteres)
3. Verifique `STORAGE_ENDPOINT` e `STORAGE_BUCKET_NAME`

### Imagem não carrega após 1 hora

**Causa:** URL expirou e renovação automática falhou

**Solução:**

1. Verifique console do navegador por erros
2. Recarregue a página (Ctrl+R)
3. Considere aumentar tempo de expiração

### Renovação não automática

**Causa:** Hook desmontado antes da renovação

**Solução:**

- O hook renova automaticamente se o componente permanecer montado
- Se o usuário navegar para outra página, o hook é desmontado
- Na próxima montagem, buscará nova URL automaticamente

## Conclusão

✅ **Bucket pode ser PRIVADO**  
✅ **CORS não é necessário**  
✅ **Credenciais seguras no servidor**  
✅ **URLs temporárias e renováveis**  
✅ **Zero configuração no Backblaze B2**

Esta é a forma **correta e segura** de servir arquivos privados do S3!
