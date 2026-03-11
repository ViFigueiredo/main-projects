# Implementation Plan - CRM Bidirectional Flow

## Overview

This implementation plan converts the CRM bidirectional flow design into a series of actionable coding tasks. Each task builds incrementally on previous work, ensuring a systematic approach to implementing the backward flow functionality.

## Task List

- [x] 1. Database Schema Extensions





  - Create migration file for new database structures
  - Add `is_waiting_status` field to `crm_statuses` table
  - Create `crm_devolucao_audit` table for audit trail
  - Add devolução relationship fields to existing CRM tables
  - Create indexes for performance optimization
  - _Requirements: 1.1, 3.5, 4.5, 5.1_

- [x] 1.1 Write property test for database schema validation


  - **Property 9: Transaction Rollback on Failure**
  - **Validates: Requirements 8.2, 8.5**

- [x] 2. Update CRM Schemas and Types





  - Extend `CrmStatusSchema` with `is_waiting_status` field
  - Create `DevolucaoAuditSchema` for audit operations
  - Add devolução-related fields to opportunity, order, and post-sales schemas
  - Update TypeScript interfaces for enhanced data models
  - _Requirements: 1.2, 5.1, 6.1_

- [x] 2.1 Write property test for schema validation


  - **Property 4: Devolução Data Integrity**
  - **Validates: Requirements 3.3, 4.3, 8.1, 8.3, 8.4**

- [x] 3. Implement Core Devolução Service


  - Create `DevolucaoService` class with core business logic
  - Implement `performDevolucao` function with transaction support
  - Add data copying logic between different entity types
  - Implement audit trail creation functionality
  - Add error handling and validation
  - _Requirements: 3.3, 4.3, 5.1, 8.1_

- [x] 3.1 Write property test for devolução data copying


  - **Property 4: Devolução Data Integrity**
  - **Validates: Requirements 3.3, 4.3, 8.1, 8.3, 8.4**

- [x] 3.2 Write property test for audit trail creation



  - **Property 6: Audit Trail Creation**
  - **Validates: Requirements 3.5, 4.5, 5.1, 5.3**

- [x] 4. Enhanced Pipeline Query System


  - Update `PipelineQueryService` with visibility filtering
  - Implement `getOpportunities` with finalizer/waiting filters
  - Implement `getOrders` with visibility controls
  - Implement `getPostSales` with filtering options
  - Add relationship data loading for devolução history
  - _Requirements: 1.1, 1.2, 2.2, 2.3, 2.4_

- [x] 4.1 Write property test for pipeline filtering


  - **Property 1: Finalizer Status Filtering**
  - **Validates: Requirements 1.1, 1.2, 1.5**

- [x] 4.2 Write property test for visibility toggle behavior


  - **Property 2: Visibility Toggle Behavior**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 5. Server Actions for Devolução Operations





  - Create `performDevolucaoAction` server action
  - Implement permission validation logic
  - Add transaction management with rollback capability
  - Create actions for retrieving devolução history
  - Add actions for relationship tree queries
  - _Requirements: 3.1, 4.1, 7.1, 7.2_

- [x] 5.1 Write property test for permission enforcement


  - **Property 7: Permission Enforcement**
  - **Validates: Requirements 7.1, 7.2, 7.3**

- [x] 6. Visibility Toggle Components












  - Create `VisibilityToggles` component with switch controls
  - Implement session state persistence for toggle preferences
  - Add visual styling for different item states (finalized/waiting)
  - Integrate toggles with pipeline query system
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 6.1 Write property test for session persistence




  - **Property 3: Session Persistence**
  - **Validates: Requirements 2.5**

- [x] 7. Devolução Button Component








  - Create `DevolucaoButton` component with permission checks
  - Implement confirmation dialog with reason field
  - Add loading states and error handling
  - Integrate with devolução service actions
  - Add visual indicators for items with devolução history
  - _Requirements: 3.1, 3.2, 4.1, 4.2, 7.3_

- [x] 7.1 Write unit tests for devolução button interactions



  - Test confirmation dialog behavior
  - Test permission-based visibility
  - Test error handling scenarios
  - _Requirements: 3.2, 4.2, 7.3_

- [x] 8. Update Pipeline Views (Opportunities)








  - Integrate `VisibilityToggles` into opportunities kanban view
  - Update opportunity cards to show devolução indicators
  - Add relationship navigation links
  - Implement visual distinction for finalized/waiting items
  - _Requirements: 2.1, 5.5, 6.3_

- [x] 9. Update Pipeline Views (Orders)





  - Integrate `VisibilityToggles` into orders kanban view
  - Add `DevolucaoButton` to order forms and cards
  - Update order cards with devolução history indicators
  - Implement relationship display and navigation
  - _Requirements: 2.1, 3.1, 5.5, 6.1, 6.2_

