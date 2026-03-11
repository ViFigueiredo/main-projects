# Implementation Plan: Sistema Híbrido de Inventário e Rastreabilidade de Ativos

## Overview

Este plano de implementação transforma o módulo de Estoque em um sistema híbrido que suporta produtos simples (controle por quantidade) e serializados (rastreabilidade individual). A implementação segue uma abordagem incremental, começando pelo banco de dados e schemas, seguindo para as actions do backend, e finalizando com os componentes de frontend.

## Tasks

- [x] 1. Setup do Banco de Dados e Schemas
  - [x] 1.1 Criar migration SQL para o sistema híbrido de inventário
    - Criar arquivo `src/lib/migrations/004_hybrid_inventory_system.sql`
    - Adicionar colunas `product_type`, `inventory_enabled`, `available_quantity`, `reserved_quantity` na tabela `products`
    - Criar tabela `inventory_locations` com hierarquia
    - Criar tabela `unique_items` com constraint de unicidade global
    - Criar tabela `inventory_reservations`
    - Criar tabela `item_audit_log`
    - Criar tabela `client_assets`
    - Criar tabela `inventory_settings` para configuração de rótulos
    - Criar índices para performance
    - Criar função e trigger `update_product_quantities`
    - _Requirements: 1.6, 2.2, 2.3, 2.4, 3.1, 9.1, 12.1_

  - [x] 1.2 Atualizar ProductSchema com campos de estoque híbrido
    - Adicionar `ProductTypeSchema` com valores 'simple' e 'serialized'
    - Adicionar campos `product_type`, `inventory_enabled`, `available_quantity`, `reserved_quantity`
    - Manter compatibilidade com campos existentes
    - _Requirements: 1.1, 1.2, 1.3, 13.1_

  - [x] 1.3 Criar schemas para itens únicos, reservas e localizações
    - Criar `UniqueItemStatusSchema` com valores 'available', 'reserved', 'sold', 'maintenance'
    - Criar `UniqueItemSchema` com todos os campos necessários
    - Criar `InventoryReservationSchema`
    - Criar `InventoryLocationSchema` com hierarquia
    - Criar `ItemAuditLogSchema`
    - Criar `ClientAssetSchema`
    - _Requirements: 2.2, 2.4, 4.1, 9.1, 12.1_

  - [ ]* 1.4 Write property test for identifier uniqueness
    - **Property 2: Unicidade Global de Identificadores**
    - **Validates: Requirements 2.3**

- [x] 2. Checkpoint - Validar estrutura de dados
  - [x] Executar migration no banco de desenvolvimento
  - [x] Verificar que todas as tabelas foram criadas corretamente (6 tables: inventory_locations, unique_items, inventory_reservations, item_audit_log, client_assets, inventory_settings)
  - [x] Testar constraints de unicidade (unique_identifier_global constraint working)
  - [x] All 41 validation checks passed

- [x] 3. Implementar Server Actions de Itens Únicos
  - [x] 3.1 Criar arquivo `unique-items.actions.ts` com CRUD básico
    - Implementar `createUniqueItem` com validação de unicidade
    - Implementar `updateUniqueItem` com registro de auditoria
    - Implementar `deleteUniqueItem` (soft delete ou validação)
    - Implementar `getUniqueItems` por produto
    - Implementar `getAvailableUniqueItems` filtrando por status
    - _Requirements: 2.1, 2.3, 2.5, 2.6, 2.7_

  - [x] 3.2 Implementar busca global de itens
    - Implementar `searchUniqueItems` com busca em identificador, lote, SKU e nome
    - Suportar busca parcial (substring match)
    - Implementar debounce no frontend (300ms)
    - Retornar produto pai junto com item encontrado
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ]* 3.3 Write property test for global search
    - **Property 6: Busca Global por Substring**
    - **Validates: Requirements 6.2, 6.4**

  - [x] 3.4 Implementar transferência de itens entre localizações
    - Implementar `transferUniqueItem` com registro de movimentação
    - Registrar auditoria de transferência
    - Validar existência da localização destino
    - _Requirements: 9.3, 9.4, 9.6_

  - [x] 3.5 Implementar criação em lote de itens únicos
    - Implementar `bulkCreateUniqueItems` para importação
    - Validar unicidade de todos os identificadores antes de inserir
    - Retornar relatório de sucesso/falha por item
    - _Requirements: 2.3, 2.6_

  - [ ]* 3.6 Write property test for quantity consistency
    - **Property 1: Consistência de Quantidade para Produtos Serializados**
    - **Validates: Requirements 2.6, 2.7**

