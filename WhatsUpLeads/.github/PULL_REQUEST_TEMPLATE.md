## 📝 Descrição

Descreva brevemente o que este PR faz.

## 🔗 Issue Relacionada

Fixes #(issue)

## 🎯 Tipo de Mudança

- [ ] 🐛 Bug fix (correção que não quebra funcionalidades existentes)
- [ ] ✨ Nova feature (funcionalidade que não quebra o existente)
- [ ] 💥 Breaking change (correção ou feature que altera comportamento existente)
- [ ] 📚 Documentação
- [ ] 🎨 Estilo/UI (mudanças que não afetam lógica)
- [ ] ♻️ Refatoração (mudança de código que não corrige bug nem adiciona feature)
- [ ] ⚡ Performance

## 👤 Escopo

- [ ] Super Admin (`/admin/*`)
- [ ] Tenant (`/dashboard/*`)
- [ ] Workspace (`/admin/workspace/*`)
- [ ] API
- [ ] Componentes compartilhados
- [ ] Infraestrutura/Config

## 📸 Screenshots (se UI)

| Antes | Depois |
|-------|--------|
| img   | img    |

## ✅ Checklist

### Código
- [ ] Segue os padrões de código do projeto
- [ ] Usa tema escuro (sem bg-white)
- [ ] Usa cor da marca (#5dbeb4) para destaques
- [ ] TypeScript sem erros (`pnpm tsc --noEmit`)
- [ ] Build passa (`pnpm build`)
- [ ] Lint passa (`pnpm lint`)

### Segurança/Auth
- [ ] APIs workspace usam `getWorkspaceCompanyId`
- [ ] APIs exclusivas verificam `isMaster` ou `companyId`
- [ ] Dados filtrados por `companyId` (multi-tenant)

### Testes
- [ ] Testado como Super Admin
- [ ] Testado como Tenant
- [ ] Testado em diferentes browsers (se UI)

### Documentação
- [ ] Comentários no código onde necessário
- [ ] README atualizado (se aplicável)
- [ ] Documentação da API atualizada (se aplicável)

## 📋 Notas para Revisão

Algo específico que o revisor deve prestar atenção?

## 🚀 Deploy

- [ ] Requer migration de banco de dados
- [ ] Requer novas variáveis de ambiente
- [ ] Requer rebuild de cache/assets
