# 🔄 Workflow de Desenvolvimento - Portal S4A

**Objetivo:** Padronizar o processo de desenvolvimento de funcionalidades  
**Tempo estimado:** Setup inicial 30min, uso diário 5-10min  
**Pré-requisitos:** Acesso ao repositório, Neon Database configurado

---

## 🎯 Visão Geral

Este guia estabelece o workflow padrão para desenvolvimento de funcionalidades no Portal S4A, garantindo qualidade, consistência e rastreabilidade.

---

## 📋 Processo Completo

### **Fase 1: Planejamento** (30-60 min)

#### 1.1 Análise da Solicitação
```bash
# Localizar especificação
# Verificar em docs/specs/ ou prompts.txt
```

**Checklist:**
- [ ] Requisitos claros definidos
- [ ] Impacto no sistema avaliado
- [ ] Dependências identificadas
- [ ] Tempo estimado definido

#### 1.2 Criar Especificação (se não existir)
```bash
# Criar arquivo em docs/specs/
# Formato: SPEC_NOME_FUNCIONALIDADE.md
```

**Template mínimo:**
```markdown
# Spec: [FUNCIONALIDADE]
**Prioridade:** Alta/Média/Baixa
**Complexidade:** Alta/Média/Baixa
**Tempo:** X dias

## Requisitos
- Requisito 1
- Requisito 2

## Implementação
- Backend: schemas, actions, migrations
- Frontend: componentes, páginas
- Testes: validações necessárias
```

### **Fase 2: Setup Técnico** (15-30 min)

#### 2.1 Criar Branch de Desenvolvimento
```bash
# Usar Neon Database branching
# Seguir: docs/steerings/WORKFLOW_NEON_BRANCHES.md

# Criar branch no Neon
neonctl branches create feature-nome-funcionalidade --project-id restless-morning-33051903

# Atualizar .env.local com nova DATABASE_URL
```

#### 2.2 Preparar Ambiente
```bash
# Instalar dependências (se necessário)
npm install

# Verificar build
npm run build

# Iniciar desenvolvimento
npm run dev
```

### **Fase 3: Desenvolvimento** (Tempo variável)

#### 3.1 Backend First
```typescript
// 1. Schemas (src/lib/schemas/)
// 2. Migrations (src/lib/migrations/)
// 3. Actions (src/lib/actions/)
// 4. Testes básicos
```

**Ordem recomendada:**
1. **Schemas Zod** - Definir tipos e validações
2. **Migrations SQL** - Estrutura do banco
3. **Server Actions** - Lógica de negócio
4. **Validação** - Testar com dados reais

#### 3.2 Frontend Second
```typescript
// 1. Componentes base (src/components/)
// 2. Páginas (src/app/)
// 3. Integração com actions
// 4. Testes de interface
```

**Ordem recomendada:**
1. **Componentes UI** - Formulários, tabelas, modais
2. **Páginas** - Integração dos componentes
3. **Estados** - Loading, error, success
4. **Validação UX** - Fluxos completos

#### 3.3 Padrões Obrigatórios

**Server Actions:**
```typescript
// Sempre incluir
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/lib/auth';

export async function createSomething(data: Schema) {
  const user = await getCurrentUser();
  if (!user || !hasPermission(user, 'action')) {
    return { success: false, error: 'Permissão negada.' };
  }

  try {
    // Lógica aqui
    revalidatePath('/relevant/path');
    return { success: true };
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: 'Erro interno.' };
  }
}
```

**Componentes:**
```typescript
// Sempre incluir tratamento de erro e loading
const [loading, setLoading] = useState(false);

const handleSubmit = async (data) => {
  setLoading(true);
  try {
    const result = await serverAction(data);
    if (result.success) {
      toast.success('Sucesso!');
      onSuccess?.();
    } else {
      toast.error(result.error);
    }
  } catch (error) {
    toast.error('Erro inesperado');
  } finally {
    setLoading(false);
  }
};
```

### **Fase 4: Validação** (30-60 min)

