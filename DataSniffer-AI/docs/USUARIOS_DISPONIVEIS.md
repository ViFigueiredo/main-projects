# 👥 Usuários Disponíveis no Sistema

## ✅ Usuários Criados

Você tem 3 usuários criados no Supabase:

### 1. Admin (Administrador)
- **Email:** `admin@datasniffer.ai`
- **Senha:** `DataSniffer2025!Admin`
- **Role:** admin
- **ID:** 2a5cf2c5-51e4-4173-b6e6-9c07aac7e07d

### 2. User1 (Usuário Teste)
- **Email:** `user1@test.com`
- **Senha:** `test123`
- **Role:** user
- **ID:** ceb3cb54-20b6-43e7-800b-b10d859c94fa

### 3. User2 (Usuário Teste)
- **Email:** `user2@test.com`
- **Senha:** `test123`
- **Role:** user
- **ID:** 7b861570-8e70-4ea2-88ed-ab64f1b49cd1

## ❌ Usuário que Você Tentou

Você tentou fazer login com:
- **Email:** `master@datasniffer.ai` ❌ NÃO EXISTE

## ✅ Solução

### Opção 1: Use um Usuário Existente

Faça login com um dos usuários acima. Recomendo usar o admin:

```
Email: admin@datasniffer.ai
Senha: DataSniffer2025!Admin
```

### Opção 2: Crie o Usuário master@datasniffer.ai

Se você quer criar o usuário `master@datasniffer.ai`, posso fazer isso para você.

Qual senha você quer usar?
- Mesma do admin: `DataSniffer2025!Admin`
- Outra senha personalizada

## 🧪 Como Testar

1. Acesse http://localhost:5173/login
2. Use as credenciais do **admin**:
   - Email: `admin@datasniffer.ai`
   - Senha: `DataSniffer2025!Admin`
3. Clique em "Entrar"
4. Deve fazer login com sucesso! ✅

## 📋 Funcionalidades por Role

### Admin (admin@datasniffer.ai)
- ✅ Ver todos os dados de todos os usuários
- ✅ Acessar painel administrativo
- ✅ Gerenciar usuários (criar, editar, deletar)
- ✅ Ver sessões ativas de todos
- ✅ Todas as funcionalidades de usuário normal

### User (user1/user2)
- ✅ Ver apenas seus próprios dados
- ✅ Criar sessões de análise
- ✅ Ver histórico próprio
- ✅ Configurar regras de falso positivo
- ❌ Não pode ver dados de outros usuários
- ❌ Não pode acessar painel admin

## 🔐 Segurança

- Todos os dados são isolados por usuário via RLS (Row Level Security)
- Usuários só veem seus próprios dados
- Admin tem acesso total
- Tokens JWT com expiração de 24h
