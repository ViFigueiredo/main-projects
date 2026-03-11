# Sistema de Temas e Cores - Documentação Completa

## 📋 Visão Geral

O sistema de temas do Portal Intranet S4A permite personalização completa das cores primária, secundária, accent e botões para modos claro e escuro. As configurações são armazenadas no banco de dados e aplicadas globalmente em toda a aplicação.

## 🏗️ Arquitetura

### Componentes Principais

```
┌─────────────────────────────────────────────────────────────┐
│                    app/layout.tsx                           │
│              (Root Layout - Server Side)                    │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────▼────────┐
         │ ThemeProvider  │ (next-themes)
         └───────┬────────┘
                 │
    ┌────────────▼──────────────┐
    │ GlobalThemeApplier        │ (Client Component)
    │ └─ useGlobalTheme hook    │
    └────────────┬──────────────┘
                 │
         ┌───────▼────────────────────────────┐
         │ CSS Variables dinamicamente        │
         │ aplicadas via JavaScript           │
         └───────┬────────────────────────────┘
                 │
    ┌────────────▼────────────────────────────┐
    │ Todos os componentes/páginas           │
    │ usam as variáveis CSS customizadas     │
    └─────────────────────────────────────────┘
```

### Fluxo de Dados

```
1. getThemeConfigs()           → Busca configs do banco
   (theme.actions.ts)

2. RootLayout passa configs    → GlobalThemeApplier
   para GlobalThemeApplier

3. useGlobalTheme() aplica     → Variáveis CSS globais
   cores via document.documentElement.style

4. Componentes usam            → Cores aplicadas
   variáveis CSS customizadas      em tempo real
```

## 📁 Arquivos Principais

| Arquivo                                          | Responsabilidade                                       |
| ------------------------------------------------ | ------------------------------------------------------ |
| `src/app/layout.tsx`                             | Importa configs de tema, passa para GlobalThemeApplier |
| `src/components/layout/theme-provider.tsx`       | Wrapper do next-themes                                 |
| `src/components/layout/global-theme-applier.tsx` | Aplica cores dinamicamente                             |
| `src/hooks/use-global-theme.tsx`                 | Hook que atualiza variáveis CSS                        |
| `src/app/globals.css`                            | Define variáveis CSS customizadas                      |
| `src/app/settings/themes/page.tsx`               | Interface de configuração                              |
| `src/components/settings/theme-form.tsx`         | Formulário para editar cores                           |
| `src/lib/actions/theme.actions.ts`               | Server Actions (CRUD)                                  |
| `src/lib/schemas/theme.ts`                       | Zod schema para validação                              |

## 🎨 Variáveis CSS Customizadas

### Variáveis Definidas

```css
:root {
  /* Modo Claro - Padrão */
  --custom-primary-hex: #000000;
  --custom-secondary-hex: #f5f5f5;
  --custom-accent-hex: #f5f5f5;
  --custom-background-hex: #ffffff;
  --custom-button-hex: #000000;
  --custom-button-hover-hex: #333333;
  --custom-button-text-hex: #ffffff;
}

.dark {
  /* Modo Escuro */
  --custom-primary-hex: #ffffff;
  --custom-secondary-hex: #262626;
  --custom-accent-hex: #262626;
  --custom-background-hex: #000000;
  --custom-button-hex: #ffffff;
  --custom-button-hover-hex: #cccccc;
  --custom-button-text-hex: #000000;
}
```

### Integração com Sidebar

```css
/* No globals.css */
--sidebar-background: var(--custom-secondary-hex);
--sidebar-foreground: var(--custom-primary-hex);
--sidebar-primary: var(--custom-primary-hex);
--sidebar-accent: var(--custom-accent-hex);
```

## 📱 Páginas com Temas Integrados

### ✅ Com DashboardLayout (Temas Completos)

- `/` - Página inicial
- `/crm` - CRM
- `/crm/clients` - Carteira de clientes
- `/hr` - Recursos Humanos
- `/hr/employees` - Funcionários
- `/intranet` - Intranet
- `/reports` - Relatórios
- `/reports/[reportId]` - Detalhe de relatório
- `/settings/*` - Todas as páginas de configurações
- `/training` - Treinamentos

### ✅ Com GlobalThemeApplier Direto (Novo)

- `/login` - Tela de login
  - Fundo usa `--custom-background-hex`
  - Botão usa `--custom-button-hex`
  - Hover usa `--custom-button-hover-hex`

## 🔧 Como Usar

### 1. Usar Cores em Componentes

**Via Tailwind CSS (recomendado):**

```tsx
<div className="bg-sidebar-background text-sidebar-foreground">Conteúdo</div>
```

