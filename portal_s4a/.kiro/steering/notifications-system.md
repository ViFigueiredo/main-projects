# Sistema de Notificações

Este documento descreve o sistema de notificações da intranet e as diretrizes para implementação em novas features.

## Visão Geral

O sistema de notificações permite que usuários sejam alertados sobre eventos importantes diretamente no header da aplicação, através de um ícone de sino com badge de contagem.

### Características

- ✅ Notificações em tempo real (polling a cada 30 segundos)
- ✅ Badge com contagem de não lidas
- ✅ 4 tipos de notificação (info, success, warning, error)
- ✅ Redirecionamento ao clicar
- ✅ Marcar como lida individualmente ou todas de uma vez
- ✅ Limpar todas as notificações
- ✅ Formatação de tempo relativo (5m atrás, 2h atrás, etc)

## Arquitetura

### Banco de Dados

Tabela: `notifications`

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### APIs

#### Listar notificações

```http
GET /api/notifications
Authorization: Session Cookie

Response: {
  notifications: [
    {
      id: number,
      title: string,
      message: string,
      link?: string,
      type: 'info' | 'success' | 'warning' | 'error',
      read: boolean,
      created_at: string
    }
  ]
}
```

#### Criar notificação

```http
POST /api/notifications
Authorization: Session Cookie
Content-Type: application/json

Body: {
  user_id: number,        // ID do usuário que receberá
  title: string,          // Título curto
  message: string,        // Descrição detalhada
  link?: string,          // URL para redirecionamento (opcional)
  type: 'info' | 'success' | 'warning' | 'error'
}

Response: {
  notification: { ...notification object }
}
```

#### Marcar como lida

```http
PATCH /api/notifications/[id]
Authorization: Session Cookie

Response: {
  notification: { id, read: true }
}
```

#### Limpar todas

```http
DELETE /api/notifications
Authorization: Session Cookie

Response: {
  success: true
}
```

## Quando Notificar Usuários

### ✅ Situações que DEVEM gerar notificações:

1. **Criação de registros importantes**

   - Novo funcionário cadastrado → notificar RH e gerentes
   - Novo cliente no CRM → notificar vendedor responsável
   - Novo pedido criado → notificar aprovadores

2. **Atualizações críticas**

   - Status de pedido alterado → notificar cliente e vendedor
   - Funcionário desligado → notificar RH e departamento
   - Cliente alterou categoria → notificar gerente comercial

3. **Aprovações e rejeições**

   - Documento aprovado/rejeitado → notificar solicitante
   - Pedido de férias aprovado → notificar funcionário
   - Orçamento recusado → notificar vendedor

4. **Alertas e prazos**

   - Documento vencendo em 3 dias → notificar responsável
   - Contrato de experiência terminando → notificar RH
   - Pagamento pendente → notificar financeiro

5. **Processos concluídos**

   - Import de funcionários finalizado → notificar quem iniciou
   - Relatório gerado → notificar solicitante
   - Backup concluído → notificar administrador

6. **Erros críticos**
   - Falha no envio de email → notificar administrador
   - Erro na integração → notificar TI
   - Limite de armazenamento atingido → notificar administrador

### ❌ Situações que NÃO devem gerar notificações:

- Ações triviais do próprio usuário (salvar rascunho, visualizar página)
- Logs de auditoria automáticos
- Operações silenciosas em background
- Eventos que já têm feedback visual imediato (toast notification)

## Como Implementar

### 1. Importar a função de notificação

```typescript
// Em Server Actions ou API Routes
import postgres from 'postgres';

const db = postgres(process.env.DATABASE_URL!);

async function createNotification(
  userId: number,
  title: string,
  message: string,
  link?: string,
  type: 'info' | 'success' | 'warning' | 'error' = 'info',
) {
  await db`
    INSERT INTO notifications (user_id, title, message, link, type)
    VALUES (${userId}, ${title}, ${message}, ${link || null}, ${type})
  `;
}
```

### 2. Chamar após ações importantes

