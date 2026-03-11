# Reestruturação da Navegação CRM - Operações em Cadastro

**Data:** 10/12/2025  
**Status:** 📋 Especificação  
**Prioridade:** 🟡 Média  
**Complexidade:** 🟢 Baixa

---

## 📋 Visão Geral

Reorganizar a estrutura de navegação do CRM para mover "Operações e Departamentos" para dentro da seção "Cadastro", consolidando todas as funcionalidades de configuração em um local mais lógico e intuitivo.

## 🎯 Objetivos

### Principais
- Mover "Operações e Departamentos" para dentro de "Cadastro"
- Manter "Departamentos" e "Permissões" como funcionalidades dentro de "Operações"
- Melhorar a organização lógica da navegação
- Facilitar o acesso às configurações relacionadas

### Secundários
- Manter todas as funcionalidades existentes intactas
- Preservar URLs existentes para compatibilidade
- Melhorar a experiência do usuário na navegação

---

## 🏗️ Estrutura Atual vs Nova

### Estrutura Atual
```
CRM
├── Clientes
├── Oportunidades
├── Pedidos
├── Demandas
├── Estoque
├── Cobrança
├── Operações e Departamentos ← Está aqui
└── Cadastros
    ├── Produtos
    ├── Categorias
    ├── Status e Etapas
    └── Campos Personalizados
```

### Nova Estrutura Proposta
```
CRM
├── Clientes
├── Oportunidades
├── Pedidos
├── Demandas
├── Estoque
├── Cobrança
└── Cadastro ← Renomeado de "Cadastros"
    ├── Produtos
    ├── Categorias
    ├── Status e Etapas
    ├── Campos Personalizados
    └── Operações ← Movido para cá
        ├── Operações (aba)
        ├── Departamentos (aba)
        └── Permissões (aba)
```

---

## 📊 Requisitos Funcionais

### RF001 - Reorganização da Navegação
**Como** usuário do sistema  
**Quero** encontrar as configurações de operações dentro da seção Cadastro  
**Para que** eu tenha uma organização mais lógica das funcionalidades

#### Critérios de Aceitação
1. **QUANDO** acesso CRM **ENTÃO** vejo "Cadastro" (singular) ao invés de "Cadastros"
2. **QUANDO** acesso CRM > Cadastro **ENTÃO** vejo "Operações" como uma das opções
3. **QUANDO** não vejo mais "Operações e Departamentos" como item separado no menu CRM
4. **QUANDO** acesso CRM > Cadastro > Operações **ENTÃO** vejo as mesmas 3 abas (Operações, Departamentos, Permissões)
5. **QUANDO** uso URLs antigas **ENTÃO** sou redirecionado automaticamente para as novas URLs

### RF002 - Preservação de Funcionalidades
**Como** usuário do sistema  
**Quero** que todas as funcionalidades existentes continuem funcionando  
**Para que** não haja perda de produtividade

#### Critérios de Aceitação
1. **QUANDO** acesso Operações **ENTÃO** posso gerenciar operações normalmente
2. **QUANDO** acesso Departamentos **ENTÃO** posso gerenciar departamentos normalmente
3. **QUANDO** acesso Permissões **ENTÃO** posso gerenciar permissões normalmente
4. **QUANDO** uso qualquer funcionalidade **ENTÃO** ela funciona exatamente como antes
5. **QUANDO** salvo alterações **ENTÃO** elas são persistidas corretamente

### RF003 - Compatibilidade de URLs
**Como** usuário do sistema  
**Quero** que links salvos e bookmarks continuem funcionando  
**Para que** não haja quebra de fluxo de trabalho

#### Critérios de Aceitação
1. **QUANDO** acesso `/crm/config/operations` **ENTÃO** sou redirecionado para `/crm/config#operations`
2. **QUANDO** acesso URL antiga **ENTÃO** vejo mensagem de redirecionamento (opcional)
3. **QUANDO** compartilho link **ENTÃO** ele usa a nova estrutura
4. **QUANDO** navego pelo sistema **ENTÃO** URLs refletem a nova estrutura
5. **QUANDO** uso botão voltar **ENTÃO** navegação funciona corretamente

---

## 🗂️ Estrutura de Arquivos

### Mudanças Necessárias

#### 1. Configuração de Rotas (`src/config/routes.ts`)
```typescript
// ANTES
{
  title: 'Operações e Departamentos',
  href: '/crm/config/operations',
  icon: Network,
  permissionKey: 'crm_settings_view',
},
{
  title: 'Cadastros',
  href: '/crm/config',
  icon: Database,
  permissionKey: 'crm_settings_view',
}

// DEPOIS
{
  title: 'Cadastro',
  href: '/crm/config',
  icon: Database,
  permissionKey: 'crm_settings_view',
}
```

#### 2. Página de Configuração (`src/app/crm/config/page.tsx`)
```typescript
// Adicionar nova aba "Operações" ao TabsList existente
<TabsList className="space-x-2">
  <TabsTrigger value="products">Produtos</TabsTrigger>
  <TabsTrigger value="categories">Categorias</TabsTrigger>
  <TabsTrigger value="statuses">Status e Etapas</TabsTrigger>
  <TabsTrigger value="custom-fields">Campos Personalizados</TabsTrigger>
  <TabsTrigger value="operations">Operações</TabsTrigger> {/* NOVO */}
</TabsList>

// Adicionar novo TabsContent
<TabsContent value="operations">
  <Card>
    <CardHeader>
      <CardTitle>Operações e Departamentos</CardTitle>
      <CardDescription>
        Configure a estrutura hierárquica do CRM por operações e departamentos
      </CardDescription>
    </CardHeader>
    <CardContent>
      <OperationsTabsContent /> {/* Componente com as 3 abas internas */}
    </CardContent>
  </Card>
</TabsContent>
```

