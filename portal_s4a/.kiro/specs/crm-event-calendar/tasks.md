# Implementation Plan: CRM Event Calendar

## Overview

Este plano implementa o módulo de Calendário de Eventos do CRM seguindo a arquitetura existente do Portal S4A. A implementação é dividida em fases incrementais, começando pelo backend (schemas, migrations, actions) e progredindo para o frontend (componentes, páginas).

## Tasks

- [x] 1. Setup inicial e schema de dados
  - [x] 1.1 Criar schema Zod para eventos do CRM
    - Criar arquivo `src/lib/schemas/crm-events.ts`
    - Definir CrmEventSchema com validação de campos obrigatórios
    - Definir tipos auxiliares (CrmEventType, CrmEventStatus, CrmEventReminder)
    - Definir constantes CRM_EVENT_TYPES, CRM_EVENT_STATUSES, CRM_EVENT_REMINDERS
    - Definir EventFiltersSchema para filtros
    - _Requirements: 1.1, 1.3, 1.4, 1.7_

  - [x] 1.2 Criar migration SQL para tabela crm_events
    - Criar arquivo `src/lib/migrations/XXX_crm_events.sql`
    - Definir tabela crm_events com todos os campos
    - Criar constraint para garantir pelo menos uma entidade vinculada
    - Criar índices para performance (owner, department, date, status, client, reminder)
    - Criar trigger para updated_at automático
    - _Requirements: 11.1, 11.3_

  - [x] 1.3 Executar migration no banco de dados
    - Aplicar migration no branch develop
    - Verificar criação da tabela e índices
    - _Requirements: 11.1_

- [x] 2. Implementar Server Actions
  - [x] 2.1 Criar arquivo de actions para eventos do CRM
    - Criar arquivo `src/lib/actions/crm-events.actions.ts`
    - Implementar função getCrmEvents com filtros e joins
    - Implementar função getCrmEventById
    - Implementar verificação de permissões por departamento
    - _Requirements: 2.3, 2.4, 3.1, 4.1-4.7, 9.5, 10.2_

  - [x] 2.2 Implementar createCrmEvent
    - Validar dados com CrmEventSchema
    - Verificar permissões do usuário
    - Associar owner_id automaticamente
    - Associar department_id do usuário atual
    - Inserir no banco de dados
    - Revalidar paths
    - _Requirements: 1.1, 1.5, 1.6, 10.1_

  - [x] 2.3 Implementar updateCrmEvent
    - Validar dados parciais
    - Verificar permissões (owner ou admin)
    - Atualizar no banco de dados
    - Revalidar paths
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 2.4 Implementar deleteCrmEvent
    - Verificar permissões (owner ou admin)
    - Remover do banco de dados
    - Revalidar paths
    - _Requirements: 6.2_

  - [x] 2.5 Implementar markEventCompleted
    - Atualizar status para 'completed'
    - Definir completed_at com timestamp atual
    - Marcar reminder_sent como true (cancelar lembrete)
    - _Requirements: 7.1, 7.2, 8.5_

  - [ ]* 2.6 Write property test for CRUD operations
    - **Property 2: CRUD Persistence Property**
    - **Validates: Requirements 1.6, 5.3, 6.2**

  - [ ]* 2.7 Write property test for validation
    - **Property 1: Validation Property**
    - **Validates: Requirements 1.1, 1.7, 5.2, 5.5**

- [x] 3. Checkpoint - Backend completo
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar se todas as actions funcionam corretamente
  - Testar manualmente via console ou script

- [x] 4. Implementar Sistema de Lembretes
  - [x] 4.1 Implementar processEventReminders
    - Buscar eventos com reminder pendente
    - Calcular threshold baseado em reminder_time
    - Criar notificações para eventos dentro do threshold
    - Marcar reminder_sent como true
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 4.2 Criar notificação com link para evento
    - Incluir título, data e entidade vinculada na notificação
    - Definir link para `/crm/calendar?event={id}`
    - _Requirements: 8.4_

  - [ ]* 4.3 Write property test for reminder system
    - **Property 10: Reminder System Property**
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5**

