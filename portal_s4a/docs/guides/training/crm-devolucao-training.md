# Treinamento: Devolucao CRM

## Objetivos

Ao final, voce deve:

- Entender os tipos de devolucao
- Executar devolucao com motivo e status de destino
- Navegar entre itens relacionados
- Resolver problemas basicos de operacao

## Conceito

A devolucao move o trabalho para a etapa anterior do pipeline:

- Pedido -> Oportunidade
- Demanda -> Pedido

A origem e o destino ficam vinculados por auditoria e relacionamento.

## Interface

### Controles

- Mostrar Finalizados: exibe itens concluidos.

### Indicadores

- Icones de relacionamento/devolucao
- Links para abrir origem e destino
- Destaque visual para itens finalizados

## Processo padrao

1. Abrir item de origem.
2. Clicar no botao de devolucao.
3. Informar motivo claro.
4. Escolher status de destino.
5. Confirmar e validar resultado.

## Resultado esperado

- Item novo criado na esteira de destino.
- Origem atualizada para revisao conforme regra operacional.
- Registro de auditoria criado.

## Boas praticas

- Use motivos objetivos e auditaveis.
- Escolha status de destino coerente com a acao esperada.
- Comunique a equipe quando houver impacto em SLA.

## Troubleshooting rapido

### Nao aparece botao de devolucao

- Falta de permissao.

### Falha na confirmacao

- Motivo vazio, status invalido ou problema de conexao.

### Item nao encontrado na esteira

- Conferir status de destino selecionado.
- Usar relacionamento para localizar origem/destino.

## Quiz rapido

1. Quais devolucoes sao suportadas?
   Resposta: Pedido -> Oportunidade e Demanda -> Pedido.

2. Qual campo e obrigatorio?
   Resposta: Motivo.

3. Como localizar item devolvido?
   Resposta: Pela esteira de destino e pelos relacionamentos/auditoria.

---

Ultima atualizacao: Marco 2026
