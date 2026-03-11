# Integração SAST com Bandit

Este guia descreve como integrar a análise estática de segurança (SAST) usando a ferramenta Bandit no DataSniffer AI.

## 1. Instalação

Certifique-se de que o Bandit está instalado no seu ambiente Python:

```bash
pip install bandit
```

## 2. Execução Manual

Você pode rodar o Bandit diretamente no terminal para analisar o código do backend:

```bash
# A partir da raiz do projeto
bandit -r backend/ -f json -o sast_report.json
```

## 3. Script de Automação

Um script utilitário foi criado em `backend/run_sast.py` para facilitar a execução e visualização rápida dos resultados.

```bash
python backend/run_sast.py
```

## 4. Integração Futura (Roadmap)

Para integrar os resultados do SAST diretamente na interface do DataSniffer AI:

1.  **Banco de Dados**: Criar uma tabela `sast_findings` no `backend/db/database.py`.
2.  **Parser**: Criar um módulo em `backend/src/sast_parser.py` que lê o JSON gerado pelo Bandit e insere no banco.
3.  **API**: Expor um endpoint `GET /sast/findings` ou incluir no `/analysis/{session_id}`.
4.  **Frontend**: Criar uma nova aba "Code Analysis" na `AnalysisView.vue` para exibir esses achados.

### Exemplo de Estrutura de Tabela

```sql
CREATE TABLE sast_findings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    line_number INTEGER,
    issue_text TEXT,
    severity TEXT,
    confidence TEXT,
    code_snippet TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
