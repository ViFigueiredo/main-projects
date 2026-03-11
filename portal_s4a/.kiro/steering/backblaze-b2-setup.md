# Configuração do Backblaze B2 para Upload de Arquivos

## Passos para obter as credenciais corretas:

1. **Acesse o Backblaze B2 Console**: https://secure.backblaze.com/
2. **Vá em "App Keys"** no menu lateral
3. **Crie uma nova Application Key** (ou use uma existente)

### Credenciais necessárias:

- **keyID**: Este é o seu `STORAGE_ACCESS_KEY_ID`
  - Formato: Geralmente tem 25 caracteres (exemplo: `0051a2b3c4d5e6f7g8h9i0j1k`)
- **applicationKey**: Este é o seu `STORAGE_SECRET_ACCESS_KEY`
  - Formato: String longa de 31+ caracteres (exemplo: `K005abc123def456ghi789jkl012mno345pqr678`)

### Endpoint correto:

Para Backblaze B2, o endpoint deve ser:

```
https://s3.us-east-005.backblazeb2.com
```

**Atenção**: A região `us-east-005` no endpoint deve corresponder à região onde seu bucket foi criado.

### Exemplo de .env.local correto:

```bash
# S3 Compatible Storage Configuration (Backblaze B2)
STORAGE_BUCKET_NAME=seu-bucket-name
STORAGE_ACCESS_KEY_ID=0051a2b3c4d5e6f7g8h9i0j1k
STORAGE_SECRET_ACCESS_KEY=K005abc123def456ghi789jkl012mno345pqr678
STORAGE_REGION=us-east-005
STORAGE_ENDPOINT=https://s3.us-east-005.backblazeb2.com
STORAGE_FORCE_PATH_STYLE=true
```

## Configuração do Bucket:

### Passo 1: Criar/Configurar o Bucket

1. **Vá em "Buckets"** no Backblaze B2
2. **Selecione seu bucket** ou crie um novo
3. **Configure como "Public"** para que os arquivos sejam acessíveis publicamente
4. **Bucket Settings → Files in Bucket are**: Selecione "Public"

### Passo 2: Configurar CORS (CRÍTICO para funcionamento)

**IMPORTANTE**: Sem configurar CORS, as imagens não serão carregadas no navegador!

1. Na página do bucket, vá em **"Bucket Settings"**
2. Role até a seção **"CORS Rules"**
3. Clique em **"Add a CORS rule"**
4. Configure assim:

```json
{
  "corsRuleName": "allow-all-origins",
  "allowedOrigins": ["*"],
  "allowedOperations": ["s3_get", "s3_head"],
  "allowedHeaders": ["*"],
  "exposeHeaders": [],
  "maxAgeSeconds": 3600
}
```

**Para produção**, substitua `"*"` pelo domínio específico:

```json
{
  "corsRuleName": "allow-production",
  "allowedOrigins": ["https://seu-dominio.com", "http://localhost:3000"],
  "allowedOperations": ["s3_get", "s3_head"],
  "allowedHeaders": ["*"],
  "exposeHeaders": [],
  "maxAgeSeconds": 3600
}
```

### Passo 3: Verificar Configurações de Acesso

1. Certifique-se de que **"Bucket Type"** está como **"Public"**
2. Verifique se **"Default Encryption"** não está bloqueando acesso público
3. Teste acessando uma URL diretamente: `https://s3.us-east-005.backblazeb2.com/seu-bucket/pasta/arquivo.jpg`

## Testando a conexão:

Depois de atualizar as credenciais:

1. Reinicie o servidor de desenvolvimento
2. Tente fazer upload de uma imagem em Configurações → Sistema
3. Verifique os logs do terminal para mensagens de erro detalhadas

## Troubleshooting:

### Erro: "InvalidAccessKeyId"

- Verifique se o `STORAGE_ACCESS_KEY_ID` está correto
- Certifique-se de que não há espaços extras no início ou fim
- O keyID deve ter sido copiado da área "App Keys" no Backblaze

### Erro: "SignatureDoesNotMatch"

- Verifique se o `STORAGE_SECRET_ACCESS_KEY` está correto
- A applicationKey deve ser copiada quando você criou/revelou a App Key
- **Atenção**: A applicationKey só é mostrada UMA VEZ quando criada

### Erro: "NoSuchBucket"

- Verifique se o nome do bucket está correto
- O bucket deve existir no Backblaze B2
- Verifique se o endpoint corresponde à região do bucket

### Erro: "AccessDenied"

- Verifique se a Application Key tem permissão para upload
- A App Key deve ter pelo menos permissão de "Read and Write"

## Permissões necessárias para a Application Key:

Ao criar uma Application Key no Backblaze B2, certifique-se de que ela tem:

- **Allow access to Bucket(s)**: All ou selecione o bucket específico
- **Type of Access**: Read and Write (ou shareFiles + writeFiles)

## URLs públicas:

Após o upload bem-sucedido, as URLs dos arquivos seguirão o padrão:

```
https://s3.us-east-005.backblazeb2.com/seu-bucket/pasta/arquivo.jpg
```

Se o bucket estiver público, os arquivos poderão ser acessados diretamente por essas URLs.