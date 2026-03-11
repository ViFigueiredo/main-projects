# Automação de Banco por Branch Git

Sistema automático que seleciona o banco de dados correto baseado na branch Git atual.

## Como Funciona

### Detecção Automática
- **Branch `main`**: Usa banco de produção (super-cake)
- **Branch `develop`**: Usa banco de desenvolvimento (wandering-sound)
- **Outras branches**: Usa banco de desenvolvimento como padrão

### Prioridade de Configuração
1. **Produção Vercel**: Se `DATABASE_URL` existe no ambiente, usa ela
2. **Desenvolvimento Local**: Detecta branch Git e seleciona URL automaticamente

## Configuração

### 1. Arquivo `.env.local`
Remova ou comente a linha `DATABASE_URL`:
```bash
# Database Neon - Automático baseado na branch Git
# main: production database
# develop: development database  
# Outros: usa development como padrão
```

### 2. Vercel (Produção)
Configure `DATABASE_URL` nas variáveis de ambiente da Vercel:
```
DATABASE_URL=postgresql://neondb_owner:npg_8UYDu9EoflOb@ep-super-cake-ad2s6vvq.c-2.us-east-1.aws.neon.tech/intranet?sslmode=require&channel_binding=require
```

### 3. Deploy Automático
O `vercel.json` está configurado para deploy apenas na branch `main`:
```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": false
    }
  }
}
```

## Vantagens

✅ **Sem troca manual**: Não precisa mais comentar/descomentar URLs  
✅ **Segurança**: Impossível usar banco errado por engano  
✅ **Deploy controlado**: Apenas branch `main` faz deploy na Vercel  
✅ **Logs claros**: Mostra qual banco está sendo usado  

## Logs de Exemplo

```bash
🔗 [Database] Branch: main -> PRODUCTION
🔗 [Database] Branch: develop -> DEVELOPMENT
⚠️ [Database] Não foi possível detectar branch, usando DEVELOPMENT
```

## Troubleshooting

### Problema: "child_process not supported in Edge Runtime"
- **Causa**: Warning do Next.js, mas não impede funcionamento
- **Solução**: Ignorar - é apenas um warning, o build funciona normalmente

### Problema: Usando banco errado
- **Verificar**: Logs no console mostram qual banco está sendo usado
- **Solução**: Confirmar que está na branch correta com `git branch`

### Problema: Deploy em branch develop
- **Causa**: Configuração incorreta na Vercel
- **Solução**: Verificar se `vercel.json` tem `"develop": false`