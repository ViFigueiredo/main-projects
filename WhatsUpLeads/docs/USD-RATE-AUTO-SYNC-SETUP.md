# Configuração do Auto-Sync de Cotação USD/BRL

## 📋 Resumo

Sistema automatizado para manter as cotações USD/BRL sincronizadas entre os ambientes de desenvolvimento e produção, evitando discrepâncias nos preços Meta.

## ✅ Status Atual

- ✅ Scripts de monitoramento implementados
- ✅ Scripts de sincronização implementados  
- ✅ Ambientes sincronizados (R$ 5.37)
- ✅ Configuração de banco de dados pronta
- 🔄 **PRÓXIMO PASSO**: Configurar cron job

## 🛠️ Scripts Disponíveis

### 1. Monitor de Cotação
```bash
node scripts/monitor-usd-rates.js
```
- Verifica cotação atual da API
- Compara com ambientes dev/prod
- Mostra diferenças e status
- Recomenda ações se necessário

### 2. Auto-Sync Automatizado
```bash
node scripts/auto-sync-usd-rates.js
```
- Busca cotação atual da AwesomeAPI
- Atualiza development e production
- Só atualiza se diferença > R$ 0,01
- Logs detalhados com timestamp
- Ideal para cron jobs

### 3. Sincronização Manual
```bash
node scripts/sync-usd-rate-production.js
```
- Sincronização manual específica para produção
- Útil para correções pontuais

### 4. Comparação Entre Ambientes
```bash
node scripts/compare-usd-rates.js
```
- Compara cotações entre dev/prod
- Mostra diferenças detalhadas

## ⏰ Configuração do Cron Job

### Opção 1: Cron Job no Servidor (Linux/macOS)

1. **Abrir crontab**:
```bash
crontab -e
```

2. **Adicionar linha para execução a cada 4 horas**:
```bash
0 */4 * * * cd /caminho/para/projeto && node scripts/auto-sync-usd-rates.js >> logs/usd-sync.log 2>&1
```

3. **Ou a cada hora durante horário comercial**:
```bash
0 9-18 * * 1-5 cd /caminho/para/projeto && node scripts/auto-sync-usd-rates.js >> logs/usd-sync.log 2>&1
```

### Opção 2: GitHub Actions (Recomendado)

Criar `.github/workflows/sync-usd-rates.yml`:

```yaml
name: Sync USD/BRL Rates

on:
  schedule:
    # A cada 4 horas durante dias úteis
    - cron: '0 */4 * * 1-5'
  workflow_dispatch: # Permite execução manual

jobs:
  sync-rates:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Sync USD rates
      env:
        DATABASE_URL: ${{ secrets.DATABASE_URL }}
        DATABASE_PRODUCTION_URL: ${{ secrets.DATABASE_PRODUCTION_URL }}
      run: node scripts/auto-sync-usd-rates.js
```

### Opção 3: Vercel Cron (Se hospedado na Vercel)

Adicionar em `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync-usd-rates",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

E criar `app/api/cron/sync-usd-rates/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { autoSyncRates } from "@/scripts/auto-sync-usd-rates";

export async function GET(request: NextRequest) {
  // Verificar token de segurança
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await autoSyncRates();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no cron de sync USD:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
```

## 📊 Monitoramento

### Logs Automáticos
O script `auto-sync-usd-rates.js` gera logs com timestamp:
```
[2026-01-18T19:48:45.329Z] 🔄 Auto-sync cotação USD/BRL iniciado
[2026-01-18T19:48:45.329Z] 📡 Cotação atual: R$ 5.37
[2026-01-18T19:48:45.329Z] ✅ Auto-sync concluído com sucesso
```

### Verificação Manual
Execute periodicamente para verificar status:
```bash
node scripts/monitor-usd-rates.js
```

### Alertas por Email (Opcional)
Modificar `scripts/auto-sync-usd-rates.js` para enviar emails em caso de erro:

```javascript
// Adicionar no catch do erro principal
if (error.message.includes('API')) {
  // Enviar email de alerta sobre falha na API
  console.error('ALERTA: Falha na API de cotação');
}
```

## 🔧 Configuração de Ambiente

### Variáveis Necessárias
```bash
DATABASE_URL=postgresql://...              # Banco development
DATABASE_PRODUCTION_URL=postgresql://...   # Banco production
CRON_SECRET=token_seguro_aqui             # Para endpoints de cron
```

### Permissões
- Scripts precisam de acesso de leitura/escrita ao banco
- Logs precisam de permissão de escrita na pasta `logs/`

## 🚨 Troubleshooting

### Erro: "API retornou status 500"
- AwesomeAPI temporariamente indisponível
- Script usa fallback R$ 5,50
- Tentar novamente em 1 hora

### Erro: "DATABASE_PRODUCTION_URL não configurada"
- Verificar variável de ambiente
- Confirmar string de conexão

### Diferenças persistentes
- Executar sync manual: `node scripts/sync-usd-rate-production.js`
- Verificar logs de erro
- Confirmar conectividade com bancos

## 📈 Próximos Passos

1. **Implementar cron job** (escolher uma das opções acima)
2. **Configurar alertas** por email/Slack em caso de falha
3. **Monitorar logs** regularmente
4. **Ajustar frequência** conforme necessário

## 🎯 Benefícios

- ✅ Cotações sempre atualizadas
- ✅ Preços Meta consistentes entre ambientes
- ✅ Redução de discrepâncias manuais
- ✅ Logs detalhados para auditoria
- ✅ Execução automática e confiável