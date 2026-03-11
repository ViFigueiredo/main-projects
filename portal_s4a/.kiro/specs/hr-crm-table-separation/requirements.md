# Requirements Document: Separação de Tabelas HR e CRM

## Introduction

O sistema atualmente possui um conflito de responsabilidades onde a tabela `departments` está sendo utilizada tanto pelo módulo de **Recursos Humanos** (para equipes e hierarquias) quanto pelo **CRM** (para operações comerciais). Esta situação cria confusão conceitual e técnica, pois "departamentos de RH" e "operações comerciais" são entidades completamente diferentes com propósitos distintos.

## Glossary

- **HR_Team**: Equipe de recursos humanos (ex: Backoffice, Qualidade, B2B - Ana Karolina)
- **HR_Department**: Departamento organizacional de RH (pode conter múltiplas equipes)
- **CRM_Operation**: Operação comercial (ex: VIVO, Claro, TIM)
- **CRM_Suboperation**: Suboperação dentro de uma operação comercial (ex: B2B, B2C, Corporate)
- **Employee**: Funcionário do sistema
- **Migration**: Processo de migração de dados sem perda de informações

## Requirements

### Requirement 1: Separação Conceitual

**User Story:** Como administrador do sistema, quero que as funcionalidades de RH e CRM sejam completamente independentes, para que não haja confusão entre equipes organizacionais e operações comerciais.

#### Acceptance Criteria

1. WHEN accessing HR modules (Teams, Hierarchies), THE system SHALL use only HR-specific tables
2. WHEN accessing CRM modules (Operations, Opportunities), THE system SHALL use only CRM-specific tables  
3. WHEN viewing system data, THE system SHALL clearly distinguish between HR teams and CRM operations
4. WHEN creating reports, THE system SHALL separate HR organizational data from CRM commercial data
5. WHEN managing permissions, THE system SHALL allow independent access control for HR and CRM modules

### Requirement 2: Migração de Dados do RH

**User Story:** Como usuário do módulo de RH, quero que todas as minhas equipes e hierarquias existentes sejam preservadas durante a migração, para que não perca nenhum dado organizacional.

#### Acceptance Criteria

1. WHEN the migration runs, THE system SHALL preserve all existing team data from the departments table
2. WHEN the migration runs, THE system SHALL preserve all employee-team relationships
3. WHEN the migration runs, THE system SHALL preserve all leader and manager assignments
4. WHEN the migration runs, THE system SHALL preserve team colors and ordering
5. WHEN the migration completes, THE system SHALL validate data integrity through automated checks

### Requirement 3: Estrutura de Tabelas HR

**User Story:** Como desenvolvedor, quero uma estrutura de tabelas específica para RH, para que o módulo tenha suas próprias entidades bem definidas.

#### Acceptance Criteria

1. WHEN creating HR tables, THE system SHALL create hr_teams table with all necessary fields
2. WHEN creating HR tables, THE system SHALL create hr_departments table for organizational structure
3. WHEN creating HR tables, THE system SHALL create employee_team_assignments table for relationships
4. WHEN creating HR tables, THE system SHALL maintain referential integrity with employees table
5. WHEN creating HR tables, THE system SHALL include proper indexes for performance

### Requirement 4: Atualização do Código HR

**User Story:** Como usuário dos módulos de Equipes e Hierarquias, quero que todas as funcionalidades continuem funcionando exatamente como antes, para que não haja interrupção no meu trabalho.

#### Acceptance Criteria

1. WHEN accessing Teams page, THE system SHALL display all teams using hr_teams table
2. WHEN accessing Hierarchies page, THE system SHALL build organizational charts using HR tables
3. WHEN dragging employees between teams, THE system SHALL update hr_teams relationships
4. WHEN setting team leaders, THE system SHALL update hr_teams leader assignments
5. WHEN setting team managers, THE system SHALL update hr_teams manager assignments

### Requirement 5: Preservação do CRM

**User Story:** Como usuário do CRM, quero que o sistema de operações/suboperações continue funcionando perfeitamente, para que minhas vendas e oportunidades não sejam afetadas.

#### Acceptance Criteria

1. WHEN accessing CRM modules, THE system SHALL use operations and suboperations tables exclusively
2. WHEN filtering CRM data, THE system SHALL filter by suboperation_id correctly
3. WHEN creating opportunities, THE system SHALL associate with correct suboperations
4. WHEN managing products, THE system SHALL maintain suboperation relationships
5. WHEN generating CRM reports, THE system SHALL group by operations and suboperations

### Requirement 6: Validação e Testes

**User Story:** Como administrador, quero garantir que a migração foi bem-sucedida, para que possa confiar na integridade dos dados.

#### Acceptance Criteria

1. WHEN migration completes, THE system SHALL provide detailed migration report
2. WHEN validating data, THE system SHALL confirm all HR teams were migrated correctly
3. WHEN validating data, THE system SHALL confirm all employee assignments were preserved
4. WHEN validating data, THE system SHALL confirm all CRM operations remain intact
5. WHEN running tests, THE system SHALL pass all HR and CRM functionality tests

### Requirement 7: Rollback e Segurança

**User Story:** Como administrador, quero ter a capacidade de reverter a migração se algo der errado, para que possa restaurar o sistema ao estado anterior.

#### Acceptance Criteria

1. WHEN starting migration, THE system SHALL create complete backup of current state
2. WHEN migration fails, THE system SHALL provide rollback mechanism
3. WHEN rollback executes, THE system SHALL restore all original data
4. WHEN rollback completes, THE system SHALL validate system functionality
5. WHEN backup is created, THE system SHALL verify backup integrity before proceeding