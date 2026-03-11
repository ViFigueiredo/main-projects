# Funcionalidade de Busca e Seleção Múltiplas no Kanban de Equipes

## Visão Geral

Foi implementada a funcionalidade de busca e seleção múltipla na coluna "Não Classificados" do quadro Kanban de Equipes (RH). Isso permite que os usuários filtrem funcionários e movam múltiplos funcionários de uma vez para uma equipe.

## Alterações Realizadas

### Backend

- **Arquivo:** `src/lib/actions/teams.ts`
- **Nova Função:** `updateEmployeesTeam(employeeIds: number[], teamId: number | null)`
  - Recebe um array de IDs de funcionários e o ID da equipe de destino.
  - Executa uma atualização em massa no banco de dados (`UPDATE employees SET department_id = ... WHERE id IN ...`).
  - Retorna sucesso ou falha.

### Frontend

- **Arquivo:** `src/components/hr/teams/kanban-board.tsx`
- **Estado:**
  - `searchTerm`: Armazena o termo de busca.
  - `selectedEmployeeIds`: Armazena os IDs dos funcionários selecionados.
- **Lógica de Filtragem:**
  - `filteredUnclassifiedEmployees`: Filtra a lista de "Não Classificados" com base no nome ou cargo.
- **Interface:**
  - Adicionado campo de busca no cabeçalho da coluna "Não Classificados".
  - Adicionado botão "Limpar" para desfazer a seleção.
  - Adicionado `Checkbox` em cada cartão de funcionário (visível ao passar o mouse ou quando selecionado).
  - Indicador visual de quantidade de itens sendo arrastados (badge vermelho).
- **Interação (Drag & Drop):**
  - Ao arrastar um item selecionado, todos os itens selecionados são movidos visualmente (otimista) e no backend.
  - Ao arrastar um item não selecionado, a seleção anterior é limpa e apenas o item arrastado é movido.

## Como Usar

1. **Buscar:** Digite no campo de busca no topo da coluna "Não Classificados".
2. **Selecionar:** Clique na caixa de seleção (checkbox) no canto superior direito do cartão do funcionário.
3. **Mover em Massa:** Com vários itens selecionados, arraste qualquer um deles para uma equipe de destino. Todos os selecionados serão movidos.