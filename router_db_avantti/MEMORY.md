# Memórias e Conhecimento Acumulado do Agente

## Decisões Arquiteturais
- **Frontend Moderno**: Migração da interface para **PrimeVue** + **Tailwind CSS**, proporcionando uma experiência de usuário mais rica, com componentes de descoberta de dados (MultiSelect, Dropdowns dinâmicos) e visualização robusta (DataTable).
- **Backend Python (FastAPI)**: Migração do backend de Nuxt para Python para melhor performance e compatibilidade com drivers de banco de dados específicos.
- **SQLite para Configurações**: Uso de SQLite local para armazenar configurações de projetos e tenants, simplificando o setup e eliminando a dependência de bancos externos (Neon/PostgreSQL) para metadados.
- **Conexão Dinâmica SQL Server**: O backend Python utiliza `pymssql` para gerenciar conexões dinâmicas sob demanda. As credenciais master são configuradas via `.env`, e o usuário seleciona o banco/tabelas específicos no frontend.
- **Auto-Discovery**: Implementados endpoints para listar automaticamente bancos de dados e tabelas disponíveis no SQL Server configurado, facilitando o setup de novos projetos.
- **Segurança**: Autenticação via `x-api-key` no header, validada contra o banco SQLite.
- **Sistema de Logs**: Implementado sistema de logs unificado no diretório `/logs`. O backend Python e o frontend Nuxt (Server e Client) registram eventos detalhados (data/hora, rota, módulo, erro/debug) para facilitar a depuração.