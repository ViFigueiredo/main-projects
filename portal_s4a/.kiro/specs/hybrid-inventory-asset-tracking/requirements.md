# Requirements Document

## Introduction

Este documento especifica os requisitos para a refatoração do módulo de Estoque do Portal S4A, transformando-o em um sistema híbrido de Inventário Geral e Rastreabilidade de Ativos. O sistema permitirá controle tanto de produtos simples (por quantidade total) quanto de produtos serializados (por unidade individual rastreável), com integração completa ao CRM para reservas e baixas automatizadas.

## Glossary

- **Sistema_Inventario**: O módulo de estoque refatorado que gerencia produtos simples e serializados
- **Produto_Simples**: Produto controlado apenas por quantidade total agregada (ex: parafusos, cabos)
- **Produto_Serializado**: Produto controlado por unidade individual com identificador único (ex: chips, equipamentos)
- **Item_Unico**: Instância individual de um produto serializado com identificador único
- **Identificador_Unico**: Campo rotulável que armazena SN/IMEI/ICCID/Chassi conforme o nicho
- **Reserva**: Vinculação temporária de estoque a uma oportunidade do CRM
- **Baixa_Definitiva**: Remoção permanente do estoque após conclusão de venda
- **Localizacao**: Posição física do item (Caixa/Prateleira/Armazém)
- **Status_Item**: Estado atual do item único (Disponível, Reservado, Vendido, Manutenção)
- **Rotulo_Identificador**: Nome customizável do campo identificador por nicho (ICCID, Serial/IMEI, Chassi)

## Requirements

### Requirement 1: Tipo de Produto no Cadastro

**User Story:** Como um gestor de estoque, eu quero classificar produtos como 'Simples' ou 'Serializado' no cadastro, para que o sistema aplique a lógica de controle apropriada para cada tipo.

#### Acceptance Criteria

1. WHEN um usuário acessa o formulário de cadastro de produto THEN THE Sistema_Inventario SHALL exibir um seletor com as opções 'Simples' e 'Serializado'
2. WHEN um produto é marcado como 'Simples' THEN THE Sistema_Inventario SHALL controlar o estoque apenas por quantidade total agregada
3. WHEN um produto é marcado como 'Serializado' THEN THE Sistema_Inventario SHALL habilitar a tabela filha de Itens Únicos
4. WHEN um produto existente tem seu tipo alterado de 'Simples' para 'Serializado' THEN THE Sistema_Inventario SHALL exigir o cadastro de itens únicos correspondentes à quantidade atual
5. IF um produto 'Serializado' possui itens únicos vinculados THEN THE Sistema_Inventario SHALL impedir a alteração do tipo para 'Simples'
6. THE Sistema_Inventario SHALL persistir o tipo de produto no banco de dados com valor padrão 'Simples'

### Requirement 2: Campos Dinâmicos para Itens Únicos (Ativos)

**User Story:** Como um gestor de estoque, eu quero cadastrar itens únicos com identificadores específicos para produtos serializados, para que eu possa rastrear cada unidade individualmente.

#### Acceptance Criteria

1. WHEN um produto é do tipo 'Serializado' THEN THE Sistema_Inventario SHALL exibir uma tabela filha de Itens Únicos
2. THE Item_Unico SHALL conter os campos: Identificador Único, Lote, Localização e Status
3. WHEN um Item_Unico é criado THEN THE Sistema_Inventario SHALL validar que o Identificador Único é único globalmente no sistema
4. THE Sistema_Inventario SHALL permitir os seguintes valores de Status: 'Disponível', 'Reservado', 'Vendido', 'Manutenção'
5. WHEN um Item_Unico é criado THEN THE Sistema_Inventario SHALL definir o Status inicial como 'Disponível'
6. THE Sistema_Inventario SHALL incrementar automaticamente a quantidade do produto pai ao adicionar um Item_Unico com status 'Disponível'
7. THE Sistema_Inventario SHALL decrementar automaticamente a quantidade do produto pai ao remover ou vender um Item_Unico

### Requirement 3: Rótulo Customizável do Identificador por Nicho

**User Story:** Como um administrador, eu quero configurar o rótulo do campo Identificador Único conforme meu nicho de negócio, para que a interface seja intuitiva para minha equipe.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL permitir configurar o rótulo do campo Identificador Único nas configurações do sistema
2. WHEN o nicho é 'Telecom' THEN THE Sistema_Inventario SHALL exibir o rótulo como 'ICCID'
3. WHEN o nicho é 'Eletrônicos' THEN THE Sistema_Inventario SHALL exibir o rótulo como 'Serial/IMEI'
4. WHEN o nicho é 'Veículos' THEN THE Sistema_Inventario SHALL exibir o rótulo como 'Chassi'
5. THE Sistema_Inventario SHALL permitir rótulos customizados além dos predefinidos
6. WHEN o rótulo é alterado THEN THE Sistema_Inventario SHALL atualizar todas as interfaces que exibem o campo Identificador Único

### Requirement 4: Sistema de Reserva Universal

