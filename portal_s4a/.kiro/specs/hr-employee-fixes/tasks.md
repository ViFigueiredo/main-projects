# Implementation Plan

- [x] 1. Implementar multi-seleção no filtro de cargos





  - Atualizar componente EmployeeFilters para suportar array de job positions
  - Implementar Popover com Command component similar ao dashboard
  - Adicionar estado para controlar seleções múltiplas
  - Implementar lógica de toggle para adicionar/remover cargos
  - Adicionar badge para mostrar quantidade de cargos selecionados
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Escrever teste de propriedade para consistência de multi-seleção
  - **Property 1: Multi-selection Filter Consistency**
  - **Validates: Requirements 1.2**

- [ ]* 1.2 Escrever teste de propriedade para comportamento de remoção de filtro
  - **Property 2: Filter Removal Behavior**
  - **Validates: Requirements 1.3**

- [ ]* 1.3 Escrever teste de propriedade para exibição de contador
  - **Property 3: Selection Counter Display**
  - **Validates: Requirements 1.4**

- [x] 2. Atualizar lógica de filtragem no componente pai





  - Modificar employees-page-client.tsx para lidar com array de job positions
  - Atualizar função de filtragem para suportar múltiplos cargos
  - Implementar lógica OR para funcionários com qualquer cargo selecionado
  - Testar integração com outros filtros existentes
  - _Requirements: 1.2, 1.3_

- [x] 3. Identificar e corrigir exportação Excel





  - Localizar função atual de exportação Excel de funcionários
  - Adicionar campos trial_end_part1 e trial_end_part2 aos dados de exportação
  - Implementar formatação de data DD/MM/YYYY para campos de término de experiência
  - Tratar valores nulos/vazios com "-" ou célula vazia
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 3.1 Escrever teste de propriedade para inclusão de coluna Parte 1
  - **Property 4: Excel Export Column Inclusion - Part 1**
  - **Validates: Requirements 2.1**

- [ ]* 3.2 Escrever teste de propriedade para inclusão de coluna Parte 2
  - **Property 5: Excel Export Column Inclusion - Part 2**
  - **Validates: Requirements 2.2**

- [ ]* 3.3 Escrever teste de propriedade para tratamento de datas nulas
  - **Property 6: Null Date Handling in Export**
  - **Validates: Requirements 2.3**

- [ ]* 3.4 Escrever teste de propriedade para consistência de formato de data
  - **Property 7: Date Format Consistency in Export**
  - **Validates: Requirements 2.4**

- [x] 4. Criar utilitários para tratamento de timezone





  - Criar função adjustDateForTimezone em date-helpers.ts
  - Implementar formatDateDisplay com ajuste de timezone
  - Criar função formatDateForExcel consistente
  - Documentar estratégia de timezone para o projeto
  - _Requirements: 3.1, 3.4, 3.5_

- [ ]* 4.1 Escrever teste de propriedade para precisão de ajuste de timezone
  - **Property 8: Timezone Adjustment Accuracy**
  - **Validates: Requirements 3.1**

- [ ]* 4.2 Escrever teste de propriedade para consistência de formatação
  - **Property 10: Date Formatting Consistency**
  - **Validates: Requirements 3.4**

- [ ]* 4.3 Escrever teste de propriedade para tratamento uniforme de timezone
  - **Property 11: Uniform Timezone Treatment**
  - **Validates: Requirements 3.5**

- [x] 5. Corrigir cálculo de contratos a vencer no dashboard





  - Atualizar trialContractsExpiring no hr-dashboard-client.tsx
  - Aplicar adjustDateForTimezone nas datas de trial_end_part1 e trial_end_part2
  - Corrigir função formatDateDisplay usada no componente
  - Testar com diferentes timezones e datas
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 5.1 Escrever teste de propriedade para fidelidade de exibição de data
  - **Property 9: Date Display Fidelity**
  - **Validates: Requirements 3.2**

- [x] 6. Checkpoint - Garantir que todos os testes passem









  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Testes de integração e validação
  - Testar multi-seleção de cargos com diferentes combinações
  - Validar exportação Excel com funcionários com e sem datas de término
  - Verificar dashboard com contratos próximos ao vencimento
  - Testar em diferentes navegadores e timezones
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ]* 7.1 Escrever testes de integração para workflow completo de filtros
  - Testar combinação de filtros de cargo com outros filtros
  - Validar reset de filtros e estado inicial
  - _Requirements: 1.1, 1.5_

- [ ]* 7.2 Escrever testes de integração para exportação Excel completa
  - Testar exportação com dataset misto (com e sem datas)
  - Validar formatação e ordem das colunas
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 7.3 Escrever testes de integração para dashboard de contratos
  - Testar cálculo de dias restantes
  - Validar ordenação por proximidade de vencimento
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 8. Checkpoint Final - Validação completa
  - Ensure all tests pass, ask the user if questions arise.