# Guia do Usuario: Procedimentos de Devolucao CRM

## Visao Geral

O fluxo de devolucao permite retornar itens para a etapa anterior do pipeline:

- Demanda -> Pedido
- Pedido -> Oportunidade

A devolucao cria um novo item na esteira de destino, registra auditoria e preserva rastreabilidade entre origem e destino.

## Conceitos Importantes

- Status finalizador: item concluido, oculto por padrao.
- Relacionamento de devolucao: vinculo entre item de origem e item gerado.
- Revisao da origem: apos devolucao, o item de origem segue as regras operacionais de bloqueio/revisao.

## Controles de Visibilidade

- Mostrar Finalizados: exibe ou oculta itens com status finalizador.

## Como realizar devolucao

### Pedido para Oportunidade

1. Abra o Pedido.
2. Clique em Devolver para Oportunidade.
3. Informe o motivo.
4. Selecione o status de destino da Oportunidade.
5. Confirme.

Resultado esperado:

- Nova Oportunidade criada na esteira de destino.
- Pedido de origem atualizado para revisao conforme regra do sistema.
- Auditoria da devolucao registrada.

### Demanda para Pedido

1. Abra a Demanda.
2. Clique em Devolver para Pedido.
3. Informe o motivo.
4. Selecione o status de destino do Pedido.
5. Confirme.

Resultado esperado:

- Novo Pedido criado na esteira de destino.
- Demanda de origem atualizada conforme regra operacional.
- Auditoria da devolucao registrada.

## Relacionamentos e historico

- Use os links de relacionamento para navegar entre origem e destino.
- Consulte historico para ver usuario, motivo e data/hora da operacao.

## Permissoes

- `crm:devolucao:order_to_opportunity`
- `crm:devolucao:post_sales_to_order`

## Solucao de problemas

### Botao de devolucao nao aparece

- Validar permissao do usuario.
- Refazer login.

### Erro ao confirmar

- Validar motivo e status de destino.
- Verificar conectividade.

### Item nao localizado apos devolucao

- Conferir esteira de destino e status selecionado.
- Recarregar pagina.
- Verificar relacao no historico.

---

Ultima atualizacao: Marco 2026
