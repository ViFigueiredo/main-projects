# Horário de Trabalho - Múltiplos Intervalos

## Visão Geral

O sistema agora suporta múltiplos intervalos de horário por dia, permitindo cadastrar turnos divididos (manhã/tarde, turnos noturnos, etc).

## Estrutura de Dados

### Formato Novo (com múltiplos intervalos)

```json
[
  {
    "day": "monday",
    "intervals": [
      { "start": "08:00", "end": "12:00" },
      { "start": "13:00", "end": "17:00" }
    ]
  },
  {
    "day": "tuesday",
    "intervals": [
      { "start": "08:00", "end": "12:00" },
      { "start": "13:00", "end": "17:00" }
    ]
  }
]
```

### Dias Válidos

- `monday` (Segunda-feira)
- `tuesday` (Terça-feira)
- `wednesday` (Quarta-feira)
- `thursday` (Quinta-feira)
- `friday` (Sexta-feira)
- `saturday` (Sábado)
- `sunday` (Domingo)

## Importação via Excel

### Formato Simples (Intervalo Único)

```
08:00-17:00
```

### Formato com Múltiplos Intervalos

```
08:00-12:00,13:00-17:00
```

Separar cada intervalo com vírgula.

### Formato JSON Completo

```json
[
  {
    "day": "monday",
    "intervals": [
      { "start": "08:00", "end": "12:00" },
      { "start": "13:00", "end": "17:00" }
    ]
  },
  { "day": "tuesday", "intervals": [{ "start": "08:00", "end": "17:00" }] }
]
```

**Observação:** Ao importar com formato simples ou múltiplos intervalos, o sistema atribui automaticamente ao dia `monday`. O usuário deve editar o funcionário posteriormente para definir os dias corretos.

## Exemplos de Uso

### Exemplo 1: Horário Comercial (manhã e tarde)

```
Segunda a Sexta:
  08:00 às 12:00
  13:00 às 17:00
```

### Exemplo 2: Turno Noturno com Intervalo

```
Segunda a Quinta:
  22:00 às 02:00
  02:30 às 06:00
```

### Exemplo 3: Plantão 24h com Pausas

```
Sábado:
  00:00 às 08:00
  08:30 às 16:00
  16:30 às 23:59
```

## Interface do Usuário

### Adicionar Intervalo

1. Selecione o dia desejado marcando o checkbox
2. Clique no botão "+ Adicionar Intervalo" para adicionar mais turnos
3. Configure os horários de início e fim para cada intervalo

### Remover Intervalo

- Clique no ícone de lixeira ao lado do intervalo
- É necessário ter pelo menos 1 intervalo por dia

## Exportação PDF

O PDF exibe os horários no formato:

```
Segunda: 08:00 às 12:00, 13:00 às 17:00
Terça: 08:00 às 12:00, 13:00 às 17:00
```

## Migração de Dados Antigos

O sistema migra automaticamente dados no formato antigo:

```json
// Formato antigo
{ "day": "monday", "start": "08:00", "end": "17:00" }

// Migrado para
{ "day": "monday", "intervals": [{ "start": "08:00", "end": "17:00" }] }
```

## Validação

- Horários devem estar no formato HH:MM (24 horas)
- Horário de início deve ser anterior ao horário de fim
- Múltiplos intervalos no mesmo dia não devem se sobrepor
- Cada dia pode ter quantos intervalos forem necessários

## Banco de Dados

Campo: `work_hours` (JSONB)

Estrutura:

```sql
work_hours JSONB DEFAULT '[]'::jsonb
```

Exemplo de query:

```sql
SELECT name, work_hours
FROM employees
WHERE work_hours @> '[{"day": "monday"}]';
```