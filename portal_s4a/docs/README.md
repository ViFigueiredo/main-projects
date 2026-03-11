# Documentacao do Projeto (Detalhada)

Este diretorio contem toda a documentacao detalhada do projeto.

## Fonte de verdade e objetivos

- Regras centrais para agentes/modelos de IA: `AGENTS.md` (raiz).
- Este `docs/` deve conter detalhes tecnicos e operacionais.
- `README.md` deve permanecer como resumo de onboarding para desenvolvedores.

## Arquivos de entrada recomendados

1. `AGENTS.md` (raiz)
2. `docs/AI_LEARNING_MAP.md`
3. `docs/ai-context.json`
4. Documentacao por dominio (arquitetura, banco, deploy, guias e specs)

## Estrutura principal

- `architecture/`: arquitetura, multi-tenant, tema, integracoes e seguranca
- `database/`: setup, workflow Neon, migrations, backup e restore
- `deployment/`: Docker/Swarm/Portainer e CI/CD
- `guides/`: guias por perfil (dev/admin/user/training/troubleshooting)
- `specs/`: regras de negocio e especificacoes funcionais

## Regra de sincronizacao obrigatoria

Sempre que arquitetura, regra de negocio, deploy, seguranca, permissao, integracao ou stack mudarem, atualize na mesma entrega:

- `AGENTS.md`
- arquivos impactados em `docs/`
- `README.md` (se impactar onboarding/uso)
- `.github/copilot-instructions.md` (se impactar instrucoes minimas)
- `ai_instructions.json` (se mudar politica/caminhos)
