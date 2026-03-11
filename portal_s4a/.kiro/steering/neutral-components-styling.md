# Componentes com Cores Neutras

## Visão Geral

O Portal S4A possui um sistema de temas dinâmicos que aplica cores customizadas (definidas no banco de dados) aos botões e elementos interativos. No entanto, alguns componentes devem manter cores neutras independentemente do tema ativo.

## Problema

O sistema de temas usa variáveis CSS (`--custom-button-hex`, etc.) e regras CSS com `!important` para aplicar cores em botões. Isso pode afetar componentes que deveriam ter cores neutras, como:

- Checkboxes
- Tabs
- Select triggers
- Botões de filtro
- Botões de navegação de calendário

## Solução

### 1. Atributo `data-neutral="true"`

Adicione o atributo `data-neutral="true"` em componentes que devem ignorar as cores do tema:

```tsx
// Exemplo no Checkbox
<CheckboxPrimitive.Root
  data-neutral="true"
  className="..."
/>

// Exemplo em Button
<Button data-neutral="true" variant="outline">
  Filtrar
</Button>
```

### 2. Classes CSS Neutras

Use classes Tailwind com cores fixas em vez de variáveis de tema:

```tsx
// ❌ Evitar (usa variáveis de tema)
className="border-primary bg-primary text-primary-foreground"

// ✅ Correto (cores fixas)
className="border-gray-300 bg-gray-900 text-white"
```

### 3. Exclusão nas Regras CSS

Ao criar regras CSS que aplicam cores de tema, sempre exclua os componentes neutros:

```css
/* ❌ Errado - afeta checkboxes */
main button:not(.btn-neutral) {
  background-color: var(--custom-button-hex) !important;
}

/* ✅ Correto - exclui checkboxes */
main button:not(.btn-neutral):not([role='checkbox']):not([data-neutral="true"]) {
  background-color: var(--custom-button-hex) !important;
}
```

## Componentes Neutros

### Checkbox

O componente `src/components/ui/checkbox.tsx` usa:
- `data-neutral="true"` para exclusão via CSS
- Classes Tailwind com cores fixas: `border-gray-300`, `bg-gray-900`

```tsx
<CheckboxPrimitive.Root
  data-neutral="true"
  className={cn(
    "border border-gray-300 bg-transparent",
    "data-[state=checked]:bg-gray-900 data-[state=checked]:text-white",
    className
  )}
/>
```

### Tabs

Tabs usam a classe `neutral-tabs-trigger`:

```tsx
<TabsTrigger className="neutral-tabs-trigger">
  Aba 1
</TabsTrigger>
```

### Botões de Filtro

Botões em áreas de filtro usam a classe `btn-neutral` ou `btn-neutral-variant`:

```tsx
<Button className="btn-neutral-variant" variant="outline">
  Filtrar
</Button>
```

## Regras CSS no globals.css

### Ordem de Prioridade

As regras CSS devem seguir esta ordem no arquivo:

1. Regras gerais de tema (aplicam cores customizadas)
2. Exclusões para componentes neutros (`:not([role='checkbox'])`)
3. Regras específicas para componentes neutros (no final do arquivo)

### Regras de Checkbox (Final do Arquivo)

```css
/* CHECKBOX - CORES NEUTRAS (MÁXIMA PRIORIDADE) */
html body main button[role='checkbox'],
button[role='checkbox'] {
  background-color: transparent !important;
  border: 1px solid #d1d5db !important;
}

button[role='checkbox'][data-state='checked'] {
  background-color: #111827 !important;
  color: #ffffff !important;
  border-color: #111827 !important;
}
```

## Cores Neutras Padrão

| Estado | Background | Border | Text |
|--------|------------|--------|------|
| Normal | transparent | #d1d5db | - |
| Hover | #f9fafb | #9ca3af | - |
| Checked | #111827 | #111827 | #ffffff |
| Checked Hover | #374151 | #374151 | #ffffff |

## Checklist para Novos Componentes

Ao criar um componente que deve ter cores neutras:

- [ ] Adicionar `data-neutral="true"` no elemento raiz
- [ ] Usar classes Tailwind com cores fixas (gray-300, gray-900, etc.)
- [ ] Verificar se as regras CSS de tema excluem o componente
- [ ] Se necessário, adicionar regras específicas no final do globals.css
- [ ] Testar com diferentes temas ativos

## Troubleshooting

### Componente ainda pega cores do tema

1. Verifique se `data-neutral="true"` está presente
2. Verifique se a regra CSS tem `:not([data-neutral="true"])`
3. Adicione regras específicas no final do globals.css com alta especificidade:

```css
html body main button[role='seu-role'][data-neutral='true'] {
  background-color: #cor-desejada !important;
}
```

### Regra CSS não funciona

1. Verifique a especificidade (use `html body main` para aumentar)
2. Certifique-se de usar `!important`
3. Coloque a regra no final do arquivo globals.css

## Arquivos Relacionados

- `src/app/globals.css` - Regras CSS de tema e neutras
- `src/components/ui/checkbox.tsx` - Componente Checkbox
- `src/components/ui/button.tsx` - Componente Button
- `src/hooks/use-global-theme.tsx` - Hook que aplica variáveis de tema