#### 3. Redirecionamento (`src/app/crm/config/operations/page.tsx`)
```typescript
// Transformar em página de redirecionamento
import { redirect } from 'next/navigation';

export default function OperationsRedirectPage() {
  redirect('/crm/config#operations');
}
```

#### 4. Novo Componente (`src/components/crm/config/operations-tabs-content.tsx`)
```typescript
// Mover o conteúdo das 3 abas para este componente
export function OperationsTabsContent() {
  return (
    <Tabs defaultValue="operations" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="operations">Operações</TabsTrigger>
        <TabsTrigger value="departments">Departamentos</TabsTrigger>
        <TabsTrigger value="permissions">Permissões</TabsTrigger>
      </TabsList>

      <TabsContent value="operations" className="space-y-6">
        <OperationsManager />
      </TabsContent>

      <TabsContent value="departments" className="space-y-6">
        <DepartmentsManager />
      </TabsContent>

      <TabsContent value="permissions" className="space-y-6">
        <UserDepartmentPermissions />
      </TabsContent>
    </Tabs>
  );
}
```

---

## 🔄 Plano de Implementação

### Fase 1: Preparação (30 minutos)
1. **Criar componente** `OperationsTabsContent`
2. **Mover lógica** das 3 abas para o novo componente
3. **Testar** funcionamento isolado

### Fase 2: Integração (45 minutos)
1. **Modificar** `src/app/crm/config/page.tsx`
2. **Adicionar** nova aba "Operações"
3. **Integrar** componente `OperationsTabsContent`
4. **Testar** navegação entre abas

### Fase 3: Redirecionamento (15 minutos)
1. **Modificar** `src/app/crm/config/operations/page.tsx`
2. **Implementar** redirecionamento
3. **Testar** URLs antigas

### Fase 4: Atualização de Rotas (15 minutos)
1. **Modificar** `src/config/routes.ts`
2. **Remover** item "Operações e Departamentos"
3. **Renomear** "Cadastros" para "Cadastro"
4. **Testar** navegação completa

### Fase 5: Validação (15 minutos)
1. **Testar** todas as funcionalidades
2. **Verificar** redirecionamentos
3. **Validar** permissões
4. **Confirmar** URLs

---

## 🧪 Testes Necessários

### Testes Funcionais
- [ ] Navegação para CRM > Cadastro funciona
- [ ] Aba "Operações" aparece corretamente
- [ ] Todas as 3 sub-abas funcionam (Operações, Departamentos, Permissões)
- [ ] CRUD de operações funciona normalmente
- [ ] CRUD de departamentos funciona normalmente
- [ ] Gestão de permissões funciona normalmente

### Testes de Compatibilidade
- [ ] URL `/crm/config/operations` redireciona corretamente
- [ ] Bookmarks antigos funcionam
- [ ] Links compartilhados funcionam
- [ ] Navegação com botão voltar funciona
- [ ] Breadcrumbs (se existirem) estão corretos

### Testes de Permissões
- [ ] Usuários com `crm_settings_view` veem a aba
- [ ] Usuários sem permissão não veem a aba
- [ ] Redirecionamento respeita permissões
- [ ] Acesso direto via URL respeita permissões

---

## 📱 Impacto na Interface

### Mudanças Visuais
- Menu CRM terá um item a menos ("Operações e Departamentos" removido)
- "Cadastros" vira "Cadastro" (singular)
- Página de Cadastro terá uma aba adicional ("Operações")
- Layout das 3 sub-abas permanece idêntico

### Experiência do Usuário
- **Melhoria**: Configurações mais organizadas logicamente
- **Melhoria**: Menos itens no menu principal
- **Neutro**: Mesmo número de cliques para acessar funcionalidades
- **Melhoria**: Agrupamento lógico de todas as configurações

---

## ⚠️ Riscos e Mitigações

### Riscos Técnicos
- **Quebra de URLs**: Links salvos podem parar de funcionar
  - *Mitigação*: Implementar redirecionamentos automáticos
- **Confusão de usuários**: Mudança na navegação
  - *Mitigação*: Comunicar mudança e manter funcionalidades idênticas

### Riscos de Negócio
- **Resistência à mudança**: Usuários podem se confundir
  - *Mitigação*: Mudança é sutil e melhora organização
- **Perda de produtividade**: Tempo para se adaptar
  - *Mitigação*: Funcionalidades permanecem idênticas

---

## 📋 Critérios de Aceitação Gerais

### Funcionalidade
- [ ] Todas as funcionalidades de operações funcionam normalmente
- [ ] Todas as funcionalidades de departamentos funcionam normalmente
- [ ] Todas as funcionalidades de permissões funcionam normalmente
- [ ] Navegação é intuitiva e lógica

### Compatibilidade
- [ ] URLs antigas redirecionam corretamente
- [ ] Bookmarks continuam funcionando
- [ ] Permissões são respeitadas
- [ ] Performance não é afetada

### Interface
- [ ] Menu CRM está mais organizado
- [ ] Página de Cadastro tem todas as abas
- [ ] Layout é consistente com o resto do sistema
- [ ] Responsividade é mantida

---

## 📚 Documentação Necessária

### Técnica
- [ ] Atualizar documentação de rotas
- [ ] Documentar redirecionamentos
- [ ] Atualizar guia de navegação

### Usuário
- [ ] Comunicar mudança aos usuários
- [ ] Atualizar screenshots se existirem
- [ ] Atualizar manuais de uso

---

**Especificação criada por:** Kiro AI  
**Data:** 10/12/2025  
**Estimativa de implementação:** 2 horas  
**Próxima revisão:** Após aprovação dos requisitos