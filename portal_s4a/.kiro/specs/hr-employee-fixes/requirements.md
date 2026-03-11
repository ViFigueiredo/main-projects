# Requirements Document

## Introduction

Este documento especifica as correções necessárias no módulo de RH (Recursos Humanos) do Portal S4A, focando em três problemas identificados:
1. Filtro de cargos sem suporte a multi-seleção
2. Campos de término de experiência ausentes na exportação Excel
3. Data incorreta (D-1) no gráfico de contratos a vencer

## Glossary

- **Sistema**: Portal S4A - Sistema de intranet corporativa
- **Módulo RH**: Módulo de Recursos Humanos do sistema
- **Filtro de Cargos**: Componente de interface que permite filtrar funcionários por cargo
- **Exportação Excel**: Funcionalidade que exporta dados de funcionários para planilha Excel
- **Gráfico de Contratos**: Visualização de contratos de experiência próximos ao vencimento
- **Multi-seleção**: Capacidade de selecionar múltiplos itens simultaneamente
- **Término Experiência**: Datas de término das partes 1 e 2 do contrato de experiência
- **D-1**: Data com um dia a menos que o esperado (erro de timezone)

## Requirements

### Requirement 1

**User Story:** Como usuário do RH, quero selecionar múltiplos cargos no filtro de funcionários, para que eu possa visualizar dados de diferentes cargos simultaneamente.

#### Acceptance Criteria

1. WHEN o usuário clica no filtro de cargos THEN o Sistema SHALL exibir uma lista de cargos com checkboxes para multi-seleção
2. WHEN o usuário seleciona múltiplos cargos THEN o Sistema SHALL filtrar a tabela de funcionários mostrando apenas aqueles que possuem um dos cargos selecionados
3. WHEN o usuário remove um cargo da seleção THEN o Sistema SHALL atualizar a tabela removendo funcionários daquele cargo
4. WHEN múltiplos cargos estão selecionados THEN o Sistema SHALL exibir um badge indicando a quantidade de cargos selecionados
5. WHEN o usuário limpa os filtros THEN o Sistema SHALL remover todas as seleções de cargos e exibir todos os funcionários

### Requirement 2

**User Story:** Como usuário do RH, quero que a exportação Excel inclua as datas de término de experiência, para que eu possa ter um registro completo dos contratos de experiência.

#### Acceptance Criteria

1. WHEN o usuário exporta dados de funcionários para Excel THEN o Sistema SHALL incluir a coluna "Término Experiência - Parte 1" com a data formatada em DD/MM/YYYY
2. WHEN o usuário exporta dados de funcionários para Excel THEN o Sistema SHALL incluir a coluna "Término Experiência - Parte 2" com a data formatada em DD/MM/YYYY
3. WHEN um funcionário não possui data de término de experiência THEN o Sistema SHALL exibir célula vazia ou "-" na coluna correspondente
4. WHEN a exportação é concluída THEN o Sistema SHALL manter a ordem e formatação consistente com as outras colunas de data

### Requirement 3

**User Story:** Como usuário do RH, quero que o gráfico de contratos a vencer exiba a data correta, para que eu possa confiar nas informações apresentadas.

#### Acceptance Criteria

1. WHEN o Sistema calcula a data de vencimento de contrato THEN o Sistema SHALL ajustar corretamente o timezone para evitar deslocamento de data
2. WHEN o Sistema exibe a data no gráfico de contratos a vencer THEN o Sistema SHALL mostrar a data exata armazenada no banco de dados sem subtração de dias
3. WHEN um contrato tem data de vencimento "2025-12-20" THEN o Sistema SHALL exibir "20/12/2025" e não "19/12/2025"
4. WHEN o Sistema formata datas para exibição THEN o Sistema SHALL usar UTC ou ajuste de timezone consistente para evitar mudanças de dia
5. WHEN múltiplos contratos são exibidos THEN o Sistema SHALL aplicar o mesmo tratamento de timezone para todas as datas