- [x] 4. Implementar Sistema de Reservas
  - [x] 4.1 Criar arquivo `reservations.actions.ts`
    - Implementar `createReservation` para produtos simples e serializados
    - Para simples: subtrair quantidade do disponível
    - Para serializados: alterar status do item para 'reserved'
    - Vincular reserva à oportunidade do CRM
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 4.2 Implementar liberação de reservas
    - Implementar `releaseReservation` para liberar itens
    - Para simples: devolver quantidade ao disponível
    - Para serializados: alterar status para 'available'
    - Registrar auditoria de liberação
    - _Requirements: 4.5_

  - [ ]* 4.3 Write property test for reservation status transition
    - **Property 3: Transição de Status em Reserva**
    - **Validates: Requirements 4.3, 4.6**

  - [ ]* 4.4 Write property test for reservation release (round-trip)
    - **Property 4: Liberação de Reserva**
    - **Validates: Requirements 4.5**

  - [x] 4.5 Implementar conversão de reserva em venda
    - Implementar `convertReservationToSale` para baixa definitiva
    - Alterar status do item para 'sold'
    - Criar registro em `client_assets`
    - Criar movimentação de saída
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 4.6 Write property test for sale writeoff
    - **Property 5: Baixa Automatizada em Venda**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [x] 5. Checkpoint - Validar lógica de negócio
  - Testar fluxo completo: criar item → reservar → vender
  - Verificar consistência de quantidades
  - Testar liberação de reservas
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implementar Gestão de Localizações
  - [x] 6.1 Criar arquivo `locations.actions.ts`
    - Implementar CRUD de localizações
    - Suportar hierarquia (warehouse > aisle > shelf > box)
    - Implementar `getLocationHierarchy` para exibição em árvore
    - Implementar `getItemsByLocation` para listar itens de uma localização
    - _Requirements: 9.1, 9.2, 9.5, 9.6_

- [x] 7. Implementar Histórico de Ativos do Cliente
  - [x] 7.1 Criar arquivo `client-assets.actions.ts`
    - Implementar `getClientAssets` para listar ativos de um cliente
    - Implementar `searchClientByAsset` para buscar cliente por identificador
    - Implementar `recordAssetSale` para registrar venda de ativo
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 8. Implementar Auditoria e Rastreabilidade
  - [x] 8.1 Criar funções de auditoria
    - Implementar `createAuditLog` para registrar alterações
    - Implementar `getItemTimeline` para exibir histórico completo
    - Garantir imutabilidade dos registros (sem UPDATE/DELETE)
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [ ]* 8.2 Write property test for audit immutability
    - **Property 8: Imutabilidade de Auditoria**
    - **Validates: Requirements 12.1, 12.6**

- [x] 9. Checkpoint - Validar backend completo
  - [x] Testar todas as actions implementadas
  - [x] Verificar auditoria está sendo registrada
  - [x] Testar busca de cliente por ativo
  - [x] All 48 validation tests passed (scripts/validate-backend-checkpoint-9.js)

- [x] 10. Implementar Componentes de UI - Estrutura Base
  - [x] 10.1 Criar componente `ProductTypeSelector`
    - Seletor com opções 'Simples' e 'Serializado'
    - Exibir descrição de cada tipo
    - Desabilitar alteração quando há itens vinculados
    - _Requirements: 1.1, 1.4, 1.5_

  - [ ]* 10.2 Write property test for product type validation
    - **Property 9: Validação de Tipo de Produto**
    - **Validates: Requirements 1.5**

  - [x] 10.3 Criar componente `UniqueItemsTable`
    - Tabela com colunas: Identificador, Lote, Localização, Status
    - Suportar ordenação e filtros
    - Exibir badge de status com cores diferenciadas
    - Ações: Editar, Transferir, Manutenção
    - _Requirements: 2.1, 2.2, 5.3, 5.7_

  - [x] 10.4 Criar componente `UniqueItemForm`
    - Formulário para criar/editar item único
    - Campo de identificador com validação de unicidade em tempo real
    - Seletor de localização hierárquico
    - Seletor de status
    - _Requirements: 2.2, 2.3, 2.5, 9.2_

- [x] 11. Implementar Interface de Inventário Principal
  - [x] 11.1 Criar componente `InventoryListGrouped`
    - Lista de produtos agrupada com expansão
    - Exibir: nome, SKU, quantidade total, disponível, reservada
    - Indicador de expansão para produtos serializados
    - Ao expandir, mostrar tabela de itens únicos
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 11.2 Criar componente `GlobalSearch`
    - Campo de busca com debounce de 300ms
    - Buscar em identificador, lote, SKU, nome
    - Exibir resultados com produto pai destacado
    - Mensagem quando não encontrar resultados
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [x] 11.3 Criar componente `InventoryMetrics`
    - Cards de resumo: Total de Produtos, Valor do Estoque, Em Manutenção, Alertas
    - Calcular valor do estoque (quantidade × custo)
    - Gráfico de distribuição de status
    - Lista de produtos com estoque crítico
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [x] 11.4 Refatorar `InventoryPageClient` para usar novos componentes
    - Integrar GlobalSearch no header
    - Substituir lista atual por InventoryListGrouped
    - Adicionar InventoryMetrics no topo
    - Manter abas existentes (Itens, Armazéns, Movimentações, Alertas)
    - _Requirements: 5.1, 6.1, 10.1_