```typescript
// Exemplo: Criar funcionário
export async function createEmployee(data: EmployeeData) {
  try {
    const [employee] = await db`
      INSERT INTO employees (name, cpf, ...)
      VALUES (${data.name}, ${data.cpf}, ...)
      RETURNING *
    `;

    // ✅ NOTIFICAR usuários relevantes
    // Buscar todos os usuários com permissão de RH
    const hrUsers = await db`
      SELECT u.id FROM users u
      JOIN roles r ON u.role_id = r.id
      JOIN role_permissions rp ON r.id = rp.role_id
      WHERE rp.permission_key = 'hr:manage'
    `;

    // Criar notificação para cada usuário de RH
    for (const hrUser of hrUsers) {
      await createNotification(
        hrUser.id,
        'Novo funcionário cadastrado',
        `${employee.name} foi adicionado ao sistema de RH.`,
        `/hr/employees/${employee.id}`,
        'success',
      );
    }

    return { success: 'Funcionário criado com sucesso.', employee };
  } catch (error) {
    console.error('Database Error:', error);
    return { error: 'Falha ao criar funcionário.' };
  }
}
```

### 3. Exemplo com múltiplos usuários

```typescript
// Import de funcionários em massa
export async function importEmployees(file: File) {
  try {
    const currentUser = await getCurrentUser();

    // Processar import...
    const result = await processImport(file);

    // ✅ NOTIFICAR o usuário que iniciou o processo
    await createNotification(
      currentUser.id,
      'Import de funcionários concluído',
      `${result.imported.length} funcionários importados com sucesso, ${result.failed.length} falharam.`,
      '/hr/employees',
      result.failed.length > 0 ? 'warning' : 'success',
    );

    return result;
  } catch (error) {
    // ✅ NOTIFICAR sobre erro crítico
    const currentUser = await getCurrentUser();
    await createNotification(
      currentUser.id,
      'Erro no import de funcionários',
      'Ocorreu um erro ao processar o arquivo. Tente novamente.',
      '/hr/employees',
      'error',
    );

    throw error;
  }
}
```

## Tipos de Notificação

### `info` (Azul)

- Informações gerais
- Novos registros criados
- Mudanças de status neutras

**Exemplo**: "Novo funcionário cadastrado no sistema"

### `success` (Verde)

- Ações concluídas com sucesso
- Aprovações
- Processos finalizados

**Exemplo**: "Pedido de férias aprovado"

### `warning` (Amarelo)

- Alertas que requerem atenção
- Prazos próximos
- Situações que podem se tornar problemas

**Exemplo**: "Contrato de experiência termina em 3 dias"

### `error` (Vermelho)

- Erros críticos
- Falhas em processos
- Ações que falharam

**Exemplo**: "Falha ao enviar email de boas-vindas"

## Checklist para Novas Features

Ao implementar uma nova feature, sempre pergunte:

- [ ] Esta ação afeta outros usuários além do que a executou?
- [ ] O usuário precisa ser informado quando a ação for concluída?
- [ ] Há prazos ou alertas importantes relacionados?
- [ ] Esta ação requer aprovação ou revisão de outros usuários?
- [ ] Em caso de erro, o usuário deve ser notificado?
- [ ] Esta é uma ação importante o suficiente para gerar um registro histórico?

Se a resposta for **SIM** para qualquer pergunta acima, **implemente notificações**.

## Boas Práticas

1. **Seja específico no título**: Evite títulos genéricos como "Nova notificação"
2. **Adicione contexto na mensagem**: Inclua detalhes relevantes
3. **Use links sempre que possível**: Facilite o acesso ao item relacionado
4. **Escolha o tipo correto**: Use o tipo apropriado para a situação
5. **Notifique apenas quem precisa saber**: Não spam todos os usuários
6. **Use permissões para filtrar**: Notifique apenas usuários com permissão relevante
7. **Agrupe notificações similares**: Evite múltiplas notificações para o mesmo evento
8. **Considere o volume**: Não crie notificações para cada item em operações em massa

## Componentes

### NotificationBell

Componente principal no header:

```typescript
import { NotificationBell } from '@/components/layout/notification-bell';

// Já está incluído no header.tsx
```

### Hook customizado (futuro)

```typescript
// src/hooks/use-notifications.ts
export function useNotifications() {
  // Implementar se necessário
}
```

## Troubleshooting

### Notificações não aparecem

1. Verifique se o usuário está autenticado
2. Confirme que `user_id` está correto
3. Verifique o console do navegador para erros
4. Teste a API diretamente: `GET /api/notifications`

### Polling não funciona

1. Verifique se o componente NotificationBell está montado
2. Confirme que não há erros de rede no console
3. Teste manualmente: abra o dropdown de notificações

### Link não redireciona

1. Confirme que o campo `link` está preenchido
2. Verifique se a rota existe no Next.js
3. Teste a navegação manualmente

## Exemplos Completos

Ver implementações em:

- `src/app/api/notifications/route.ts` - APIs
- `src/components/layout/notification-bell.tsx` - Componente UI
- `src/lib/db.ts` - Schema do banco