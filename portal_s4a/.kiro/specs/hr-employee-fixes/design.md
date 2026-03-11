# Design Document

## Overview

Este documento detalha o design técnico para implementar as correções no módulo de RH do Portal S4A, abordando três problemas específicos: multi-seleção de cargos, campos ausentes na exportação Excel, e correção de timezone em datas.

## Architecture

### Componentes Afetados

1. **Frontend Components**
   - `src/components/hr/employee-filters.tsx` - Filtro de cargos
   - `src/components/hr/employees-page-client.tsx` - Página principal de funcionários
   - `src/components/hr/hr-dashboard-client.tsx` - Dashboard de RH

2. **Backend Actions**
   - `src/lib/actions/employee.actions.ts` - Ações de funcionários
   - Função de exportação Excel (a ser identificada)

3. **Utility Functions**
   - `src/lib/utils/date-helpers.ts` - Helpers de data (se existir)

## Components and Interfaces

### 1. Multi-seleção de Cargos

#### Interface Updates
```typescript
interface EmployeeFiltersProps {
  // Existing props...
  onJobPositionChange?: (positionIds: string[]) => void; // Changed from string to string[]
  selectedJobPositions?: string[]; // New prop for controlled component
}
```

#### Component Structure
```typescript
// New multi-select component structure
const [selectedJobPositions, setSelectedJobPositions] = useState<string[]>([]);
const [jobPositionOpen, setJobPositionOpen] = useState(false);

// Multi-select logic similar to existing status filter in dashboard
const handleJobPositionToggle = (positionId: string) => {
  const newSelection = selectedJobPositions.includes(positionId)
    ? selectedJobPositions.filter(id => id !== positionId)
    : [...selectedJobPositions, positionId];
  
  setSelectedJobPositions(newSelection);
  onJobPositionChange?.(newSelection);
};
```

### 2. Exportação Excel

#### Data Structure
```typescript
interface ExportEmployeeData {
  // Existing fields...
  trial_end_part1?: string | Date;
  trial_end_part2?: string | Date;
}

// Excel column mapping
const excelColumns = {
  // Existing columns...
  'Término Experiência - Parte 1': 'trial_end_part1',
  'Término Experiência - Parte 2': 'trial_end_part2',
};
```

#### Export Function Enhancement
```typescript
const formatDateForExcel = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('pt-BR');
};
```

### 3. Correção de Timezone

#### Date Handling Strategy
```typescript
// Utility function for consistent date handling
const adjustDateForTimezone = (dateString: string | Date): Date => {
  const date = new Date(dateString);
  
  // Adjust for timezone offset to prevent day shifting
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() + userTimezoneOffset);
};

// Format function for display
const formatDateDisplay = (date: string | Date | undefined): string => {
  if (!date) return '';
  
  const adjustedDate = adjustDateForTimezone(date);
  return adjustedDate.toLocaleDateString('pt-BR');
};
```

## Data Models

### Employee Filter State
```typescript
interface EmployeeFilterState {
  search: string;
  status: string;
  jobPositions: string[]; // Changed from single string to array
  admissionDateRange?: DateRange;
  entryDateRange?: DateRange;
}
```

