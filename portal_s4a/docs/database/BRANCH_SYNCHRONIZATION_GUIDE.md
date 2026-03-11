# Guia de Sincronização de Branches Git

Guia completo para sincronizar mudanças entre as branches `main` e `develop` do projeto.

## Situação Atual

- **Branch `main`**: Contém as mudanças de automação de banco por branch Git
- **Branch `develop`**: Não possui essas mudanças ainda

## Cenários de Sincronização

### 1. Merge da main para develop (Recomendado)

Este é o método mais seguro e preserva o histórico completo.

```bash
# 1. Ir para a branch develop
git checkout develop

# 2. Verificar se está na branch correta
git branch

# 3. Fazer merge da main
git merge main

# 4. Resolver conflitos se houver
# (O Git irá indicar quais arquivos têm conflitos)

# 5. Após resolver conflitos (se houver)
git add .
git commit -m "Merge main into develop"

# 6. Fazer push das mudanças
git push origin develop
```

### 2. Cherry-pick de commits específicos

Use quando quiser apenas commits específicos da main.

```bash
# 1. Ir para develop
git checkout develop

# 2. Ver commits da main que não estão na develop
git log main --not develop --oneline

# 3. Fazer cherry-pick dos commits desejados
git cherry-pick <hash-do-commit>

# 4. Push das mudanças
git push origin develop
```

### 3. Rebase (Use com cuidado)

Use apenas se a develop não tiver commits únicos importantes.

```bash
# 1. Ir para develop
git checkout develop

# 2. Fazer rebase com main
git rebase main

# 3. Se houver conflitos, resolver e continuar
git add .
git rebase --continue

# 4. Push (pode precisar de --force se já foi pushed antes)
git push origin develop --force-with-lease
```

## Verificando o Status

### Antes da sincronização

```bash
# Ver diferenças entre branches
git log develop..main --oneline

# Ver arquivos diferentes
git diff develop main --name-only

# Ver commits únicos em cada branch
git log --left-right --graph --cherry-pick --oneline develop...main
```

### Após a sincronização

```bash
# Verificar se as branches estão sincronizadas
git log develop..main --oneline
# (Não deve retornar nada se estão sincronizadas)

# Verificar se os arquivos estão iguais
git diff develop main
# (Não deve retornar diferenças)
```

## Testando Após Sincronização

### 1. Verificar detecção automática de banco

```bash
# Na branch develop
git checkout develop

# Verificar se detecta corretamente
pnpm dev
# Deve mostrar: 🔗 [Database] Branch: develop -> DEVELOPMENT
```

### 2. Testar troca de branches

```bash
# Trocar para main
git checkout main
pnpm dev
# Deve mostrar: 🔗 [Database] Branch: main -> PRODUCTION

# Voltar para develop
git checkout develop
pnpm dev
# Deve mostrar: 🔗 [Database] Branch: develop -> DEVELOPMENT
```

## Arquivos Importantes Sincronizados

Após a sincronização, a branch `develop` terá:

- ✅ `src/lib/database-config.ts` - Detecção automática de branch
- ✅ `src/lib/db.ts` - Uso da função de detecção
- ✅ `vercel.json` - Deploy apenas na main
- ✅ `.env.example` - Documentação atualizada
- ✅ `scripts/get-database-url.js` - Script auxiliar
- ✅ `docs/BRANCH_DATABASE_AUTOMATION.md` - Documentação

## Resolução de Conflitos

Se houver conflitos durante o merge:

### 1. Identificar arquivos com conflito

```bash
git status
# Mostrará arquivos com "both modified"
```

### 2. Resolver conflitos manualmente

Abra cada arquivo e procure por marcadores:

```
<<<<<<< HEAD
// Código da branch atual (develop)
=======
// Código da branch sendo merged (main)
>>>>>>> main
```

### 3. Escolher qual versão manter

- Manter apenas o código da main (recomendado para esses arquivos)
- Ou combinar ambos se necessário

### 4. Finalizar merge

```bash
# Após resolver todos os conflitos
git add .
git commit -m "Resolve merge conflicts"
git push origin develop
```

## Comandos de Emergência

### Se algo der errado durante merge

```bash
# Cancelar merge em andamento
git merge --abort

# Voltar ao estado anterior
git reset --hard HEAD~1

# Forçar reset para estado da main (CUIDADO!)
git reset --hard origin/main
```

### Se precisar desfazer push

```bash
# Desfazer último commit (mantém arquivos)
git reset --soft HEAD~1

# Desfazer último commit (remove arquivos)
git reset --hard HEAD~1

# Push forçado (CUIDADO!)
git push origin develop --force-with-lease
```

## Verificação Final

Após sincronização bem-sucedida:

1. ✅ Branch `develop` tem todos os arquivos da `main`
2. ✅ Sistema detecta automaticamente banco por branch
3. ✅ Logs mostram banco correto para cada branch
4. ✅ Deploy continua funcionando apenas na `main`

## Próximos Passos

Após sincronizar:

1. **Testar localmente**: Verificar se tudo funciona na develop
2. **Fazer commits**: Continuar desenvolvimento normalmente
3. **Manter sincronizado**: Repetir processo quando necessário
4. **Deploy**: Fazer merge para main quando pronto para produção

## Dicas Importantes

- ⚠️ **Sempre fazer backup** antes de operações destrutivas
- ✅ **Testar localmente** antes de fazer push
- 🔄 **Sincronizar regularmente** para evitar conflitos grandes
- 📝 **Documentar mudanças** importantes no commit message

## Automatização Futura

Considere criar um script para automatizar:

```bash
#!/bin/bash
# sync-branches.sh

echo "🔄 Sincronizando develop com main..."

git checkout develop
git pull origin develop
git merge main
git push origin develop

echo "✅ Sincronização concluída!"
```

Torne executável: `chmod +x sync-branches.sh`