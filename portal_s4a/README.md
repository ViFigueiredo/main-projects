# Portal S4A - Intranet Corporativa

Sistema de intranet corporativa completo construído com Next.js, TypeScript e PostgreSQL.

## 🚀 Funcionalidades

- 🏠 Dashboard com estatísticas em tempo real
- 👥 Gestão de Recursos Humanos (funcionários, férias, etc)
- 📊 Integração com Power BI para relatórios
- 🎨 Sistema de temas customizável (light/dark mode)
- 🔐 Sistema de autenticação e permissões granulares
- 📱 Design responsivo e moderno
- ⚙️ Painel de administração completo

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 15.3.4 (App Router)
- **Linguagem**: TypeScript
- **UI**: Shadcn/UI + Radix UI + Tailwind CSS
- **Banco de Dados**: PostgreSQL (Neon)
- **Autenticação**: Sistema próprio com sessions
- **Ícones**: Lucide React
- **Formulários**: React Hook Form + Zod
- **Deploy**: Cloudflare Pages

## 📦 Instalação

```bash
# Clone o repositório
git clone <seu-repo>
cd portal_s4a

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

### Banco de Dados

Recomendamos usar o [Neon](https://neon.tech) como banco de dados PostgreSQL:

1. Crie uma conta no Neon
2. Crie um novo projeto PostgreSQL
3. Habilite Connection Pooling
4. Copie a connection string e adicione ao `.env.local`

## 🏃 Executando o Projeto

### Desenvolvimento

```bash
pnpm dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Build de Produção

```bash
pnpm build
pnpm start
```

## 🌐 Deploy

### Cloudflare Pages (preferencial)

### Pré-requisitos

1. Conta no Cloudflare
2. Wrangler CLI instalado

### Deploy Rápido

```bash
# Login no Cloudflare
npx wrangler login

# Build e Deploy
pnpm pages:deploy
```

### Deploy via GitHub

1. Conecte seu repositório no Cloudflare Dashboard
2. Configure:
   - Build command: `pnpm pages:build`
   - Build output: `.open-next/worker`
3. Adicione as variáveis de ambiente no dashboard

📖 **Guia completo**: [docs/README.md](./docs/README.md)

### Docker Swarm + Portainer

Este projeto usa um unico arquivo de stack para deploy em Swarm/Portainer:

```bash
docker stack deploy -c docker-stack.yaml portal-s4a
```

Redes padrao do stack: `internal`, `databases`, `tunnel`, `public`.

## 📚 Documentação

- [AGENTS.md](./AGENTS.md) - Regras centrais para agentes de IA e governanca tecnica
- [docs/README.md](./docs/README.md) - Indice da documentacao detalhada
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Instrucoes minimas para o Copilot

## 🤖 Politica de IA e documentacao

Este repositorio possui uma hierarquia clara para instrucoes e documentacao:

- `AGENTS.md` (raiz) e a fonte canonica de regras para agentes e modelos de IA.
- `docs/` contem toda documentacao detalhada do projeto.
- `README.md` e mantido como resumo de onboarding para desenvolvedores.
- `.github/copilot-instructions.md` deve ser minimo e apontar para `AGENTS.md`.
- `ai_instructions.json` concentra metadados legiveis por maquina.

Regras de localizacao da documentacao:

- Todos os arquivos de documentacao detalhada (`*.md`, `*.txt`) devem ficar em `./docs`.
- Excecoes na raiz: `README.md`, `AGENTS.md` e `todo.md`.

Sempre que houver mudanca de arquitetura, regra de negocio, deploy, seguranca, permissao, integracao ou stack, atualize na mesma entrega:

- `AGENTS.md`
- `docs/` (arquivos detalhados impactados)
- `README.md` (se impactar onboarding)
- `.github/copilot-instructions.md` (se impactar instrucoes minimas)
- `ai_instructions.json` (se mudar politica/caminhos canonicos)

Observacao de idioma:

- O arquivo `README.md` deve ser mantido sempre em Portugues (pt-BR).

## 🎨 Estrutura do Projeto

```
src/
├── app/              # Rotas e páginas (App Router)
├── components/       # Componentes React reutilizáveis
├── lib/             # Utilitários, ações e configurações
│   ├── actions/     # Server Actions
│   └── schemas/     # Schemas de validação (Zod)
├── hooks/           # Custom React Hooks
└── config/          # Configurações (rotas, ícones, etc)
```

## 🔐 Sistema de Permissões

O projeto implementa um sistema robusto de permissões baseado em roles:

- Perfis de acesso personalizáveis
- Permissões granulares por rota/funcionalidade
- Controle de acesso a relatórios Power BI
- Usuário admin padrão configurável

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença especificada no arquivo [LICENSE](./LICENSE).

## 🆘 Suporte

Para problemas ou dúvidas, abra uma issue no repositório.