**User Story:** Como um vendedor, eu quero reservar itens do estoque para uma oportunidade do CRM, para que o estoque fique bloqueado enquanto a negociação está em andamento.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL permitir vincular uma reserva a uma Oportunidade do CRM
2. WHEN uma reserva é criada para um Produto_Simples THEN THE Sistema_Inventario SHALL subtrair a quantidade reservada do estoque disponível global
3. WHEN uma reserva é criada para um Produto_Serializado THEN THE Sistema_Inventario SHALL alterar o status do Item_Unico selecionado para 'Reservado'
4. WHEN uma reserva é criada para Produto_Serializado THEN THE Sistema_Inventario SHALL registrar qual Item_Unico específico foi reservado para qual Oportunidade
5. WHEN uma oportunidade é cancelada THEN THE Sistema_Inventario SHALL liberar automaticamente os itens reservados
6. IF um Item_Unico está com status 'Reservado' THEN THE Sistema_Inventario SHALL impedir nova reserva do mesmo item
7. THE Sistema_Inventario SHALL exibir na interface da Oportunidade quais itens estão reservados

### Requirement 5: Interface de Movimentação com Agrupamento

**User Story:** Como um gestor de estoque, eu quero visualizar os itens agrupados por produto com opção de expandir para ver itens individuais, para que eu tenha uma visão consolidada e detalhada do inventário.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL exibir a lista de itens de estoque agrupada por produto
2. WHEN um produto é do tipo 'Serializado' THEN THE Sistema_Inventario SHALL exibir um indicador de expansão
3. WHEN o usuário expande um produto serializado THEN THE Sistema_Inventario SHALL exibir todos os Itens Únicos com seus identificadores, lotes, localizações e status
4. THE Sistema_Inventario SHALL exibir para cada produto: nome, SKU, quantidade total, quantidade disponível, quantidade reservada
5. THE Sistema_Inventario SHALL permitir filtrar por status do item (Disponível, Reservado, Vendido, Manutenção)
6. THE Sistema_Inventario SHALL permitir filtrar por localização (Caixa/Prateleira)
7. THE Sistema_Inventario SHALL exibir indicadores visuais diferenciados para cada status

### Requirement 6: Busca Global por Serial ou Lote

**User Story:** Como um operador de estoque, eu quero buscar rapidamente por qualquer serial ou lote, para que eu possa localizar itens específicos sem navegar por toda a estrutura.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL fornecer um campo de busca global na interface de estoque
2. WHEN o usuário digita no campo de busca THEN THE Sistema_Inventario SHALL pesquisar em: Identificador Único, Lote, SKU do produto e Nome do produto
3. WHEN a busca retorna resultados THEN THE Sistema_Inventario SHALL exibir o produto pai e destacar o item encontrado
4. THE Sistema_Inventario SHALL suportar busca parcial (substring match)
5. WHEN nenhum resultado é encontrado THEN THE Sistema_Inventario SHALL exibir mensagem informativa
6. THE Sistema_Inventario SHALL executar a busca com debounce de 300ms para otimizar performance

### Requirement 7: Baixa Automatizada na Conclusão de Venda

**User Story:** Como um gestor, eu quero que o sistema realize a baixa definitiva automaticamente quando uma venda é concluída no CRM, para que o estoque seja atualizado sem intervenção manual.

#### Acceptance Criteria

1. WHEN uma venda é marcada como concluída no CRM THEN THE Sistema_Inventario SHALL realizar a baixa definitiva dos itens vinculados
2. WHEN a baixa é realizada em um Produto_Simples THEN THE Sistema_Inventario SHALL decrementar a quantidade do estoque
3. WHEN a baixa é realizada em um Produto_Serializado THEN THE Sistema_Inventario SHALL alterar o status do Item_Unico para 'Vendido'
4. WHEN a baixa é realizada em um Produto_Serializado THEN THE Sistema_Inventario SHALL registrar no histórico do cliente qual Identificador Único específico ele recebeu
5. THE Sistema_Inventario SHALL criar um registro de movimentação do tipo 'out' com referência à venda
6. IF a baixa falhar THEN THE Sistema_Inventario SHALL notificar o usuário e manter a venda em estado pendente de baixa
7. THE Sistema_Inventario SHALL permitir baixa manual em casos de exceção

### Requirement 8: Histórico de Itens no Cliente

**User Story:** Como um atendente de pós-venda, eu quero visualizar no cadastro do cliente quais identificadores específicos ele recebeu, para que eu possa prestar suporte adequado.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL registrar no histórico do cliente cada Item_Unico vendido com seu Identificador Único
2. WHEN um usuário acessa o cadastro de um cliente THEN THE Sistema_Inventario SHALL exibir uma seção de 'Ativos Adquiridos'
3. THE Sistema_Inventario SHALL exibir para cada ativo: Identificador Único, Produto, Data da Venda, Número do Pedido
4. THE Sistema_Inventario SHALL permitir buscar clientes pelo Identificador Único de um ativo que possuem
5. WHEN um Item_Unico é vendido THEN THE Sistema_Inventario SHALL vincular permanentemente ao cliente mesmo após alterações no estoque

### Requirement 9: Gestão de Localização de Itens

