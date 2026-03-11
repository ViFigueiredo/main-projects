# Sistema de Planos e Billing

## Visão Geral

O sistema foi ajustado para permitir que empresas novas usem o plano FREE sem necessidade de configurar billing ou realizar pagamento. Apenas quando tentarem ultrapassar a cota gratuita ou contratar um plano pago é que o billing será exigido.

## Regras de Negócio

### 1. Plano FREE (Gratuito)
- **Acesso**: Qualquer empresa nova pode usar o plano FREE sem billing
- **Limites**: Definidos no plano (ex: 1 instância, 3 campanhas, 100 leads, etc.)
- **Restrição**: Uma vez que a empresa contrata um plano pago, **não pode mais voltar ao plano FREE**
- **Billing**: Não requer configuração de pagamento
- **Expiração**: Não expira

### 2. Planos Pagos
- **Acesso**: Requer billing configurado E pagamento confirmado
- **Limites**: Definidos no plano contratado
- **Billing**: Obrigatório - empresa precisa configurar dados de pagamento
- **Expiração**: Expira conforme o ciclo contratado (mensal/anual)
- **Renovação**: Precisa contratar novo plano quando expirar

### 3. Empresa Master
- **Acesso**: Ilimitado, sem necessidade de billing
- **Limites**: Sem limites (isUnlimited = true)
- **Billing**: Não requer

### 4. Plano Ilimitado
- **Acesso**: Ilimitado, sem necessidade de billing
- **Limites**: Sem limites (isUnlimited = true)
- **Billing**: Não requer

## Lógica de Verificação

### `lib/plan-limits.ts`

```typescript
// Lógica de billing:
// - Master company: nunca precisa de billing
// - Plano ilimitado: nunca precisa de billing
// - Plano FREE (priceMonthly = 0): não precisa de billing, mas tem limites
// - Planos pagos: precisa de billing configurado E pagamento ativo

const isFreeOrUnlimitedPlan = isUnlimitedPlan || (plan?.priceMonthly === 0);
const billingRequired = !isMasterCompany && !isFreeOrUnlimitedPlan;
```

### Funções Principais

1. **`getPlanStatus(companyId)`**: Retorna status completo do plano
   - Limites do plano
   - Uso atual
   - Se pode usar cada recurso
   - Se billing é obrigatório
   - Se billing está configurado
   - Se plano expirou

2. **`requireBilling(companyId)`**: Verifica se billing é obrigatório
   - Retorna erro 402 se billing for obrigatório mas não configurado
   - Retorna erro 402 se plano expirou

3. **`requireLimit(companyId, resource)`**: Verifica se limite foi atingido
   - Retorna erro 403 se limite foi atingido
   - Permite uso se dentro do limite

## Página de Seleção de Planos

### `/dashboard/plans`

Interface para empresas clientes selecionarem e mudarem de plano:

**Funcionalidades:**
- Lista todos os planos ativos (exceto plano master)
- **Ordenação**: Plano FREE sempre à esquerda, demais planos ordenados por preço crescente
- Mostra plano atual da empresa
- Toggle mensal/anual
- **Modais de confirmação** ao invés de alerts JavaScript
- **Modal de notificação** para feedback de sucesso/erro
- Destaque visual do plano atual

**Ordenação dos Planos:**
1. **Plano FREE**: Sempre fixo na primeira posição (esquerda)
2. **Planos Pagos**: Ordenados por preço crescente (do mais barato ao mais caro)
3. A ordenação é dinâmica baseada no ciclo selecionado (mensal/anual)

**Fluxo de Contratação:**

1. **Plano FREE:**
   - Clica em "Selecionar Plano Gratuito"
   - Modal de confirmação aparece
   - Confirma a seleção
   - Sistema ativa imediatamente
   - Modal de sucesso é exibido

2. **Plano Pago:**
   - Clica em "Contratar Plano"
   - Modal de confirmação aparece explicando que será redirecionado
   - Confirma a contratação
   - Sistema verifica se billing está configurado
   - Se não estiver, modal de erro pede para configurar
   - Se estiver, cria cobrança no Asaas
   - Redireciona para página de pagamento
   - Após pagamento confirmado (webhook), plano é ativado

## APIs Criadas

### `GET /api/dashboard/plans`
Lista todos os planos disponíveis (exceto master)

### `GET /api/dashboard/plans/current`
Retorna o plano atual da empresa logada

### `POST /api/dashboard/plans/select`
Seleciona/contrata um novo plano

**Body:**
```json
{
  "planId": "plan_id",
  "billingCycle": "monthly" | "yearly"
}
```

**Respostas:**

- **Plano FREE:**
```json
{
  "success": true,
  "requiresPayment": false,
  "message": "Plano gratuito ativado com sucesso"
}
```

- **Plano Pago (sem billing):**
```json
{
  "error": "Configure seus dados de pagamento antes de contratar um plano pago",
  "requiresBillingSetup": true
}
```

- **Plano Pago (com billing):**
```json
{
  "success": true,
  "requiresPayment": true,
  "paymentUrl": "https://...",
  "paymentId": "pay_xxx",
  "message": "Cobrança criada. Complete o pagamento para ativar o plano."
}
```

