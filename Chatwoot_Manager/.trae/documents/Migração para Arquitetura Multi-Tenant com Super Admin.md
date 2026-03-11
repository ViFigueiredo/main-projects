# Plano de Migração Multi-Tenant

Este plano detalha a transformação do sistema atual (Single Tenant) para uma arquitetura Multi-Tenant com suporte a Super Admin e Admin de Tenant.

## 1. Banco de Dados (Prisma)
Como o schema atual está vazio, criaremos a estrutura do zero:

### Novos Modelos
*   **Tenant**: Armazena as configurações da instância Chatwoot (URL, Token) e dados da empresa.
*   **User**: Armazena os usuários do sistema (Admin Tenant) com login/senha locais.

```prisma
model Tenant {
  id            String   @id @default(uuid())
  name          String
  slug          String   @unique // Para URLs amigáveis ou identificação interna
  chatwootUrl   String
  chatwootToken String
  users         User[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   // Hash
  role      String   // 'ADMIN_TENANT' (Super Admin usa ENV)
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 2. Autenticação Híbrida (`server/api/auth/login.post.ts`)
Atualizaremos a lógica de login para suportar dois métodos:
1.  **Super Admin**: Verifica credenciais do `.env` (como é hoje). Retorna role `SUPER_ADMIN` e acesso global.
2.  **Tenant Admin**: Verifica credenciais na tabela `User` do banco. Retorna role `TENANT_ADMIN` e `tenantId` vinculado.

## 3. Backend: Gerenciamento (API Routes)
Criaremos endpoints protegidos para o Super Admin:
*   `POST /api/tenants`: Criar novo tenant com credenciais Chatwoot.
*   `GET /api/tenants`: Listar tenants.
*   `POST /api/users`: Criar usuários locais vinculados a um tenant.

## 4. Frontend: Estrutura e Contexto
*   **Store de Contexto (`useTenant`)**:
    *   Para **Super Admin**: Permite "selecionar" qual tenant está gerenciando no momento.
    *   Para **Tenant Admin**: Carrega automaticamente o tenant vinculado ao seu usuário.
*   **Refatoração do `useChatwootClient`**:
    *   Deixa de ler `.env` diretamente.
    *   Passa a ler URL/Token do "Tenant Atual" (definido na Store de Contexto).

## 5. Interface do Usuário
*   **Painel Super Admin**:
    *   Menu extra: "Gerenciar Tenants" e "Gerenciar Usuários".
    *   Seletor de Contexto: "Visualizando Tenant: [Nome da Empresa]".
*   **Painel Admin Tenant**:
    *   Vê apenas as funcionalidades do Chatwoot (Usuários, etc) usando as credenciais do seu tenant.

## Passo a Passo da Execução
1.  **Schema & Migration**: Definir e aplicar o schema do banco.
2.  **Auth Update**: Implementar login híbrido.
3.  **CRUD Backend**: Criar rotas de Tenants e Users.
4.  **Frontend Core**: Implementar lógica de seleção de tenant.
5.  **Refactor Client**: Atualizar cliente Chatwoot para usar credenciais dinâmicas.
6.  **UI Pages**: Criar páginas de gestão (CRUD).
