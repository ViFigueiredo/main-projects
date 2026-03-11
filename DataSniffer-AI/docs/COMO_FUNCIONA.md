# Como o DataSniffer AI Funciona (Guia Simplificado)

Este documento explica como o **DataSniffer AI** funciona "por baixo do capô", conectando as peças do código de uma forma fácil de entender.

---

## 🏗️ Visão Geral da Arquitetura

O DataSniffer AI é dividido em duas partes principais que conversam entre si:

1.  **Frontend (A Interface Visual):** É o site que você vê no navegador. Feito com **Vue.js**. É onde você clica nos botões e vê os resultados.
2.  **Backend (O Cérebro):** É um servidor **Python** que roda no seu computador. Ele faz todo o trabalho pesado: intercepta o tráfego, escaneia sites e procura vulnerabilidades.

### 🔄 Como eles conversam?

Eles usam dois tipos de comunicação:

- **API (Pedidos):** O Frontend pede coisas para o Backend (ex: "Inicie o proxy", "Limpe o histórico").
- **WebSocket (Tempo Real):** O Backend envia dados para o Frontend assim que eles acontecem (ex: "Acabei de encontrar uma falha!", "Nova requisição detectada").

---

## 🕵️ O Fluxo de Interceptação (Proxy)

Quando você inicia uma "Missão de Auditoria", o seguinte acontece:

1.  **Você clica em "Iniciar":** O Frontend manda um pedido para o Backend.
2.  **O Backend liga o Proxy:** Ele inicia um programa chamado `mitmproxy` (Man-In-The-Middle Proxy).
3.  **O Navegador é Aberto:** O Backend abre um navegador especial configurado para passar todo o tráfego por esse proxy.
4.  **Interceptação (`proxy_addon.py`):**
    - Cada vez que você acessa um site, o pedido passa pelo nosso código (`proxy_addon.py`).
    - O código "lê" o pedido e a resposta do site.
    - Ele procura por padrões de erro ou dados sensíveis (`analyzer.py`).
5.  **Envio para a Tela:** O proxy envia esses dados para o Backend via WebSocket, que repassa imediatamente para o Frontend mostrar na tabela de tráfego.

---

## 🕷️ O Fluxo de Crawling (Varredura Automática)

Quando você usa a aba "Crawling":

1.  **O Comando:** Você define a profundidade e clica em iniciar.
2.  **O Robô (`crawler.py`):** O Backend acorda um "robô" (usando uma ferramenta chamada Playwright).
3.  **Navegação:** O robô entra no site, clica em links e preenche formulários automaticamente.
4.  **Ataque Controlado (`active_fuzzer.py`):**
    - Enquanto navega, o robô tenta "atacar" o site de forma segura.
    - Ele testa **SQL Injection** (tentar enganar o banco de dados).
    - Ele testa **XSS** (tentar injetar scripts maliciosos).
5.  **Relatório:** Se o robô conseguir "quebrar" a segurança, ele avisa o Frontend imediatamente com um alerta vermelho.

---

## 📂 Estrutura dos Arquivos (Onde está cada coisa?)

Para você se localizar no código:

### 🖥️ Frontend (`/frontend`)

- `src/views/`: As páginas do site (Tráfego, Configurações, Crawling).
- `src/stores/traffic.ts`: O "gerente de dados". Ele guarda a lista de requisições e cuida da conexão com o Backend.
- `src/components/`: Pedaços da interface (botões, tabelas, modais).

### 🧠 Backend (`/backend`)

- `main.py`: O chefe. Inicia o servidor e gerencia as conexões.
- `proxy_addon.py`: O espião. Fica no meio do tráfego capturando tudo.
- `src/crawler.py`: O explorador. Navega nos sites automaticamente.
- `src/active_fuzzer.py`: O testador. Tenta encontrar falhas de segurança ativamente.
- `src/analyzer.py`: O analista. Lê o conteúdo das páginas procurando por senhas vazadas ou erros.

---

## 🚀 Exemplo Prático: Detectando uma Falha SQL

1.  O **Crawler** encontra uma URL: `http://site-teste.com/produto?id=10`.
2.  Ele passa essa URL para o **Fuzzer** (`active_fuzzer.py`).
3.  O Fuzzer muda a URL para `http://site-teste.com/produto?id=10' OR '1'='1`.
4.  O site responde com um erro de banco de dados ou mostra todos os produtos.
5.  O Fuzzer detecta essa resposta estranha.
6.  Ele envia um alerta `VULN DETECTED` para o **Backend**.
7.  O Backend manda para o **Frontend** via WebSocket.
8.  Você vê o alerta aparecer no terminal da interface web em tempo real.

---

## 💡 Resumo

O **DataSniffer AI** é basicamente um navegador automatizado que "lê" tudo o que passa pela rede, analisa em busca de problemas e te avisa na hora. Ele combina automação (robôs) com análise de segurança (fuzzing) em uma interface amigável.