**User Story:** Como um operador de estoque, eu quero registrar e atualizar a localização física de cada item único, para que eu possa encontrá-los rapidamente no armazém.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL permitir cadastrar localizações no formato hierárquico (Armazém > Corredor > Prateleira > Caixa)
2. WHEN um Item_Unico é criado THEN THE Sistema_Inventario SHALL permitir atribuir uma localização
3. THE Sistema_Inventario SHALL permitir transferir itens entre localizações com registro de movimentação
4. WHEN uma localização é alterada THEN THE Sistema_Inventario SHALL registrar a movimentação com data, hora e usuário responsável
5. THE Sistema_Inventario SHALL permitir visualizar todos os itens de uma localização específica
6. THE Sistema_Inventario SHALL validar que a localização existe antes de atribuir a um item

### Requirement 10: Relatórios e Métricas de Inventário

**User Story:** Como um gestor, eu quero visualizar métricas e relatórios do inventário, para que eu possa tomar decisões baseadas em dados.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL exibir cards de resumo com: Total de Produtos, Valor Total do Estoque, Itens em Manutenção, Alertas Ativos
2. THE Sistema_Inventario SHALL calcular o valor do estoque considerando quantidade disponível × custo unitário
3. THE Sistema_Inventario SHALL exibir gráfico de distribuição de status para produtos serializados
4. THE Sistema_Inventario SHALL listar os produtos com estoque crítico (abaixo do mínimo)
5. THE Sistema_Inventario SHALL exibir histórico de movimentações com filtros por período, tipo e produto
6. THE Sistema_Inventario SHALL permitir exportar relatórios em formato PDF e Excel

### Requirement 11: Integração com Oportunidades do CRM

**User Story:** Como um vendedor, eu quero selecionar itens do estoque diretamente na oportunidade, para que o processo de venda seja integrado.

#### Acceptance Criteria

1. WHEN um usuário está editando uma Oportunidade THEN THE Sistema_Inventario SHALL exibir opção de adicionar itens do estoque
2. WHEN o produto selecionado é 'Simples' THEN THE Sistema_Inventario SHALL permitir informar apenas a quantidade
3. WHEN o produto selecionado é 'Serializado' THEN THE Sistema_Inventario SHALL exibir lista de Itens Únicos disponíveis para seleção
4. THE Sistema_Inventario SHALL exibir para cada Item_Unico disponível: Identificador Único, Lote e Localização
5. WHEN um Item_Unico é selecionado THEN THE Sistema_Inventario SHALL criar automaticamente a reserva
6. THE Sistema_Inventario SHALL impedir adicionar quantidade maior que o estoque disponível
7. THE Sistema_Inventario SHALL atualizar em tempo real a disponibilidade conforme reservas são feitas

### Requirement 12: Auditoria e Rastreabilidade

**User Story:** Como um auditor, eu quero rastrear todo o ciclo de vida de um item serializado, para que eu possa verificar a conformidade dos processos.

#### Acceptance Criteria

1. THE Sistema_Inventario SHALL registrar todas as alterações de status de um Item_Unico com timestamp e usuário
2. THE Sistema_Inventario SHALL manter histórico completo de movimentações de localização
3. WHEN um Item_Unico é consultado THEN THE Sistema_Inventario SHALL exibir timeline completa de eventos
4. THE Sistema_Inventario SHALL registrar: criação, reservas, liberações, vendas, transferências e manutenções
5. THE Sistema_Inventario SHALL permitir buscar o histórico por Identificador Único
6. THE Sistema_Inventario SHALL impedir exclusão de registros de auditoria

### Requirement 13: Integração do Cadastro de Produtos com Estoque Híbrido

**User Story:** Como um gestor de produtos, eu quero que o cadastro de produtos em CRM > Cadastro > Produtos esteja integrado com o sistema de estoque híbrido, para que eu possa gerenciar produtos e estoque de forma unificada.

#### Acceptance Criteria

1. WHEN um usuário acessa CRM > Cadastro > Produtos THEN THE Sistema_Inventario SHALL exibir uma opção de 'Integração com Estoque'
2. WHEN a integração com estoque está habilitada THEN THE Sistema_Inventario SHALL exibir o seletor de tipo de produto ('Simples' ou 'Serializado')
3. WHEN um produto tem integração com estoque habilitada THEN THE Sistema_Inventario SHALL sincronizar automaticamente a quantidade entre o cadastro de produtos e o módulo de estoque
4. THE Sistema_Inventario SHALL permitir habilitar/desabilitar a integração com estoque por produto
5. WHEN a integração é habilitada em um produto existente THEN THE Sistema_Inventario SHALL migrar os dados de quantidade atual para o módulo de estoque
6. WHEN um produto com integração é editado THEN THE Sistema_Inventario SHALL exibir link direto para gerenciar itens únicos (se serializado)
7. THE Sistema_Inventario SHALL exibir na listagem de produtos um indicador visual de integração com estoque
8. WHEN um produto serializado é criado via cadastro de produtos THEN THE Sistema_Inventario SHALL redirecionar para cadastro de itens únicos
9. THE Sistema_Inventario SHALL manter compatibilidade com produtos existentes que não utilizam a integração com estoque
