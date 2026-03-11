# Guia de Execução SAST (Bandit)

Para executar a análise estática de segurança no backend do DataSniffer AI, utilize os seguintes comandos:

## Instalação

```bash
pip install bandit
```

## Execução via CLI

Execute o comando abaixo a partir da raiz do projeto:

```bash
bandit -r backend/ -f json -o sast_report.json
```

- `-r`: Recursivo (analisa subdiretórios)
- `-f json`: Formato de saída JSON (para fácil parsing)
- `-o sast_report.json`: Arquivo de saída

## Integração Automática

O módulo `backend/src/analyzer.py` agora possui a função `run_sast_scan()` que executa este comando automaticamente e retorna o JSON parseado para uso na aplicação.
