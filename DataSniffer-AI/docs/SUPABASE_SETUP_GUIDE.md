# Guia de Configuração do Supabase - DataSniffer AI

## Problema Atual

O erro "Invalid login credentials" ocorre porque as credenciais que você está tentando usar não existem no Supabase. O sistema foi migrado para usar Supabase Authentication, então é necessário criar os usuários no Supabase.

## Passos para Configurar

### 1. Configurar o Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto ou selecione um existente
3. Vá para **Settings > API** para obter:
   - Project URL
   - anon public key

### 2. Configurar Variáveis de Ambiente

No frontend, crie o arquivo `.env` com:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 3. Executar Políticas RLS

No painel do Supabase, vá para **SQL Editor** e execute o conteúdo do arquivo `supabase_rls_policies.sql`.

### 4. Criar Usuário Admin

Existem duas maneiras de criar o usuário admin:

#### Opção A: Via painel do Supabase

1. Vá para **Authentication > Users**
2. Clique em "Add user"
3. Email: `master@datasniffer.ai`
4. Senha: `SENHA_FORTE_AQUI`
5. Após criar, vá para **Table Editor > users** e defina o role como 'admin'

#### Opção B: Via SQL (recomendado)

No SQL Editor, execute:

```sql
-- Criar usuário admin
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'master@datasniffer.ai',
  -- A senha será criptografada automaticamente
  'SENHA_FORTE_AQUI',
  NOW(),
  NOW()
);

-- Criar perfil do usuário admin
INSERT INTO public.users (
  user_id,
  email,
  role,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'master@datasniffer.ai'),
  'master@datasniffer.ai',
  'admin',
  NOW(),
  NOW()
);
```

### 5. Verificar Configuração

1. Inicie o frontend: `npm run dev`
2. Tente fazer login com:
   - Email: `master@datasniffer.ai`
   - Senha: `SENHA_FORTE_AQUI`

## Solução de Problemas Comuns

### "Supabase URL e/ou Anon Key não definidos"

Verifique se o arquivo `.env` está na pasta correta (`frontend/`) e se as variáveis estão definidas corretamente.

### "Invalid login credentials"

1. Verifique se o usuário existe em **Authentication > Users**
2. Verifique se o email foi confirmado
3. Tente redefinir a senha

### "Row Level Security não funcionando"

1. Verifique se RLS está habilitado nas tabelas
2. Execute o script `supabase_rls_policies.sql` novamente
3. Verifique as políticas em **Authentication > Policies`

### Erros de permissão

Verifique se as políticas RLS foram criadas corretamente. O script SQL deve ser executado completamente sem erros.

## Próximos Passos

Após configurar o Supabase:

1. **Teste o login** com as credenciais criadas
2. **Verifique as rotas protegidas** - devem exigir login
3. **Teste o CAPTCHA** em ambiente de produção
4. **Verifique as políticas RLS** - usuários só devem ver seus dados

## Migração de Dados

Se você tem dados existentes no banco local:

1. Exporte os dados do banco SQLite
2. Converta para o formato do Supabase
3. Importe via **Table Editor** ou scripts SQL
4. Verifique se os user_ids correspondem

## Suporte

Se continuar com problemas:

1. Verifique os logs do console do navegador
2. Verifique os logs do Supabase em **Settings > Logs**
3. Confirme as variáveis de ambiente com `console.log(import.meta.env)`
4. Teste a conexão com o Supabase diretamente no console

## Resumo

O sistema agora usa Supabase para:
- ✅ Autenticação de usuários
- ✅ Gerenciamento de sessões
- ✅ Row Level Security (RLS)
- ✅ Proteção de dados por usuário
- ✅ Roles (admin/user)

É necessário configurar o Supabase corretamente antes de usar o sistema.