# Implementação de Autenticação com Supabase RLS - DataSniffer AI

## Visão Geral

Este documento descreve a implementação completa do sistema de autenticação com Supabase Row Level Security (RLS) para a aplicação DataSniffer AI.

## Arquivos Modificados/Criados

### Frontend

1. **`frontend/src/stores/auth.ts`** - Store centralizado de autenticação
2. **`frontend/src/components/ProtectedRoute.vue`** - Componente reutilizável para proteção de rotas
3. **`frontend/src/views/LoginView.vue`** - Página de login com integração Supabase
4. **`frontend/src/views/RegisterModal.vue`** - Modal de registro com validação CAPTCHA
5. **`frontend/src/views/CrawlingView.vue`** - Envoltório com ProtectedRoute
6. **`frontend/src/views/ToolsView.vue`** - Envoltório com ProtectedRoute
7. **`frontend/src/views/TrafficView.vue`** - Envoltório com ProtectedRoute
8. **`frontend/src/views/ActiveSessionsView.vue`** - Envoltório com ProtectedRoute
9. **`frontend/src/views/ConfigView.vue`** - Envoltório com ProtectedRoute
10. **`frontend/src/layouts/DefaultLayout.vue`** - Indicadores visuais de cadeado e status

### Banco de Dados

1. **`supabase_rls_policies.sql`** - Políticas RLS completas para todas as tabelas

## Configuração do Supabase

### 1. Executar o Script SQL

No painel do Supabase, vá para **SQL Editor** e execute o conteúdo do arquivo `supabase_rls_policies.sql`.

### 2. Configurar Variáveis de Ambiente

No frontend, adicione as seguintes variáveis ao `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Configurar Autenticação

No painel do Supabase:
- Vá para **Authentication > Settings**
- Configure os provedores de autenticação desejados (email, GitHub, etc.)
- Configure as URLs de redirecionamento

## Funcionalidades Implementadas

### 1. Proteção de Rotas

As seguintes rotas estão protegidas:
- `/traffic` - Interceptação de Tráfego
- `/crawling` - Crawling
- `/tools` - Ferramentas
- `/active-sessions` - Sessões Ativas
- `/config` - Configurações

### 2. Indicadores Visuais

- Ícones de cadeado 🔒 no menu para rotas protegidas
- Status de autenticação no header
- Indicador de role admin quando aplicável

### 3. Validação CAPTCHA

- O CAPTCHA é executado apenas fora de localhost
- Validação via backend antes do login/registro
- Integração com Cloudflare Turnstile

### 4. Row Level Security

Políticas RLS implementadas para:
- `users` - Controle de acesso a perfis de usuário
- `crawling_sessions` - Sessões de crawling
- `crawling_results` - Resultados de crawling
- `traffic_data` - Dados de tráfego
- `vulnerability_scans` - Varreduras de vulnerabilidade
- `fuzzer_tests` - Testes de fuzzing
- `active_sessions` - Sessões ativas

## Como Funciona

### 1. Fluxo de Autenticação

1. Usuário tenta acessar rota protegida
2. Vue Router guard verifica autenticação
3. Se não autenticado, redireciona para login
4. Após login, usuário é redirecionado para rota original

### 2. Componente ProtectedRoute

```vue
<ProtectedRoute>
  <!-- Conteúdo protegido -->
</ProtectedRoute>
```

O componente verifica automaticamente se o usuário está autenticado:
- Se sim: renderiza o conteúdo
- Se não: exibe mensagem de acesso restrito com botão de login

### 3. Store de Autenticação

O store `useAuthStore` gerencia:
- Estado de autenticação
- Perfil do usuário
- Funções de login, logout, registro
- Verificação de role admin

### 4. Políticas RLS

As políticas garantem que:
- Usuários só vejam seus próprios dados
- Admins podem ver todos os dados
- Acesso granular por tabela e operação

## Testes

### 1. Testar Proteção de Rotas

1. Acesse a aplicação sem estar logado
2. Tente acessar `/tools`, `/crawling`, etc.
3. Deve ser redirecionado para login
4. Após login, deve conseguir acessar as rotas

### 2. Testar CAPTCHA

1. Em localhost: CAPTCHA não deve aparecer
2. Em produção/outro domínio: CAPTCHA deve aparecer e ser validado

### 3. Testar RLS

1. Crie dois usuários diferentes
2. Faça login com cada um
3. Verifique que cada usuário só vê seus próprios dados
4. Crie um usuário admin e verifique acesso total

## Manutenção

### 1. Adicionar Novas Rotas Protegidas

1. Adicione `meta: { requiresAuth: true }` à rota no router
2. Envolver o conteúdo da view com `<ProtectedRoute>`
3. Adicionar ícone de cadeado no DefaultLayout se necessário

### 2. Modificar Políticas RLS

1. Edite o arquivo `supabase_rls_policies.sql`
2. Execute as alterações no SQL Editor do Supabase
3. Teste as novas políticas

### 3. Promover Usuário a Admin

```sql
SELECT promote_user_to_admin('user@example.com');
```

### 4. Remover Role de Admin

```sql
SELECT remove_admin_role('user@example.com');
```

## Segurança

### 1. Boas Práticas Implementadas

- Tokens JWT gerenciados pelo Supabase
- Políticas RLS em nível de banco
- Validação CAPTCHA em produção
- Sem senhas armazenadas no frontend
- Role-based access control

### 2. Recomendações Adicionais

- Configurar autenticação de dois fatores
- Implementar rate limiting no backend
- Monitorar tentativas de acesso não autorizadas
- Configurar backups automáticos do Supabase

## Troubleshooting

### 1. Problemas Comuns

**Erro: "Single file component can contain only one <script setup> element"**
- Verifique se não há múltiplos blocos `<script setup>` no mesmo arquivo

**Erro: "Invalid end tag"**
- Verifique a estrutura HTML do componente

**RLS não funcionando**
- Verifique se RLS está habilitado na tabela
- Confirme se as políticas foram criadas corretamente

### 2. Debug

Para debugar problemas de autenticação:
1. Verifique o console do navegador
2. Verifique os logs do Supabase
3. Teste as políticas RLS no SQL Editor
4. Verifique as variáveis de ambiente

## Conclusão

Esta implementação fornece uma camada robusta de segurança para a aplicação DataSniffer AI, garantindo que apenas usuários autenticados possam acessar funcionalidades sensíveis e que os dados sejam isolados adequadamente por usuário.