- [x] 5. Implementar Componentes de UI
  - [x] 5.1 Criar página do calendário
    - Criar arquivo `src/app/crm/calendar/page.tsx`
    - Implementar Server Component com data fetching
    - Buscar eventos e clientes
    - Renderizar CalendarPageClient
    - _Requirements: 2.1_

  - [x] 5.2 Criar CalendarPageClient
    - Criar arquivo `src/components/crm/calendar/calendar-page-client.tsx`
    - Implementar estado para eventos, filtros, modo de visualização
    - Implementar toggle entre calendário e lista
    - Implementar refresh de dados
    - _Requirements: 2.1, 3.1_

  - [x] 5.3 Criar EventCalendarView
    - Criar arquivo `src/components/crm/calendar/event-calendar-view.tsx`
    - Implementar grid mensal com navegação
    - Mostrar indicadores de eventos por dia
    - Implementar cores por tipo de evento
    - Implementar botão "Hoje"
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.4 Criar EventListView
    - Criar arquivo `src/components/crm/calendar/event-list-view.tsx`
    - Implementar lista cronológica de eventos
    - Mostrar título, data, tipo, entidade, status
    - Implementar ordenação por diferentes campos
    - Implementar botão de marcar como concluído
    - Implementar paginação
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 7.3_

  - [x] 5.5 Criar EventFilters
    - Criar arquivo `src/components/crm/calendar/event-filters.tsx`
    - Implementar filtro por tipo de evento
    - Implementar filtro por tipo de entidade
    - Implementar filtro por status
    - Implementar filtro por cliente (autocomplete)
    - Implementar filtro por data
    - Implementar botão limpar filtros
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 6. Checkpoint - UI básica completa
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar visualização de calendário e lista
  - Testar filtros

- [x] 7. Implementar Dialogs de CRUD
  - [x] 7.1 Criar NewEventDialog
    - Criar arquivo `src/components/crm/calendar/new-event-dialog.tsx`
    - Implementar formulário com react-hook-form e zod
    - Campos: título, descrição, tipo, data/hora, lembrete
    - Seletor de cliente (autocomplete)
    - Seletor de entidade vinculada (oportunidade, pedido, pós-venda)
    - Validação de campos obrigatórios
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3, 9.4_

  - [x] 7.2 Criar EditEventDialog
    - Criar arquivo `src/components/crm/calendar/edit-event-dialog.tsx`
    - Implementar formulário pré-preenchido
    - Permitir edição de todos os campos
    - Validação antes de salvar
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
    - **Note: Implemented as EventDetailDialog with edit mode**

  - [x] 7.3 Implementar confirmação de exclusão
    - Usar AlertDialog do Shadcn/UI
    - Mostrar mensagem de confirmação
    - Executar exclusão após confirmação
    - _Requirements: 6.1, 6.3, 6.4_
    - **Note: Implemented in EventDetailDialog**

  - [ ]* 7.4 Write unit tests for form validation
    - Testar validação de campos obrigatórios
    - Testar validação de entidade vinculada
    - _Requirements: 1.1, 1.7_

- [x] 8. Implementar Legenda e Cores
  - [x] 8.1 Criar componente de legenda clicável
    - Similar ao módulo de Ocorrências do RH
    - Mostrar tipos de evento com cores
    - Mostrar contagem por tipo
    - Permitir filtrar ao clicar
    - _Requirements: 2.6_
    - **Note: Implemented in CalendarPageClient**

- [x] 9. Integrar com Navegação
  - [x] 9.1 Adicionar rota no menu do CRM
    - Adicionar item "Calendário" no menu lateral do CRM
    - Usar ícone Calendar do Lucide
    - _Requirements: 2.1_

  - [x] 9.2 Configurar permissões
    - Adicionar permissão `crm_calendar_view`
    - Adicionar permissão `crm_calendar_manage`
    - Verificar permissões nas actions e páginas
    - _Requirements: 10.2, 10.3_

- [x] 10. Checkpoint - Funcionalidade completa
  - Ensure all tests pass, ask the user if questions arise.
  - Testar fluxo completo de criação, edição, exclusão
  - Testar filtros e visualizações
  - Testar sistema de lembretes

- [ ] 11. Testes de Propriedades Adicionais
  - [ ]* 11.1 Write property test for filtering
    - **Property 7: Filtering Property**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.7**

  - [ ]* 11.2 Write property test for entity linking
    - **Property 8: Entity Linking Property**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**

  - [ ]* 11.3 Write property test for department access
    - **Property 9: Department Access Property**
    - **Validates: Requirements 10.1, 10.2, 10.4**

  - [ ]* 11.4 Write property test for round-trip serialization
    - **Property 12: Round-Trip Serialization Property**
    - **Validates: Requirements 11.4**

- [x] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar build sem erros
  - Testar em ambiente de desenvolvimento

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- A implementação segue o padrão do módulo de Ocorrências do RH como referência
- O sistema de lembretes pode ser executado via cron job ou API route scheduled
