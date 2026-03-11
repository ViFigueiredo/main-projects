# Mudanças na Navegação do Workspace

## 17 de Fevereiro de 2026

### Remoção de Itens da Sidebar
Para simplificar a interface do usuário e centralizar configurações, as seguintes alterações foram realizadas na sidebar do Admin Workspace (`/admin/workspace`):

1. **Campos Personalizados**:
   - Removido da sidebar principal.
   - O gerenciamento de campos personalizados agora é feito exclusivamente através do menu **Configurações**.
   - Isso evita redundância, já que o módulo de configurações já possuía uma seção dedicada para campos personalizados.

2. **Mensagens**:
   - O módulo de Mensagens foi ocultado da sidebar.
   - Esta funcionalidade foi considerada desnecessária no nível de acesso rápido da sidebar para o perfil de Admin neste momento.
   - O código e as rotas permanecem no projeto, apenas o acesso via menu foi removido.

### Estrutura Atual da Sidebar do Workspace
A sidebar agora contém os seguintes itens:
- Visão Geral
- Instâncias
- Credenciais
- Leads
- Campanhas
- Usuários
- Configurações

Essas mudanças visam melhorar a usabilidade e focar nas ações principais do administrador.