- **Tentativa de voltar ao FREE:**
```json
{
  "error": "Empresas que já contrataram planos pagos não podem voltar ao plano gratuito"
}
```

## Webhook Asaas

### `POST /api/webhooks/asaas`

Atualizado para ativar plano quando pagamento for confirmado:

1. Recebe evento de pagamento do Asaas
2. Atualiza status do pagamento no banco
3. Se status = RECEIVED ou CONFIRMED:
   - Busca o planId (de assinatura ou externalReference)
   - Calcula data de expiração baseado no ciclo
   - Atualiza plano da empresa

## Navegação

Link adicionado no sidebar do dashboard:
- **Ícone**: Zap (⚡)
- **Label**: "Planos"
- **Rota**: `/dashboard/plans`

## Verificações de Billing

Todos os endpoints de criação de recursos verificam billing:

### API V1
- `POST /api/v1/campaigns` - requireBilling + requireLimit
- `POST /api/v1/instances` - requireBilling + requireLimit
- `POST /api/v1/leads` - requireBilling + requireLimit
- `POST /api/v1/leads/import` - requireBilling + requireLimit

### Admin Workspace
- `POST /api/admin/workspace/campaigns` - requireBilling + requireLimit
- `POST /api/admin/workspace/instances` - requireBilling + requireLimit
- `POST /api/admin/workspace/leads` - requireBilling + requireLimit
- `POST /api/admin/workspace/leads/lists` - requireBilling + requireLimit
- `POST /api/admin/workspace/leads/import` - requireBilling + requireLimit

## Exemplo de Fluxo

### Empresa Nova (Plano FREE)

1. Empresa se cadastra
2. Sistema atribui plano FREE automaticamente
3. Empresa pode usar recursos dentro dos limites do FREE
4. Não precisa configurar billing
5. Não precisa pagar nada

### Upgrade para Plano Pago

1. Empresa acessa `/dashboard/plans`
2. Seleciona plano pago (ex: PRO)
3. Se não tem billing configurado:
   - Sistema retorna erro
   - Empresa vai em `/dashboard/setup-billing`
   - Configura dados de pagamento
4. Volta em `/dashboard/plans` e seleciona plano novamente
5. Sistema cria cobrança no Asaas
6. Empresa é redirecionada para página de pagamento
7. Empresa paga (PIX, boleto ou cartão)
8. Webhook do Asaas confirma pagamento
9. Sistema ativa plano PRO
10. Empresa agora tem acesso aos recursos do PRO

### Tentativa de Voltar ao FREE

1. Empresa com plano PRO tenta selecionar FREE
2. Sistema retorna erro: "Empresas que já contrataram planos pagos não podem voltar ao plano gratuito"
3. Empresa precisa escolher outro plano pago ou manter o atual

### Esgotamento de Cota

1. Empresa no plano FREE tenta criar 4ª campanha (limite é 3)
2. Sistema retorna erro 403: "Limite de campanhas atingido (3/3). Faça upgrade do seu plano."
3. Empresa acessa `/dashboard/plans`
4. Contrata plano com mais recursos

## Arquivos Modificados

- `lib/plan-limits.ts` - Ajustada lógica de billing
- `app/dashboard/plans/page.tsx` - Página de seleção de planos com modais e ordenação
- `app/api/dashboard/plans/route.ts` - API para listar planos (criado)
- `app/api/dashboard/plans/current/route.ts` - API para plano atual (criado)
- `app/api/dashboard/plans/select/route.ts` - API para selecionar plano (criado)
- `app/api/webhooks/asaas/route.ts` - Webhook atualizado para ativar plano
- `components/layout/sidebar.tsx` - Adicionado link para página de planos
- `components/ui/notification-modal.tsx` - Modal de notificação (criado)

## Componentes UI

### NotificationModal
Modal para exibir mensagens de sucesso, erro ou aviso ao usuário.

**Props:**
- `isOpen`: boolean - Controla visibilidade
- `onClose`: função - Callback ao fechar
- `title`: string - Título do modal
- `message`: string - Mensagem a exibir
- `variant`: "success" | "error" | "warning" - Tipo de notificação

**Estilo:**
- Segue o padrão dark do projeto (slate-800/slate-900)
- Ícones coloridos por variante (verde/vermelho/amarelo)
- Botão de ação com cor correspondente à variante

### ConfirmModal (já existente)
Modal para confirmações de ações importantes.

**Uso na página de planos:**
- Confirma seleção de plano FREE
- Confirma contratação de plano pago
- Exibe loading durante processamento

## Testes Recomendados

1. ✅ Criar empresa nova e verificar que pode usar FREE sem billing
2. ✅ Tentar criar recursos além do limite FREE e verificar erro
3. ✅ Contratar plano pago sem billing configurado e verificar erro
4. ✅ Configurar billing e contratar plano pago
5. ✅ Verificar que webhook ativa plano após pagamento
6. ✅ Tentar voltar ao FREE após ter plano pago e verificar erro
7. ✅ Verificar que empresa master não precisa de billing
8. ✅ Verificar que plano ilimitado não precisa de billing
