# Requirements Document

## Introduction

Sistema de importação em massa de itens únicos (serializados) via arquivo CSV com mapeamento dinâmico de colunas, similar ao NocoDB. Permite que o usuário faça upload de um CSV e mapeie as colunas do arquivo para os campos do sistema de forma visual e intuitiva.

## Glossary

- **CSV_Importer**: Componente responsável por processar e importar arquivos CSV
- **Column_Mapper**: Interface visual para mapear colunas do CSV para campos do sistema
- **Unique_Item**: Item individual com identificador único (serial, IMEI, ICCID, etc.)
- **Batch_Import**: Processo de importação em lote de múltiplos itens
- **Preview_Table**: Tabela de pré-visualização dos dados antes da importação

## Requirements

### Requirement 1: Upload de Arquivo CSV

**User Story:** Como um operador de estoque, eu quero fazer upload de um arquivo CSV com dados de itens únicos, para que eu possa cadastrar múltiplos itens de uma vez.

#### Acceptance Criteria

1. WHEN o usuário clica no botão "Importar CSV" THEN THE CSV_Importer SHALL exibir um dialog de upload
2. WHEN o usuário arrasta um arquivo CSV para a área de upload THEN THE CSV_Importer SHALL aceitar o arquivo e iniciar o processamento
3. WHEN o usuário seleciona um arquivo via botão "Selecionar arquivo" THEN THE CSV_Importer SHALL aceitar o arquivo e iniciar o processamento
4. IF o arquivo não for um CSV válido THEN THE CSV_Importer SHALL exibir mensagem de erro clara
5. WHEN o arquivo é carregado THEN THE CSV_Importer SHALL detectar automaticamente o delimitador (vírgula, ponto-e-vírgula, tab)
6. WHEN o arquivo é carregado THEN THE CSV_Importer SHALL detectar automaticamente a codificação (UTF-8, ISO-8859-1)

### Requirement 2: Mapeamento Dinâmico de Colunas

**User Story:** Como um operador de estoque, eu quero mapear as colunas do meu CSV para os campos do sistema, para que eu possa usar arquivos com qualquer estrutura de colunas.

#### Acceptance Criteria

1. WHEN o CSV é carregado THEN THE Column_Mapper SHALL exibir todas as colunas detectadas no arquivo
2. WHEN o CSV é carregado THEN THE Column_Mapper SHALL exibir uma pré-visualização das primeiras 5 linhas
3. THE Column_Mapper SHALL permitir mapear cada coluna do CSV para um campo do sistema via dropdown
4. THE Column_Mapper SHALL exibir os campos obrigatórios destacados (identificador único)
5. THE Column_Mapper SHALL permitir ignorar colunas que não serão importadas
6. WHEN uma coluna é mapeada THEN THE Column_Mapper SHALL atualizar a pré-visualização em tempo real
7. THE Column_Mapper SHALL sugerir mapeamentos automáticos baseado nos nomes das colunas

### Requirement 3: Campos Disponíveis para Mapeamento

**User Story:** Como um operador de estoque, eu quero mapear colunas para todos os campos relevantes do item único, para que eu possa importar dados completos.

#### Acceptance Criteria

1. THE Column_Mapper SHALL disponibilizar o campo "Identificador Único" (obrigatório) - Serial/IMEI/ICCID
2. THE Column_Mapper SHALL disponibilizar o campo "Lote" (batch_number) - opcional
3. THE Column_Mapper SHALL disponibilizar o campo "Localização" (location) - opcional
4. THE Column_Mapper SHALL disponibilizar o campo "Data de Compra" (purchase_date) - opcional
5. THE Column_Mapper SHALL disponibilizar o campo "Preço de Compra" (purchase_price) - opcional
6. THE Column_Mapper SHALL disponibilizar o campo "Fornecedor" (supplier) - opcional
7. THE Column_Mapper SHALL disponibilizar o campo "Observações" (notes) - opcional
8. THE Column_Mapper SHALL permitir mapear múltiplas colunas para o campo "Observações" (concatenação)

### Requirement 4: Validação Pré-Importação

**User Story:** Como um operador de estoque, eu quero ver erros de validação antes de importar, para que eu possa corrigir problemas no arquivo.

#### Acceptance Criteria

1. WHEN o mapeamento é confirmado THEN THE CSV_Importer SHALL validar todos os dados antes de importar
2. IF existirem identificadores duplicados no arquivo THEN THE CSV_Importer SHALL destacar as linhas duplicadas
3. IF existirem identificadores já cadastrados no sistema THEN THE CSV_Importer SHALL destacar as linhas conflitantes
4. IF existirem linhas com identificador vazio THEN THE CSV_Importer SHALL destacar as linhas inválidas
5. THE CSV_Importer SHALL exibir um resumo de validação: total de linhas, válidas, com erro, duplicadas
6. THE CSV_Importer SHALL permitir prosseguir apenas com as linhas válidas (ignorando erros)

### Requirement 5: Processo de Importação

**User Story:** Como um operador de estoque, eu quero acompanhar o progresso da importação, para que eu saiba quando o processo terminar.

#### Acceptance Criteria

1. WHEN a importação é iniciada THEN THE CSV_Importer SHALL exibir barra de progresso
2. WHEN a importação é iniciada THEN THE CSV_Importer SHALL processar em lotes de 100 itens
3. WHEN um item é importado com sucesso THEN THE CSV_Importer SHALL incrementar o contador de sucesso
4. IF um item falhar na importação THEN THE CSV_Importer SHALL registrar o erro e continuar com os próximos
5. WHEN a importação termina THEN THE CSV_Importer SHALL exibir relatório final com sucessos e falhas
6. WHEN a importação termina THEN THE CSV_Importer SHALL oferecer download de relatório de erros (se houver)

### Requirement 6: Seleção de Produto

**User Story:** Como um operador de estoque, eu quero selecionar para qual produto os itens serão importados, para que os itens fiquem vinculados ao produto correto.

#### Acceptance Criteria

1. WHEN o dialog de importação abre THEN THE CSV_Importer SHALL exibir seletor de produto serializado
2. THE CSV_Importer SHALL listar apenas produtos do tipo "serializado"
3. WHEN um produto é selecionado THEN THE CSV_Importer SHALL exibir informações do produto (nome, SKU, estoque atual)
4. THE CSV_Importer SHALL não permitir iniciar importação sem selecionar um produto

### Requirement 7: Histórico e Auditoria

**User Story:** Como um administrador, eu quero que as importações sejam registradas, para que eu possa auditar as operações.

#### Acceptance Criteria

1. WHEN itens são importados THEN THE CSV_Importer SHALL registrar no audit_log de cada item
2. THE CSV_Importer SHALL registrar o usuário que realizou a importação
3. THE CSV_Importer SHALL registrar a data/hora da importação
4. THE CSV_Importer SHALL registrar o nome do arquivo original
