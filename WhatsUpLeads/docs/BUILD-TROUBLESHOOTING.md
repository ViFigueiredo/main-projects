# Troubleshooting do Build Docker

Este documento registra os problemas encontrados e soluções aplicadas no build do Docker.

## 🔍 Problemas Identificados

### 1. Build Multi-stage Complexo
**Problema**: Dockerfile multi-stage com cópias de arquivos Prisma que não existiam
**Erro**: `COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma: not found`

### 2. Dependências do Prisma no Build
**Problema**: Prisma tentando conectar com banco durante o build
**Erro**: Falhas de conexão com DATABASE_URL durante `prisma generate`

### 3. Plataformas Múltiplas
**Problema**: Build para ARM64 + AMD64 muito lento e propenso a falhas
**Solução**: Usar apenas `linux/amd64` para CI

## 🛠️ Soluções Aplicadas

### 1. Dockerfile Simplificado
Criado `Dockerfile.minimal` com:
- Single-stage build
- Apenas dependências essenciais
- Build otimizado para CI

### 2. Script de Build CI
Criado `scripts/build-ci.js` que:
- Define DATABASE_URL dummy para Prisma
- Gera Prisma client sem conexão real
- Executa build do Next.js

### 3. Comando de Build Específico
Adicionado `pnpm build:ci` que:
- Usa o script especializado para CI
- Evita problemas de conexão com banco
- Mantém compatibilidade com build local

## 📁 Arquivos Criados/Modificados

```
Dockerfile.minimal          # Dockerfile simplificado
scripts/build-ci.js         # Script de build para CI
scripts/check-image.ps1     # Verificação de imagem (Windows)
scripts/check-image.sh      # Verificação de imagem (Linux/Mac)
scripts/test-build.ps1      # Teste de build local (Windows)
scripts/test-build.sh       # Teste de build local (Linux/Mac)
package.json                # Adicionado script build:ci
.github/workflows/deploy.yml # Atualizado para usar Dockerfile.minimal
```

## 🧪 Como Testar

### Build Local
```bash
# Teste completo
pnpm build:ci

# Teste Docker
docker build -f Dockerfile.minimal -t whatsup-leads:test .
```

### Verificar Deploy
```bash
# Windows
powershell -ExecutionPolicy Bypass -File .\scripts\check-image.ps1

# Linux/Mac
./scripts/check-image.sh
```

## 📊 Status Atual

- ✅ Build local funciona
- ✅ Script CI funciona
- ✅ Dockerfile simplificado criado
- ⏳ Aguardando GitHub Actions

## 🔗 Links Úteis

- [GitHub Actions](https://github.com/ViFigueiredo/WhatsUpLeads/actions)
- [Container Registry](https://github.com/ViFigueiredo/WhatsUpLeads/pkgs/container/whatsup-leads)
- [Portainer](https://portainer.grupoavantti.com.br)

## 📝 Próximos Passos

1. Aguardar GitHub Actions completar
2. Se funcionar, otimizar Dockerfile para produção
3. Restaurar multi-stage build com correções
4. Configurar variáveis de ambiente de produção