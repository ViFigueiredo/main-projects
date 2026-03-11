# Requirements Document - CRM Devolução Restore Bug Fix

## Introduction

Este documento especifica os requisitos para corrigir o bug crítico no sistema de devolução CRM onde pedidos criados automaticamente a partir de oportunidades não estão restaurando a oportunidade original corretamente, criando duplicatas no sistema.

## Glossary

- **Sistema_Devolucao**: Sistema responsável por mover entidades entre diferentes estágios do pipeline CRM
- **Oportunidade_Original**: A oportunidade que foi movida para status finalizer e gerou um pedido automaticamente
- **Pedido_Automatico**: Pedido criado automaticamente pelo sistema quando uma oportunidade atinge status finalizer
- **Restauracao_Original**: Processo de mover a oportunidade original de volta para status aguardando ao invés de criar nova
- **Status_Finalizer**: Status que marca uma oportunidade como finalizada (ex: VENDA)
- **Status_Aguardando**: Status que marca entidades como aguardando processamento (não aparecem no pipeline ativo)

## Requirements

### Requirement 1

**User Story:** As a CRM user, I want to return automatically created orders back to their original opportunities, so that I don't have duplicate opportunities in the system.

#### Acceptance Criteria

1. WHEN a user returns an order that has opportunity_id THEN the Sistema_Devolucao SHALL restore the original opportunity instead of creating a new one
2. WHEN the original opportunity is restored THEN the Sistema_Devolucao SHALL move it to Status_Aguardando regardless of its current status
3. WHEN the restoration occurs THEN the Sistema_Devolucao SHALL add detailed notes about the return including previous status and reason
4. WHEN both entities are processed THEN the Sistema_Devolucao SHALL ensure both order and opportunity appear in the AGUARDANDO column with relationship indicators
5. WHEN the operation completes THEN the Sistema_Devolucao SHALL maintain the original opportunity_id relationship in the audit trail

### Requirement 2

**User Story:** As a system administrator, I want the devolução system to detect automatic order creation scenarios correctly, so that the system handles all edge cases properly.

#### Acceptance Criteria

1. WHEN an order has opportunity_id field populated THEN the Sistema_Devolucao SHALL identify it as coming from an automatic creation
2. WHEN the original opportunity is in any status THEN the Sistema_Devolucao SHALL find and restore it regardless of current status
3. WHEN the original opportunity is in Status_Finalizer THEN the Sistema_Devolucao SHALL move it to Status_Aguardando with proper status transition logging
4. WHEN no original opportunity is found THEN the Sistema_Devolucao SHALL create a new opportunity as fallback only
5. WHEN audit trail is created THEN the Sistema_Devolucao SHALL record whether operation was restoration or creation

### Requirement 3

**User Story:** As a developer, I want the devolução logic to have clear flow control, so that the system never executes both restoration and creation paths.

#### Acceptance Criteria

1. WHEN order-to-opportunity devolução is requested THEN the Sistema_Devolucao SHALL execute only one path: restoration OR creation, never both
2. WHEN restoration path is taken THEN the Sistema_Devolucao SHALL not execute any creation logic
3. WHEN creation path is taken THEN the Sistema_Devolucao SHALL only execute when no original opportunity exists
4. WHEN flow control is implemented THEN the Sistema_Devolucao SHALL use proper conditional logic with explicit else clauses
5. WHEN operation completes THEN the Sistema_Devolucao SHALL return the correct target ID (original for restoration, new for creation)

### Requirement 4

**User Story:** As a CRM user, I want to see proper visual indicators in the Kanban board, so that I can understand the relationship between returned orders and opportunities.

#### Acceptance Criteria

1. WHEN entities are in Status_Aguardando THEN the Sistema_Devolucao SHALL ensure they appear in the AGUARDANDO column
2. WHEN entities have devolução relationship THEN the Sistema_Devolucao SHALL display relationship indicators (🔗 Relacionado)
3. WHEN opportunity is restored THEN the Sistema_Devolucao SHALL show detailed notes about the return operation
4. WHEN both order and opportunity are waiting THEN the Sistema_Devolucao SHALL group them visually with consistent formatting
5. WHEN user views the cards THEN the Sistema_Devolucao SHALL display client information and values correctly

### Requirement 5

**User Story:** As a system user, I want comprehensive logging of devolução operations, so that I can troubleshoot issues and understand system behavior.

#### Acceptance Criteria

1. WHEN devolução operation starts THEN the Sistema_Devolucao SHALL log the detection of opportunity_id and operation type
2. WHEN original opportunity is found THEN the Sistema_Devolucao SHALL log current status and restoration decision
3. WHEN status transitions occur THEN the Sistema_Devolucao SHALL log previous and new status with timestamps
4. WHEN operation completes THEN the Sistema_Devolucao SHALL log final result with target ID and operation type
5. WHEN errors occur THEN the Sistema_Devolucao SHALL log detailed context for debugging