#### 4.1 Testes Funcionais
```bash
# Checklist de testes
- [ ] Criar registro
- [ ] Editar registro  
- [ ] Deletar registro
- [ ] Validações funcionam
- [ ] Permissões respeitadas
- [ ] Performance aceitável
```

#### 4.2 Testes de Build
```bash
# Verificar build de produção
npm run build

# Verificar tipos TypeScript
npx tsc --noEmit
```

#### 4.3 Documentação
```bash
# Criar/atualizar documentação
# Se correção: docs/fixes/FIX_NOME.md
# Se feature: docs/specs/FEATURE_NOME.md
```

### **Fase 5: Deploy** (15-30 min)

#### 5.1 Merge para Develop
```bash
# Aplicar mudanças no branch develop do Neon
neonctl branches restore develop feature-nome-funcionalidade --project-id restless-morning-33051903

# Testar em ambiente de desenvolvimento
```

#### 5.2 Deploy para Produção
```bash
# Após validação, merge para production
neonctl branches restore production develop --project-id restless-morning-33051903

# Deploy automático via Vercel
```

---

## 🚨 Checklist de Qualidade

### **Antes de Commitar**
- [ ] Build passa sem erros
- [ ] TypeScript sem erros
- [ ] Funcionalidade testada manualmente
- [ ] Permissões validadas
- [ ] Performance verificada

### **Antes de Deploy**
- [ ] Documentação atualizada
- [ ] Migrations testadas
- [ ] Rollback plan definido
- [ ] Stakeholders notificados

### **Após Deploy**
- [ ] Funcionalidade validada em produção
- [ ] Métricas monitoradas
- [ ] Feedback coletado
- [ ] Issues documentadas

---

## 🔧 Ferramentas e Comandos

### **Desenvolvimento Diário**
```bash
# Iniciar desenvolvimento
npm run dev

# Verificar tipos
npx tsc --noEmit

# Build de produção
npm run build

# Logs do Neon
neonctl branches list --project-id restless-morning-33051903
```

### **Database Management**
```bash
# Criar branch
neonctl branches create nome-branch --project-id restless-morning-33051903

# Listar branches
neonctl branches list --project-id restless-morning-33051903

# Restaurar branch
neonctl branches restore target source --project-id restless-morning-33051903

# Connection string
neonctl connection-string --branch-id br-xxx --project-id restless-morning-33051903
```

### **Debugging**
```bash
# Logs detalhados
console.log('Debug info:', { user, data, result });

# Verificar permissões
console.log('User permissions:', user.permissions);

# Verificar queries
console.log('Query result:', queryResult);
```

---

## 🚨 Problemas Comuns

### **Build Falha**
```bash
# Limpar cache
rm -rf .next
npm run build

# Verificar imports
# Verificar tipos TypeScript
```

### **Database Connection**
```bash
# Verificar .env.local
# Verificar DATABASE_URL
# Testar conexão com neonctl
```

### **Permissões Negadas**
```bash
# Verificar user.role
# Verificar user.permissions
# Verificar getCurrentUser()
```

---

## 📊 Métricas de Sucesso

### **Desenvolvimento**
- **Tempo médio por feature:** < tempo estimado
- **Bugs em produção:** < 1 por feature
- **Retrabalho:** < 20% do tempo

### **Qualidade**
- **Build success rate:** > 95%
- **TypeScript errors:** 0
- **Performance:** Sem degradação

### **Processo**
- **Documentação:** 100% das features
- **Testes:** 100% das funcionalidades críticas
- **Reviews:** 100% do código

---

## 🔄 Melhoria Contínua

### **Retrospectivas Semanais**
- O que funcionou bem?
- O que pode melhorar?
- Quais bloqueios encontramos?
- Como otimizar o processo?

### **Atualizações do Workflow**
- Incorporar aprendizados
- Atualizar ferramentas
- Refinar processos
- Documentar mudanças

---

**Workflow mantido por:** Equipe de Desenvolvimento  
**Última atualização:** 2025-12-10  
**Próxima revisão:** 2025-12-17