- [x] 12. Implementar Interface de Reservas
  - [x] 12.1 Criar componente `ReservationDialog`
    - Dialog para criar reserva vinculada a oportunidade
    - Para simples: campo de quantidade com validação
    - Para serializados: lista de itens disponíveis para seleção
    - Exibir identificador, lote e localização de cada item
    - _Requirements: 4.1, 11.1, 11.2, 11.3, 11.4, 11.5_

  - [ ]* 12.2 Write property test for simple product reservation
    - **Property 10: Reserva de Quantidade para Produtos Simples**
    - **Validates: Requirements 4.2**

  - [x] 12.3 Integrar reservas na interface de Oportunidades
    - Adicionar seção "Itens Reservados" na oportunidade
    - Botão para adicionar itens do estoque
    - Exibir itens reservados com opção de liberar
    - Atualizar disponibilidade em tempo real
    - _Requirements: 4.7, 11.6, 11.7_

- [x] 13. Checkpoint - Validar interface de inventário
  - Testar navegação e expansão de produtos
  - Testar busca global
  - Testar criação de reservas
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implementar Gestão de Localizações na UI
  - [x] 14.1 Criar componente `LocationManager`
    - Árvore hierárquica de localizações
    - CRUD de localizações
    - Drag-and-drop para reorganizar hierarquia
    - Exibir contagem de itens por localização
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 14.2 Criar componente `LocationSelector`
    - Seletor hierárquico para formulários
    - Exibir caminho completo (Armazém > Corredor > Prateleira)
    - Permitir criação rápida de nova localização
    - _Requirements: 9.2, 9.6_

- [x] 15. Implementar Timeline de Auditoria
  - [x] 15.1 Criar componente `ItemTimeline`
    - Timeline vertical com eventos do item
    - Exibir: criação, reservas, liberações, vendas, transferências
    - Mostrar usuário e timestamp de cada evento
    - Filtros por tipo de evento
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 16. Implementar Histórico de Ativos no Cliente
  - [x] 16.1 Criar componente `ClientAssetsSection`
    - Seção "Ativos Adquiridos" no cadastro do cliente
    - Tabela com: Identificador, Produto, Data da Venda, Pedido
    - Link para detalhes do item
    - _Requirements: 8.2, 8.3_

  - [x] 16.2 Integrar seção de ativos na página do cliente
    - Adicionar aba ou seção no cadastro do cliente
    - Exibir histórico completo de ativos
    - _Requirements: 8.2_

- [x] 17. Integrar com Cadastro de Produtos
  - [x] 17.1 Atualizar formulário de produto com integração de estoque
    - Adicionar toggle "Integração com Estoque"
    - Quando habilitado, exibir seletor de tipo (Simples/Serializado)
    - Para serializados, exibir link para gerenciar itens únicos
    - _Requirements: 13.1, 13.2, 13.4, 13.6_

  - [ ]* 17.2 Write property test for product-stock synchronization
    - **Property 7: Sincronização Produto-Estoque**
    - **Validates: Requirements 13.3**

  - [x] 17.3 Atualizar listagem de produtos com indicador de integração
    - Adicionar coluna/badge indicando integração com estoque
    - Exibir tipo de produto (Simples/Serializado)
    - Link rápido para módulo de estoque
    - _Requirements: 13.7_

  - [x] 17.4 Implementar migração de produtos existentes
    - Ao habilitar integração, migrar quantidade atual
    - Para serializados, redirecionar para cadastro de itens
    - Manter compatibilidade com produtos sem integração
    - _Requirements: 13.5, 13.8, 13.9_

- [x] 18. Implementar Baixa Automatizada no CRM
  - [x] 18.1 Integrar baixa de estoque na conclusão de venda
    - Hook no fluxo de conclusão de pedido/oportunidade
    - Chamar `convertReservationToSale` para itens reservados
    - Registrar ativos no histórico do cliente
    - Criar movimentação de saída
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 18.2 Implementar tratamento de falhas na baixa
    - Se baixa falhar, manter venda em estado pendente
    - Notificar usuário sobre pendência
    - Permitir baixa manual via interface
    - _Requirements: 7.6, 7.7_

- [x] 19. Implementar Configuração de Rótulos
  - [x] 19.1 Criar interface de configuração de rótulo do identificador
    - Adicionar em Configurações > Sistema
    - Opções predefinidas: ICCID, Serial/IMEI, Chassi
    - Campo para rótulo customizado
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 19.2 Aplicar rótulo dinâmico em todas as interfaces
    - Buscar configuração do banco
    - Aplicar em formulários, tabelas e buscas
    - _Requirements: 3.6_

- [x] 20. Implementar Relatórios e Exportação
  - [x] 20.1 Criar relatório de movimentações
    - Filtros por período, tipo e produto
    - Exibir histórico de movimentações
    - _Requirements: 10.5_

  - [x] 20.2 Implementar exportação PDF e Excel
    - Exportar lista de itens de estoque
    - Exportar relatório de movimentações
    - Exportar histórico de ativos do cliente
    - _Requirements: 10.6_

- [x] 21. Checkpoint Final - Validação Completa
  - Testar fluxo completo: cadastro → reserva → venda → histórico
  - Verificar todas as propriedades de corretude
  - Testar integração com CRM
  - Testar exportação de relatórios
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- A implementação segue a ordem: Database → Backend → Frontend
- Manter compatibilidade com produtos existentes que não usam integração de estoque