- [x] 10. Update Pipeline Views (Post-Sales)








  - Integrate `VisibilityToggles` into post-sales kanban view
  - Add `DevolucaoButton` to post-sales forms and cards
  - Update post-sales cards with relationship information
  - Implement complete relationship tree display
  - _Requirements: 2.1, 4.1, 6.4_

- [x] 10.1 Write property test for relationship tree display




  - **Property 10: Complete Relationship Tree Display**
  - **Validates: Requirements 6.4, 5.2**

- [x] 11. Status Management Updates








  - Add `is_waiting_status` field to status manager form
  - Create default "Aguardando" statuses for each pipeline type
  - Update status validation to ensure non-finalizer statuses exist
  - Add visual indicators for waiting and finalizer statuses
  - _Requirements: 1.3, 1.4, 3.4, 4.4_


- [x] 11.1 Write property test for status change on devolução


  - **Property 5: Status Change on Devolução**
  - **Validates: Requirements 3.4, 4.4**

- [x] 12. Permission System Extensions





  - Add granular devolução permissions to permission constants
  - Update user role management to include devolução permissions
  - Implement permission checks in all devolução-related components
  - Add permission validation to server actions
  - _Requirements: 7.1, 7.2, 7.4, 7.5_

- [x] 13. Relationship Display Components





  - Create `RelationshipTree` component for complex relationship chains
  - Implement `RelationshipNavigation` for item-to-item links
  - Add relationship information to item detail views
  - Create export functionality that includes relationship data
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 13.1 Write property test for bidirectional relationship display


  - **Property 8: Bidirectional Relationship Display**
  - **Validates: Requirements 6.1, 6.2, 6.3**

- [x] 14. Audit and Reporting Features








  - Create devolução history display components
  - Implement audit trail viewing functionality
  - Add devolução statistics to existing reports
  - Create dedicated devolução activity reports
  - _Requirements: 5.2, 5.4_

- [x] 14.1 Write unit tests for audit trail display




  - Test chronological ordering of devolução operations
  - Test audit trail data completeness
  - Test report generation with devolução statistics
  - _Requirements: 5.2, 5.4_

- [x] 15. Error Handling and Validation





  - Implement comprehensive error handling for devolução operations
  - Add data validation checkpoints throughout the process
  - Create user-friendly error messages and recovery guidance
  - Add logging for debugging and monitoring
  - _Requirements: 8.2, 8.5_

- [x] 16. Integration Testing and Validation





  - Test complete devolução workflows end-to-end
  - Validate data integrity across all operations
  - Test permission enforcement in real scenarios
  - Verify audit trail accuracy and completeness
  - _Requirements: All requirements_

- [x] 16.1 Write integration tests for complete workflows


  - Test Demanda → Pedido → Oportunidade flow
  - Test permission-based access control
  - Test error scenarios and recovery
  - _Requirements: All requirements_
  - **Status**: ✅ **COMPLETED** - Integration tests implemented with comprehensive mocking system
  - **Note**: Tests validate the complete devolução workflow system including validation, permissions, error handling, and audit trail creation

- [x] 17. Performance Optimization





  - Add database indexes for devolução queries
  - Optimize relationship tree queries
  - Implement caching for frequently accessed data
  - Add pagination for large audit trail displays
  - _Requirements: Performance considerations_

- [x] 18. Documentation and User Training





  - Update user documentation with devolução procedures
  - Create admin guide for permission configuration
  - Document troubleshooting procedures
  - Create training materials for end users
  - _Requirements: User experience_

- [x] 19. Final Testing and Deployment Preparation















  - Ensure all tests pass, ask the user if questions arise
  - Perform comprehensive manual testing
  - Validate all requirements are met
  - Prepare deployment checklist
  - _Requirements: All requirements_

## Implementation Notes

### Database Migration Strategy
- All database changes are implemented in a single migration file to ensure atomicity
- Existing data is preserved and enhanced with new relationship fields
- Indexes are created to optimize query performance

### Component Architecture
- Components are designed to be reusable across different pipeline types
- Permission checks are implemented at both component and server action levels
- State management uses React hooks with session persistence

### Testing Approach
- Property-based tests validate universal behaviors across all data scenarios
- Unit tests focus on specific component interactions and edge cases
- Integration tests verify complete workflows and data integrity

### Performance Considerations
- Database queries are optimized with proper indexing
- Relationship data is loaded on-demand to avoid unnecessary overhead
- Caching strategies are implemented for frequently accessed audit data

### Security Measures
- All devolução operations require explicit user permissions
- Audit trails provide complete traceability of all actions
- Transaction rollback ensures data consistency in error scenarios