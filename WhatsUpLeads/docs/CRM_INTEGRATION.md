# Guia de Integração para CRM Externo

Este guia descreve como integrar seu CRM ou sistema externo ao **WhatsUpLeads** para enviar mensagens de WhatsApp utilizando as instâncias conectadas.

## 1. Autenticação

Todas as requisições para a API devem incluir o cabeçalho `x-api-key`.

### Onde encontrar sua API Key
1. Acesse o painel do WhatsUpLeads.
2. Navegue até **Configurações** (Settings) no menu lateral.
3. Na seção "Chaves de API", clique no ícone de olho para visualizar ou copiar sua chave.

**Exemplo de Header:**
```http
x-api-key: cl...123456789
Content-Type: application/json
```

---

## 2. Identificar a Instância (Instance ID)

Para enviar uma mensagem, você precisa saber qual instância (número de WhatsApp conectado) será utilizada.

### Listar Instâncias Disponíveis
**Endpoint:** `GET /api/v1/instances`

**Requisição (cURL):**
```bash
curl -X GET "https://seu-dominio.com/api/v1/instances" \
  -H "x-api-key: SUA_API_KEY"
```

**Resposta de Exemplo:**
```json
{
  "instances": [
    {
      "id": "cm...instancia1",
      "name": "WhatsApp Vendas",
      "provider": "UAZAPI",
      "status": "CONNECTED",
      "phoneNumber": "5511999999999",
      ...
    }
  ]
}
```
> **Nota:** Guarde o `id` da instância que deseja utilizar (ex: `cm...instancia1`).

---

## 3. Enviar Mensagem

Utilize o endpoint de envio para disparar mensagens a partir do seu CRM.

### Endpoint
`POST /api/v1/messages/send`

### Parâmetros do Corpo (JSON)

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `instanceId` | string | Sim | O ID da instância obtido no passo anterior. |
| `to` | string | Sim | Número de destino no formato internacional (ex: `5511999999999`). |
| `type` | string | Não | Tipo da mensagem: `text` (padrão), `image`, `video`, `document`. |
| `content` | object | Sim | Objeto contendo o conteúdo da mensagem. |

### Exemplos de Payload

#### Texto Simples
```json
{
  "instanceId": "ID_DA_INSTANCIA",
  "to": "5511999999999",
  "type": "text",
  "content": {
    "body": "Olá! Recebemos seu cadastro no CRM."
  }
}
```

#### Imagem
```json
{
  "instanceId": "ID_DA_INSTANCIA",
  "to": "5511999999999",
  "type": "image",
  "content": {
    "url": "https://exemplo.com/imagem.jpg",
    "caption": "Veja nossa proposta"
  }
}
```

---

## 4. Exemplos de Código

### Node.js (Fetch)

```javascript
const API_URL = 'https://seu-dominio.com/api/v1';
const API_KEY = 'SUA_API_KEY';
const INSTANCE_ID = 'SEU_INSTANCE_ID';

async function enviarMensagem(telefone, texto) {
  const response = await fetch(`${API_URL}/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY
    },
    body: JSON.stringify({
      instanceId: INSTANCE_ID,
      to: telefone,
      type: 'text',
      content: {
        body: texto
      }
    })
  });

  const data = await response.json();
  console.log(data);
}

enviarMensagem('5511999999999', 'Olá do meu CRM!');
```

### PHP (cURL)

```php
<?php

$url = 'https://seu-dominio.com/api/v1/messages/send';
$apiKey = 'SUA_API_KEY';

$data = [
    'instanceId' => 'SEU_INSTANCE_ID',
    'to' => '5511999999999',
    'type' => 'text',
    'content' => ['body' => 'Olá do CRM via PHP!']
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: ' . $apiKey
]);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
```