### Excel Export Data
```typescript
interface ExcelEmployeeRow {
  nome: string;
  cpf: string;
  cargo: string;
  dataAdmissao: string;
  status: string;
  terminoExperienciaParte1: string; // New field
  terminoExperienciaParte2: string; // New field
  // ... other existing fields
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Multi-selection Filter Consistency
*For any* set of job position selections, the filtered employee list should contain only employees whose job positions are included in the selected set
**Validates: Requirements 1.2**

### Property 2: Filter Removal Behavior
*For any* job position removed from selection, the employee table should update to exclude employees with only that job position while maintaining employees with other selected positions
**Validates: Requirements 1.3**

### Property 3: Selection Counter Display
*For any* number of selected job positions greater than one, the system should display a badge showing the exact count of selected positions
**Validates: Requirements 1.4**

### Property 4: Excel Export Column Inclusion - Part 1
*For any* employee data export to Excel, the system should include a "Término Experiência - Parte 1" column with dates formatted as DD/MM/YYYY
**Validates: Requirements 2.1**

### Property 5: Excel Export Column Inclusion - Part 2
*For any* employee data export to Excel, the system should include a "Término Experiência - Parte 2" column with dates formatted as DD/MM/YYYY
**Validates: Requirements 2.2**

### Property 6: Null Date Handling in Export
*For any* employee without trial end dates, the Excel export should display empty cells or "-" in the corresponding trial end columns
**Validates: Requirements 2.3**

### Property 7: Date Format Consistency in Export
*For any* Excel export, all date columns should maintain consistent DD/MM/YYYY formatting or standardized empty value representation
**Validates: Requirements 2.4**

### Property 8: Timezone Adjustment Accuracy
*For any* contract expiration date calculation, the system should apply timezone adjustment to prevent day shifting from the stored database value
**Validates: Requirements 3.1**

### Property 9: Date Display Fidelity
*For any* contract expiration date displayed in the dashboard, the shown date should exactly match the database value without day subtraction
**Validates: Requirements 3.2**

### Property 10: Date Formatting Consistency
*For any* date formatting operation, the system should use consistent UTC or timezone adjustment to prevent day changes across different operations
**Validates: Requirements 3.4**

### Property 11: Uniform Timezone Treatment
*For any* set of contract dates displayed together, the system should apply identical timezone treatment to ensure consistent date representation
**Validates: Requirements 3.5**

## Error Handling

### Multi-selection Errors
- Handle empty job positions array gracefully
- Validate job position IDs exist before filtering
- Fallback to "all positions" if invalid selection

### Export Errors
- Handle null/undefined trial end dates
- Validate date formats before Excel generation
- Provide user feedback for export failures

### Date Processing Errors
- Handle invalid date strings
- Fallback to original date if timezone adjustment fails
- Log timezone-related errors for debugging

## Testing Strategy

### Unit Testing
- Test multi-select component behavior
- Test date formatting functions
- Test Excel export data transformation
- Test filter state management

### Property-Based Testing
Using Jest and a property-based testing library (e.g., fast-check):

- **Property 1 Test**: Generate random job position selections and verify filtered results
- **Property 2 Test**: Generate random employee data and verify Excel export completeness
- **Property 3 Test**: Generate random dates and verify display accuracy
- **Property 4 Test**: Test filter reset behavior across different states
- **Property 5 Test**: Test date formatting consistency across various date inputs

Each property-based test should run a minimum of 100 iterations to ensure comprehensive coverage.

### Integration Testing
- Test complete filter workflow with multiple selections
- Test end-to-end Excel export with trial dates
- Test dashboard date display with various timezone scenarios

### Manual Testing Checklist
- [ ] Multi-select job positions and verify filtering
- [ ] Export Excel and verify trial date columns
- [ ] Check contract expiration dates in dashboard
- [ ] Test filter combinations and reset functionality
- [ ] Verify date consistency across different browsers/timezones

## Implementation Notes

### Phase 1: Multi-selection Filter
1. Update EmployeeFilters component to support array of job positions
2. Implement Popover with Command component (similar to dashboard filters)
3. Update parent components to handle array-based filtering
4. Test filter combinations and performance

### Phase 2: Excel Export Enhancement
1. Identify current Excel export implementation
2. Add trial_end_part1 and trial_end_part2 to export data
3. Implement date formatting for Excel columns
4. Test export with various data scenarios

### Phase 3: Date Timezone Fix
1. Create utility functions for consistent date handling
2. Update dashboard contract expiration calculation
3. Apply timezone adjustment to date display functions
4. Test across different timezone scenarios

### Performance Considerations
- Debounce multi-select changes to avoid excessive filtering
- Optimize Excel export for large datasets
- Cache formatted dates to avoid repeated calculations
- Use React.memo for filter components to prevent unnecessary re-renders

### Accessibility
- Ensure multi-select component is keyboard navigable
- Add proper ARIA labels for screen readers
- Maintain focus management in popover components
- Provide clear visual feedback for selected items