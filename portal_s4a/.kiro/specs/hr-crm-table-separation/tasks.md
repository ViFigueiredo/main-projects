# Implementation Plan: Separação de Tabelas HR e CRM

## 1. Preparação e Backup

- [ ] 1.1 Criar backup completo do banco de dados
  - Executar backup da tabela departments atual
  - Executar backup da tabela employees atual  
  - Validar integridade dos backups criados
  - _Requirements: 7.1, 7.3_

- [ ] 1.2 Criar script de validação de dados
  - Implementar função para contar registros atuais
  - Implementar função para validar relacionamentos
  - Implementar função para verificar integridade referencial
  - _Requirements: 6.1, 6.2_

## 2. Criação das Novas Tabelas HR

- [ ] 2.1 Criar migration para tabelas HR
  - Criar tabela hr_teams com todos os campos necessários
  - Criar tabela hr_departments para estrutura organizacional
  - Criar tabela employee_team_assignments para relacionamentos
  - Adicionar índices para performance
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 2.2 Escrever testes para estrutura das tabelas
  - Testar criação das tabelas HR
  - Testar constraints e foreign keys
  - Testar índices de performance
  - _Requirements: 3.4, 3.5_

## 3. Migração de Dados

- [ ] 3.1 Implementar migração de equipes
  - Migrar dados de departments para hr_teams
  - Preservar todos os campos (id, name, description, color, etc.)
  - Manter relacionamentos com leaders e managers
  - _Requirements: 2.1, 2.3, 2.4_

- [ ] 3.2 Implementar migração de atribuições de funcionários
  - Migrar department_id dos employees para employee_team_assignments
  - Criar registros de atribuição para todos os funcionários
  - Marcar atribuições como primárias
  - _Requirements: 2.2, 2.3_

- [ ]* 3.3 Escrever testes de migração
  - **Property 1: Data Migration Completeness**
  - **Validates: Requirements 2.1, 2.2**

- [ ]* 3.4 Escrever testes de preservação de atribuições
  - **Property 2: Employee Assignment Preservation**
  - **Validates: Requirements 2.2, 2.3**

## 4. Atualização dos Schemas

- [ ] 4.1 Criar schemas Zod para HR
  - Implementar HRTeamSchema
  - Implementar HRDepartmentSchema  
  - Implementar EmployeeTeamAssignmentSchema
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 4.2 Atualizar tipos TypeScript
  - Definir interfaces para HRTeam
  - Definir interfaces para HRDepartment
  - Definir interfaces para EmployeeTeamAssignment
  - _Requirements: 3.1, 3.2, 3.3_

## 5. Atualização das Actions HR

- [ ] 5.1 Atualizar teams.actions.ts
  - Modificar getKanbanData para usar hr_teams
  - Modificar createTeam para usar hr_teams
  - Modificar updateEmployeeTeam para usar employee_team_assignments
  - Modificar setTeamLeader para usar hr_teams
  - Modificar setTeamManager para usar hr_teams
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [ ] 5.2 Atualizar hierarchy.actions.ts
  - Modificar getHierarchyData para usar hr_teams
  - Atualizar queries para buscar dados das novas tabelas
  - Manter lógica de construção de hierarquia
  - _Requirements: 4.2_

- [ ]* 5.3 Escrever testes de independência HR-CRM
  - **Property 3: HR-CRM Independence**
  - **Validates: Requirements 1.1, 1.2**

- [ ]* 5.4 Escrever testes de isolamento CRM
  - **Property 4: CRM Operation Isolation**  
  - **Validates: Requirements 1.2, 5.1**

## 6. Validação e Testes de Funcionalidade

- [ ] 6.1 Testar página de Equipes (/hr/teams)
  - Verificar carregamento de equipes usando hr_teams
  - Testar drag-and-drop de funcionários
  - Testar criação de novas equipes
  - Testar definição de líderes e gestores
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [ ] 6.2 Testar página de Hierarquias (/hr/hierarchies)
  - Verificar construção de organograma
  - Testar filtros por equipe
  - Verificar relacionamentos hierárquicos
  - _Requirements: 4.2_

- [ ]* 6.3 Escrever testes de equivalência funcional
  - **Property 6: Functional Equivalence**
  - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

## 7. Verificação do CRM

- [ ] 7.1 Validar funcionalidades CRM permanecem intactas
  - Testar página de operações (/crm/operations)
  - Testar seletor de suboperações
  - Verificar filtros por suboperação funcionando
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 7.2 Testar criação de oportunidades e pedidos
  - Verificar associação com suboperações
  - Testar filtros por suboperação
  - Validar relatórios por operação
  - _Requirements: 5.3, 5.4, 5.5_

## 8. Checkpoint - Validação Completa

- [ ] 8.1 Executar validação completa de dados
  - Comparar contagens antes e depois da migração
  - Verificar integridade referencial
  - Validar que nenhum dado foi perdido
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 8.2 Escrever testes de integridade referencial
  - **Property 5: Referential Integrity Maintenance**
  - **Validates: Requirements 3.4, 6.2**

## 9. Limpeza e Otimização

- [ ] 9.1 Remover referências antigas
  - Remover coluna department_id da tabela employees
  - Atualizar queries que ainda referenciam departments
  - Limpar código não utilizado
  - _Requirements: 1.1, 1.2_

- [ ] 9.2 Otimizar performance
  - Verificar planos de execução das queries
  - Adicionar índices adicionais se necessário
  - Otimizar queries complexas de hierarquia
  - _Requirements: 3.5_

## 10. Implementação de Rollback

- [ ] 10.1 Criar script de rollback
  - Implementar função para restaurar departments
  - Implementar função para restaurar employee.department_id
  - Implementar função para remover tabelas HR
  - _Requirements: 7.2, 7.3, 7.4_

- [ ]* 10.2 Testar procedimento de rollback
  - Executar rollback em ambiente de teste
  - Validar restauração completa dos dados
  - Verificar funcionalidade após rollback
  - _Requirements: 7.2, 7.3, 7.4_

## 11. Documentação e Finalização

- [ ] 11.1 Atualizar documentação
  - Documentar nova estrutura de tabelas HR
  - Atualizar diagramas de arquitetura
  - Criar guia de migração
  - _Requirements: 6.1_

- [ ] 11.2 Criar relatório de migração
  - Documentar estatísticas de migração
  - Listar todas as mudanças realizadas
  - Incluir validações de integridade
  - _Requirements: 6.1, 6.2, 6.3_

## 12. Checkpoint Final

- [ ] 12.1 Validação final do sistema
  - Testar todos os fluxos HR funcionando
  - Testar todos os fluxos CRM funcionando
  - Verificar performance geral do sistema
  - Confirmar separação completa entre módulos
  - _Requirements: 1.1, 1.2, 4.1, 4.2, 5.1_