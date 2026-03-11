# AI Development Rules

This document outlines the technology stack and specific library usage guidelines for this Next.js application. Adhering to these rules will help maintain consistency, improve collaboration, and ensure the AI assistant can effectively understand and modify the codebase.

## Tech Stack Overview

The application is built using the following core technologies:

- **Framework**: Next.js (App Router)

## Library Usage Guidelines

To ensure consistency and leverage the chosen stack effectively, please follow these rules:

1.  **UI Components**:

2.  **Styling**:

3.  **Icons**:

4.  **Forms**:

5.  **State Management**:

6.  **Routing**:

7.  **API Calls & Data Fetching**:

8.  **Animations**:

9.  **Notifications/Toasts**:

10. **Charts & Data Visualization**:

11. **Utility Functions**:

12. **Custom Hooks**:

13. **TypeScript**:

    - Write all new code in TypeScript.
    - Strive for strong typing and leverage TypeScript's features to improve code quality and maintainability. Avoid using `any` where possible.

14. **Git Commits**:

    - **Always write commit messages in Portuguese (pt-BR).**
    - Use clear, descriptive commit messages following the pattern: `tipo: descrição` (e.g., `feat: adiciona módulo de carteira de clientes`).
    - Common types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`.

15. **Segurança e Validação**:
    - **Input Validation**: SEMPRE validar dados de entrada usando Zod antes de processar
    - **SQL Injection**: Usar APENAS queries parametrizadas, NUNCA concatenar strings SQL
    - **XSS Protection**: Sanitizar dados antes de renderizar (especialmente em `dangerouslySetInnerHTML`)
    - **Authentication**: Verificar permissões em TODAS as rotas de API e Server Actions
    - **Environment Variables**: NUNCA commitar `.env.local`, sempre usar `.env.example` como template
    - **Sensitive Data**: Não logar senhas, tokens ou dados sensíveis nos logs
    - **Rate Limiting**: Implementar rate limiting em endpoints críticos (login, upload, etc.)
    - **File Upload Security**:
      - Validar tipo MIME real do arquivo (não confiar apenas na extensão)
      - Limitar tamanho máximo de upload
      - Sanitizar nomes de arquivo antes de salvar
      - Verificar se arquivo é realmente uma imagem (para uploads de imagem)
    - **HTTPS Only**: Garantir que todas as URLs de produção usem HTTPS

16. **Performance e Escalabilidade**:
    - **Database Indexes**: Criar índices em colunas frequentemente consultadas (foreign keys, campos de busca)
    - **Pagination**: SEMPRE paginar listas longas (use `LIMIT` e `OFFSET` ou cursor-based pagination)
    - **Lazy Loading**: Carregar dados pesados sob demanda, não tudo de uma vez
    - **Image Optimization**: Usar Next.js `<Image>` component para otimização automática
    - **Caching Strategy**:
      - Server Components: usar cache nativo do Next.js
      - Client-side: considerar SWR ou React Query para dados frequentes
      - Database: implementar caching em queries repetitivas
    - **Bundle Size**: Monitorar tamanho do bundle, usar dynamic imports para código pesado
    - **Database Connection Pooling**: Configurar pool de conexões adequado no Neon
    - **N+1 Queries**: Evitar múltiplas queries em loops, usar JOINs ou batch queries

19. **Arquitetura e Organização**:
    - **Separation of Concerns**:
      - Lógica de negócio em `src/lib/` (ex: `src/lib/services/`)
      - Validações em `src/lib/validations/`
      - Tipos TypeScript em `src/types/` ou co-localizados
      - Utilitários de DB em `src/lib/db/`
    - **Naming Conventions**:
      - Componentes: PascalCase (ex: `EmployeeCard.tsx`)
      - Arquivos de utilitários: kebab-case (ex: `format-currency.ts`)
      - Hooks: prefixo `use-` (ex: `use-employee-data.ts`)
      - Constantes: UPPER_SNAKE_CASE
    - **File Structure**:
    - **Component Size**: Manter componentes < 300 linhas; refatorar em subcomponentes se necessário
    - **DRY Principle**: Extrair código repetido em funções/componentes reutilizáveis

20. **Qualidade de Código**:
    - **Error Handling**:
      - SEMPRE usar try-catch em operações assíncronas
      - Retornar erros significativos para o usuário (via toast)
      - Logar erros no servidor para debugging
```typescript
      try {
        await operation();
        toast.success('Operação concluída');
      } catch (error) {
        console.error('Operation failed:', error);
        toast.error('Erro ao executar operação');
      }