**Via Style Props Inline:**

```tsx
<div
  style={{
    backgroundColor: 'var(--custom-primary-hex)',
    color: 'var(--custom-button-text-hex)',
  }}
>
  Conteúdo
</div>
```

### 2. Adicionar Temas a Novas Páginas

Se criar uma página fora de DashboardLayout:

```tsx
import { GlobalThemeApplier } from '@/components/layout/global-theme-applier';
import { getThemeConfigs } from '@/lib/actions/theme.actions';

export default async function NovaPage() {
  const themeConfigs = await getThemeConfigs();

  return (
    <GlobalThemeApplier configs={themeConfigs}>
      <div style={{ backgroundColor: 'var(--custom-background-hex)' }}>
        {/* Conteúdo */}
      </div>
    </GlobalThemeApplier>
  );
}
```

### 3. Alterar Cores em Tempo Real

Acesse: **Settings → Temas e Cores**

- Edite as cores para modo Claro ou Escuro
- Clique em "Salvar"
- As mudanças são aplicadas imediatamente em toda a aplicação

## 📊 Banco de Dados

### Tabela: `themes`

```sql
CREATE TABLE themes (
  id SERIAL PRIMARY KEY,
  mode TEXT UNIQUE NOT NULL CHECK (mode IN ('light', 'dark')),
  primary_color TEXT NOT NULL,
  secondary_color TEXT NOT NULL,
  accent_color TEXT NOT NULL,
  background_color TEXT NOT NULL,
  button_color TEXT NOT NULL,
  button_hover_color TEXT NOT NULL,
  button_text_color TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Dados Padrão

Ao inicializar o banco, os seguintes temas são criados:

```sql
-- Tema Claro
INSERT INTO themes (mode, primary_color, secondary_color, accent_color, ...)
VALUES ('light', '#000000', '#f5f5f5', '#f5f5f5', ...);

-- Tema Escuro
INSERT INTO themes (mode, primary_color, secondary_color, accent_color, ...)
VALUES ('dark', '#ffffff', '#262626', '#262626', ...);
```

## 🚀 Fluxo de Atualização de Cores

```
1. Usuário acessa: Settings → Temas e Cores
2. Edita as cores no formulário
3. Clica em "Salvar"
4. updateThemeConfig() é executado (Server Action)
5. Cores são salvas no banco com ON CONFLICT UPDATE
6. revalidatePath() invalida cache
7. useGlobalTheme() detecta mudança
8. Variáveis CSS são atualizadas no document
9. Componentes re-renderizam com novas cores
```

## 🎯 Casos de Uso

### Caso 1: Empresa com Branding Customizado

1. Acesse Settings → Temas e Cores
2. Defina cores primárias conforme identidade visual
3. Clique em "Salvar"
4. Toda a aplicação reflete as mudanças

### Caso 2: Modo Claro/Escuro por Preferência

1. Sistema detecta preferência do navegador via `useTheme()`
2. Aplica automaticamente cores correspondentes
3. Usuário pode alternar via botão de tema na barra superior

### Caso 3: Temas Sazonais

1. Crie temas sazonais com cores especiais
2. Atualize o banco conforme necessário
3. Aplicação renderiza automaticamente

## 🔒 Segurança

- Cores são validadas com regex hexadecimal
- Apenas usuários com permissão `settings_themes` podem editar
- Variáveis CSS não executam código (seguro contra XSS)

## ⚡ Performance

- Cores são carregadas uma única vez no layout raiz (SSR)
- Atualização de cores usa `useEffect` (não bloqueia renderização)
- Variáveis CSS nativas são otimizadas pelo navegador
- Sem re-renderizações desnecessárias

## 🐛 Troubleshooting

### Problema: Cores não mudam após salvar

**Solução:**

1. Limpe o cache: `revalidatePath('/')`
2. Faça refresh da página (Ctrl+R)
3. Verifique se as cores estão salvando no banco

### Problema: Temas não aplicados no login

**Solução:**

1. Certifique-se de que `GlobalThemeApplier` envolve a página
2. Verifique se `getThemeConfigs()` está sendo chamado
3. Verifique console para erros de JavaScript

### Problema: Cores diferentes entre light/dark

**Solução:**

1. Edite ambos os temas em Settings → Temas e Cores
2. Salve mudanças para light e dark separadamente
3. Teste alternando entre modos

## 📚 Referências

- [next-themes Documentation](https://github.com/pacocoursey/next-themes)
- [Tailwind CSS Custom Properties](https://tailwindcss.com/docs/customizing-colors)
- [CSS Variables (Custom Properties)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
