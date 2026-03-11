# FigCodes Website - Developer Guide

## 📌 Visão Geral
Este é o site institucional da FigCodes, desenvolvido como uma Single Page Application (SPA) moderna e performática. O projeto inclui a apresentação da empresa, serviços, depoimentos e páginas dedicadas a produtos como o WhatsUpLeads.

## 🛠️ Tech Stack
- **Framework Core**: React (v18+) com TypeScript
- **Build Tool**: Vite
- **Estilização**: Tailwind CSS + Shadcn UI (Radix UI)
- **Roteamento**: React Router DOM (v6)
- **Gerenciamento de Estado/Data**: React Query (@tanstack/react-query)
- **Backend/Auth**: Supabase (integração configurada)
- **Icons**: Lucide React
- **UI Components**: Sonner (Toasts), Radix UI Primitives

## 📂 Estrutura do Projeto
- `src/`
  - `components/`: Componentes reutilizáveis e seções da Home.
    - `ui/`: Componentes base do Shadcn UI (não editar diretamente se possível).
  - `pages/`: Páginas completas (WhatsUpLeads, Terms, Privacy, NotFound).
  - `hooks/`: Custom hooks (use-mobile, use-toast).
  - `lib/`: Utilitários (utils.ts).
  - `integrations/supabase/`: Configuração do cliente Supabase.
  - `App.tsx`: Definição de rotas e layout principal.
  - `main.tsx`: Ponto de entrada da aplicação.

## 🚀 Comandos Principais
- `pnpm dev`: Inicia servidor de desenvolvimento (Vite).
- `pnpm build`: Gera build de produção.
- `pnpm lint`: Executa verificação de código (ESLint).
- `pnpm preview`: Visualiza o build de produção localmente.

## 📏 Padrões e Regras (AI Rules)
- **Rotas**: Devem ser mantidas em `src/App.tsx`.
- **Estilos**: Priorizar Tailwind CSS.
- **Componentes**: Utilizar componentes do diretório `src/components/ui` (Shadcn) sempre que possível.
- **Ícones**: Utilizar `lucide-react`.
- **Novas Páginas**: Criar em `src/pages/` e adicionar rota em `App.tsx`.

## 🔗 Rotas Atuais
- `/`: Home (Landing Page)
- `/whatsupleads`: Página do produto WhatsUpLeads
- `/termos-de-uso`: Termos de Uso
- `/politica-de-privacidade`: Política de Privacidade