```
    - **TypeScript Best Practices**:
      - Evitar `any`, preferir `unknown` quando tipo é realmente desconhecido
      - Usar `interface` para objetos públicos/extensíveis
      - Usar `type` para unions, intersections, utilities
      - Definir tipos de retorno explícitos em funções públicas
    - **Comments & Documentation**:
      - Comentar APENAS o "porquê", não o "o quê" (código deve ser auto-explicativo)
      - Usar JSDoc para funções/classes complexas
      - Manter README.md e docs/ atualizados
    - **Testing Mindset**:
      - Escrever código testável (funções puras, separação de concerns)
      - Considerar edge cases (null, undefined, arrays vazios, etc.)

21. **Database Best Practices**:
    - **Migrations**:
      - SEMPRE criar migration para mudanças no schema
      - Usar transações para migrations complexas
      - Testar migrations em ambiente de desenvolvimento primeiro
      - Manter migrations versionadas e em ordem cronológica
    - **Schema Design**:
      - Usar foreign keys para integridade referencial
      - Adicionar `created_at` e `updated_at` em tabelas principais
      - Considerar soft deletes (`deleted_at`) para dados importantes
      - Normalizar dados, mas desnormalizar quando performance é crítica
    - **Query Optimization**:
      - Usar `SELECT` específico, evitar `SELECT *`
      - Criar índices compostos para queries com múltiplos filtros
      - Usar `EXPLAIN ANALYZE` para queries lentas
    - **Data Integrity**:
      - Usar constraints (NOT NULL, UNIQUE, CHECK)
      - Validar dados tanto no client quanto no server
      - Usar transactions para operações que modificam múltiplas tabelas

22. **API Design**:
    - **RESTful Conventions**:
      - GET: leitura
      - POST: criação
      - PUT/PATCH: atualização
      - DELETE: remoção
    - **Response Format**:
```typescript
      // Success
      { success: true, data: {...} }
      
      // Error
      { success: false, error: 'Mensagem de erro' }
```
    - **Status Codes**:
      - 200: OK
      - 201: Created
      - 400: Bad Request
      - 401: Unauthorized
      - 403: Forbidden
      - 404: Not Found
      - 500: Internal Server Error
    - **Versioning**: Considerar versionamento de API se mudanças breaking são esperadas

23. **Deploy e Produção**:
    - **Environment-Specific Config**:
      - Usar variáveis de ambiente para configurações sensíveis
      - Manter `.env.example` atualizado
      - Documentar todas as env vars necessárias
    - **Build Process**:
      - Garantir que `npm run build` funcione sem erros
      - Verificar warnings do TypeScript e ESLint
      - Testar bundle size (`npm run build` mostra relatório)
    - **Monitoring** (futuro):
      - Considerar Sentry para error tracking
      - Implementar health check endpoint (`/api/health`)
      - Monitorar performance com Web Vitals
    - **Backup Strategy**:
      - Configurar backups automáticos do Neon Database
      - Manter backups de arquivos críticos do S3
      - Documentar procedimento de restore

## ⚠️ Código Legado

**IMPORTANTE**: O projeto já possui código funcional em produção.

**Regras para modificações**:
1. **Não refatore** código existente a menos que seja EXPLICITAMENTE solicitado
2. **Mantenha compatibilidade** com padrões antigos quando modificar features existentes
3. **Aplique novas regras** APENAS em:
   - Novas features
   - Código sendo refatorado intencionalmente
   - Correções de bugs que exigem mudanças
4. **Sempre pergunte** antes de fazer mudanças estruturais grandes

**Exemplo de solicitação segura**:
✅ "Crie um novo módulo de relatórios seguindo as regras de segurança"
✅ "Refatore o componente EmployeeCard aplicando as melhores práticas"
❌ Não faça refatorações automáticas sem aviso
```

## MCPs Disponíveis

- **Neon Database**: Banco de Dados
- **Docker**: Containers e Imagens Docker
- **Fetch**: Utilitário para requisições HTTP
- **Memory**: Utilitário para manipulação de memória
- **ASAAS**: Integração com API de pagamentos

