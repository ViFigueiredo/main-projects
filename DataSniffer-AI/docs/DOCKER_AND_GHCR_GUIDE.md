# Guia de Build e Deploy com Docker e GitHub Container Registry (GHCR)

Este guia detalha os passos para construir as imagens Docker do projeto DataSniffer AI, enviá-las para o GitHub Container Registry (GHCR) e prepará-las para o deploy em um ambiente como Docker Swarm gerenciado pelo Portainer.

## Pré-requisitos

Antes de começar, garanta que você tenha:

1.  **Docker e Docker Compose**: Instalados e em execução na sua máquina.
2.  **Conta no GitHub**: Para hospedar o repositório e as imagens de contêiner.
3.  **Personal Access Token (PAT)**: Um PAT do GitHub com as permissões `write:packages` e `read:packages`. Você pode criar um em `GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)`.

## Passo 1: Configurar Variáveis de Ambiente

Na raiz do projeto, você encontrará um arquivo chamado `.env`. Ele centraliza todas as configurações e credenciais.

1.  Abra o arquivo `.env`.
2.  Substitua os valores das variáveis:
    - `REGISTRY_USER`: Coloque seu nome de usuário ou organização do GitHub (ex: `meu-usuario-github`).
    - `OPENROUTER_API_KEY`: Insira sua chave de API do OpenRouter. Este valor será usado como um fallback inicial, mas pode ser alterado pela interface da aplicação em produção.

**Exemplo de `.env` preenchido:**

```
REGISTRY_USER=meu-usuario-github
BACKEND_IMAGE_NAME=ghcr.io/meu-usuario-github/datasniffer-ai-backend
FRONTEND_IMAGE_NAME=ghcr.io/meu-usuario-github/datasniffer-ai-frontend
IMAGE_TAG=latest
OPENROUTER_API_KEY=sk-or-v1-abc...xyz
OPENROUTER_MODEL=google/gemini-flash-1.5
```

> **Importante**: O arquivo `.env` está listado no `.gitignore` e **nunca** deve ser enviado para o repositório Git para evitar a exposição de credenciais.

## Passo 2: Autenticação no GitHub Container Registry (GHCR)

Para poder enviar imagens para o seu registro no GitHub, você precisa se autenticar. Execute o seguinte comando no seu terminal, substituindo `SEU_USUARIO_GITHUB` e `SEU_PAT` pelos seus valores.

```bash
# Use seu Personal Access Token (PAT) como senha
export CR_PAT="SEU_PAT"
echo $CR_PAT | docker login ghcr.io -u SEU_USUARIO_GITHUB --password-stdin
```

Se o login for bem-sucedido, você verá a mensagem "Login Succeeded".

## Passo 3: Construir as Imagens Docker

Com o Docker Compose configurado, construir as imagens para o backend e o frontend é simples. Na raiz do projeto, execute:

```bash
docker-compose build
```

Este comando irá:

- Ler os `Dockerfile`s nos diretórios `backend/` e `frontend/`.
- Executar os builds multi-estágio, compilando o código Python para `.pyc` (para dificultar a engenharia reversa) e a aplicação Vue para arquivos estáticos.
- Criar as imagens finais otimizadas com as tags definidas no seu arquivo `.env`.

## Passo 4: Enviar as Imagens para o GHCR

Após construir as imagens, o próximo passo é enviá-las para o registro do GitHub.

Execute o comando:

```bash
docker-compose push
```

O Docker Compose usará as tags completas (ex: `ghcr.io/seu-usuario/datasniffer-ai-backend:latest`) e enviará cada imagem para o GHCR.

Após o upload, você poderá ver suas imagens na seção "Packages" do seu perfil ou organização no GitHub.

## Passo 5: Deploy com Portainer / Docker Swarm

Com as imagens publicadas no GHCR, o deploy se torna muito mais fácil.

1.  Acesse seu ambiente Portainer.
2.  Vá para a seção **Stacks** e clique em **Add stack**.
3.  Dê um nome para a sua stack (ex: `datasniffer-ai`).
4.  No editor web, cole o conteúdo do arquivo `docker-compose.yml`.
5.  Na seção **Environment variables**, adicione as variáveis de ambiente necessárias (como `OPENROUTER_API_KEY`). O Portainer as injetará de forma segura nos contêineres.
6.  Clique em **Deploy the stack**.

O Docker Swarm, gerenciado pelo Portainer, irá baixar as imagens do GHCR e orquestrar a criação dos serviços `backend` e `frontend`, expondo as portas e configurando os volumes conforme definido.
