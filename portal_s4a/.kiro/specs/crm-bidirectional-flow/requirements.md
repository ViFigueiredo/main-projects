# Requirements Document - CRM Bidirectional Flow

## Introduction

This specification defines the implementation of bidirectional flow functionality in the CRM system, allowing items to move backward in the sales pipeline (Demanda → Pedido → Oportunidade) while maintaining data integrity and providing proper visibility controls.

## Glossary

- **CRM_System**: The Customer Relationship Management module of Portal S4A
- **Pipeline_Stage**: One of the three main stages: Oportunidade, Pedido, Demanda
- **Status_Finalizador**: A status configuration that marks items as completed/hidden
- **Card_Escondido**: An item that is hidden from the active pipeline view
- **Card_Aguardando**: An item in a waiting/pending state after being returned to a previous stage
- **Esteira**: The visual pipeline/kanban board for each stage
- **Devolução**: The action of returning an item to the previous pipeline stage

## Requirements

### Requirement 1

**User Story:** As a CRM administrator, I want to use the existing "Finalizador" switch functionality to control item visibility in pipelines, so that items reaching finalizer statuses are automatically hidden from the active pipeline view.

#### Acceptance Criteria

1. WHEN an opportunity, order, or post-sales item reaches a status marked with "is_finalizer = true" THEN the CRM_System SHALL hide the item from the default pipeline view
2. WHEN displaying pipeline items THEN the CRM_System SHALL filter out items with finalizer statuses by default
3. WHEN a finalizer status is configured THEN the CRM_System SHALL validate that at least one non-finalizer status exists for each pipeline stage
4. WHEN displaying status configuration THEN the CRM_System SHALL clearly indicate which statuses are configured as finalizers using the existing switch
5. WHEN querying pipeline data THEN the CRM_System SHALL use the existing "is_finalizer" field to determine item visibility

### Requirement 2

**User Story:** As a sales user, I want to view hidden (finalized) and waiting items in the pipeline, so that I can access all items when needed.

#### Acceptance Criteria

1. WHEN viewing any pipeline stage (Oportunidade, Pedido, Demanda) THEN the CRM_System SHALL display two toggle switches: "Mostrar Finalizados" and "Mostrar Aguardando"
2. WHEN the "Mostrar Finalizados" toggle is enabled THEN the CRM_System SHALL display items with finalizer statuses in a visually distinct manner
3. WHEN the "Mostrar Aguardando" toggle is enabled THEN the CRM_System SHALL display items in waiting status in a visually distinct manner
4. WHEN both toggles are disabled THEN the CRM_System SHALL show only active items in the pipeline
5. WHEN toggle states are changed THEN the CRM_System SHALL persist the user's preference for the current session

### Requirement 3

**User Story:** As a sales user, I want to return a Pedido to the Oportunidade stage, so that I can reprocess items that need to go back in the sales flow.

#### Acceptance Criteria

1. WHEN viewing a Pedido form THEN the CRM_System SHALL display a "Devolver para Oportunidade" button if the user has appropriate permissions
2. WHEN the "Devolver para Oportunidade" button is clicked THEN the CRM_System SHALL prompt for confirmation with a reason field
3. WHEN the devolução is confirmed THEN the CRM_System SHALL create a new Oportunidade record with data from the Pedido
4. WHEN the devolução is processed THEN the CRM_System SHALL set the original Pedido status to "Aguardando" (waiting state)
5. WHEN a Pedido is returned to Oportunidade THEN the CRM_System SHALL maintain audit trail linking the original Pedido to the new Oportunidade

### Requirement 4

**User Story:** As a sales user, I want to return a Demanda to the Pedido stage, so that I can reprocess post-sales items that need to go back to order processing.

#### Acceptance Criteria

1. WHEN viewing a Demanda form THEN the CRM_System SHALL display a "Devolver para Pedido" button if the user has appropriate permissions
2. WHEN the "Devolver para Pedido" button is clicked THEN the CRM_System SHALL prompt for confirmation with a reason field
3. WHEN the devolução is confirmed THEN the CRM_System SHALL create a new Pedido record with data from the Demanda
4. WHEN the devolução is processed THEN the CRM_System SHALL set the original Demanda status to "Aguardando" (waiting state)
5. WHEN a Demanda is returned to Pedido THEN the CRM_System SHALL maintain audit trail linking the original Demanda to the new Pedido

### Requirement 5

**User Story:** As a system administrator, I want to track all devolução operations, so that I can monitor and audit backward flow activities.

#### Acceptance Criteria

1. WHEN a devolução operation is performed THEN the CRM_System SHALL log the operation with timestamp, user, reason, and affected records
2. WHEN viewing an item's history THEN the CRM_System SHALL display all related devolução operations in chronological order
3. WHEN a devolução creates a new record THEN the CRM_System SHALL establish bidirectional references between original and new records
4. WHEN generating reports THEN the CRM_System SHALL include devolução statistics and trends
5. WHEN an item has been subject to devolução THEN the CRM_System SHALL display visual indicators in the item's interface

### Requirement 6

**User Story:** As a sales user, I want to understand the relationship between original and returned items, so that I can track the complete history of customer interactions.

#### Acceptance Criteria

1. WHEN viewing an item created from devolução THEN the CRM_System SHALL display a clear reference to the original item
2. WHEN viewing an original item that was returned THEN the CRM_System SHALL display references to all derived items
3. WHEN displaying item relationships THEN the CRM_System SHALL provide navigation links between related items
4. WHEN an item is part of a devolução chain THEN the CRM_System SHALL display the complete relationship tree
5. WHEN printing or exporting item data THEN the CRM_System SHALL include relationship information in the output

### Requirement 7

**User Story:** As a CRM administrator, I want to control permissions for devolução operations, so that only authorized users can perform backward flow actions.

#### Acceptance Criteria

1. WHEN configuring user permissions THEN the CRM_System SHALL provide granular permissions for devolução operations by stage
2. WHEN a user attempts devolução without permission THEN the CRM_System SHALL deny the operation and display an appropriate error message
3. WHEN displaying devolução buttons THEN the CRM_System SHALL show them only to users with appropriate permissions
4. WHEN audit logging devolução operations THEN the CRM_System SHALL record permission validation results
5. WHEN a user's permissions change THEN the CRM_System SHALL immediately reflect the changes in the interface

### Requirement 8

**User Story:** As a sales user, I want the system to preserve data integrity during devolução operations, so that no information is lost when items move backward in the pipeline.

#### Acceptance Criteria

1. WHEN performing devolução THEN the CRM_System SHALL copy all relevant data from the source item to the new item
2. WHEN data conflicts exist during devolução THEN the CRM_System SHALL prompt the user to resolve conflicts before proceeding
3. WHEN devolução involves custom fields THEN the CRM_System SHALL preserve custom field values where applicable
4. WHEN file attachments exist THEN the CRM_System SHALL copy or reference attachments in the new item
5. WHEN devolução is completed THEN the CRM_System SHALL validate data integrity and rollback if validation fails