By following these guidelines, we can build a more robust, maintainable, and consistent application.

## File Uploads & Storage

**Storage Standard: ALWAYS use S3 (AWS S3-compatible Backblaze B2) for file, image, and document uploads.**

### Infrastructure

- **S3 utilities**: `src/lib/s3.ts` - use `uploadToS3()`, `deleteFromS3()`, `getPublicUrl()`, `extractKeyFromUrl()`, `getSignedUrlForFile()`
- **Upload API**: `POST /api/upload` (accepts FormData with `file` and `folder` params, returns `{url, key, fileName, size, type}`)
- **Delete API**: `DELETE /api/upload?url=<fileUrl>` (removes file from S3)
- **Signed URL API**: `GET /api/s3/signed-url?url=<s3Url>&expiresIn=<seconds>` (generates temporary signed URLs for private buckets)

### Implementation Pattern

**Client-side upload:**

```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('folder', 'category/subcategory'); // e.g., 'employees/photos'
const res = await fetch('/api/upload', { method: 'POST', body: formData });
const { url } = await res.json();
// Store url in database
```

**Display images from private buckets:**

```typescript
import { useSignedUrl } from '@/hooks/use-signed-url';

function MyComponent({ s3Url }) {
  // Generates temporary signed URL (valid for 1 hour by default)
  const signedUrl = useSignedUrl(s3Url);

  return <img src={signedUrl || undefined} alt="..." />;
# Instrução obrigatória para commits

**IMPORTANTE:** Sempre que o usuário pedir para "fazer o commit" ou simplesmente "git", execute `git add .` antes do commit para garantir que todas as alterações estejam preparadas. Só depois execute o comando de commit.

Exemplo:
1. `git add .`
2. `git commit -m "mensagem do commit"`

Se o usuário pedir commit de arquivos específicos, adicione apenas os arquivos indicados.

---
}
```

### Security & Best Practices

- ✅ **Bucket MUST be PRIVATE** (more secure, no public access needed)
- ✅ **NO CORS configuration required** (signed URLs bypass CORS)
- ✅ **Credentials stay on server** (never exposed to browser)
- ✅ **Temporary URLs** (expire after configured time, default 1 hour)
- ✅ **Automatic renewal** (useSignedUrl hook renews URLs before expiration)

### When to Use Signed URLs

**ALWAYS use signed URLs when:**

- Displaying images/files uploaded to S3 in the browser
- Working with private S3 buckets (recommended)
- Need to keep credentials secure
- Want to avoid CORS configuration

**Example components using signed URLs:**

- `src/components/layout/sidebar.tsx` (system logos)
- `src/components/layout/user-menu.tsx` (employee photos)
- `src/components/hr/photo-upload.tsx` (employee photo preview)

### Configuration

Backblaze B2 credentials in `.env.local`:

```env
STORAGE_ENDPOINT=https://s3.us-east-005.backblazeb2.com
STORAGE_BUCKET_NAME=portal-s4a
STORAGE_ACCESS_KEY_ID=005xxxxxxxxxxxxxxxxxxxxx
STORAGE_SECRET_ACCESS_KEY=K005xxxxxxxxxxxxxxxxxxxxxx
```

### Never Do This

❌ **DON'T** try to make bucket public to fix CORS errors  
❌ **DON'T** add CORS configuration to bucket  
❌ **DON'T** use direct S3 URLs in `<img>` tags for private buckets  
❌ **DON'T** implement local file storage  
❌ **DON'T** use alternative upload methods unless explicitly requested

### Documentation

- **Setup Guide**: `docs/BACKBLAZE_B2_SETUP.md`
- **Signed URLs**: `docs/SIGNED_URLS_GUIDE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING_IMAGES.md`

## Documentação — localização e convenção

Todas as novas documentações (arquivos com extensão `.md` ou `.txt`) devem ser colocadas na pasta `./docs` na raiz do repositório.

- Exceções: `README.md`, `AI_RULES.md` e `todo.md` devem permanecer na raiz do projeto.
- Arquivos de configuração (por exemplo, `wrangler.toml`, `.github/workflows/*`) permanecem onde fazem sentido; esta regra aplica-se apenas a documentação destinada a leitura/guia (guides, HOWTOs, setup, deploy, etc.).

Por favor, ao criar documentação nova, coloque-a em `./docs` e atualize links no `README.md` quando necessário.