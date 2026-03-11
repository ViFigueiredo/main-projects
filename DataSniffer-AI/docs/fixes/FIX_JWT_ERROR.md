# 🔧 Correção do Erro JWT

## ❌ Erro Atual

```
AttributeError: module 'jwt' has no attribute 'encode'
```

## 🔍 Causa

Você tem a biblioteca **errada** instalada. Existem duas bibliotecas JWT no Python:

1. ❌ `jwt` - Biblioteca antiga e incompatível
2. ✅ `PyJWT` - Biblioteca correta que usamos

O problema é que ambas usam `import jwt`, então se a errada estiver instalada, causa conflito.

## ✅ Solução

### Passo 1: Desinstalar a biblioteca errada

```bash
cd backend
.venv\Scripts\activate
pip uninstall jwt -y
```

### Passo 2: Garantir que PyJWT está instalado

```bash
pip install PyJWT>=2.8.0
```

### Passo 3: Verificar instalação

```bash
pip list | findstr JWT
```

Deve mostrar apenas:
```
PyJWT    2.8.0 (ou superior)
```

### Passo 4: Reiniciar o backend

```bash
python main.py
```

## 🧪 Teste Rápido

Execute este comando para testar:

```bash
python -c "import jwt; print(jwt.__version__); print(hasattr(jwt, 'encode'))"
```

Deve mostrar:
```
2.8.0 (ou superior)
True
```

## 📋 Comandos Completos (Windows)

```bash
cd backend
.venv\Scripts\activate
pip uninstall jwt -y
pip install --upgrade PyJWT
python main.py
```

## ⚠️ Se Ainda Não Funcionar

Tente reinstalar o ambiente virtual:

```bash
# Desative o venv
deactivate

# Delete o venv
rmdir /s /q .venv

# Recrie o venv
python -m venv .venv
.venv\Scripts\activate

# Reinstale as dependências
pip install -r requirements.txt

# Inicie o backend
python main.py
```

## 🎯 Depois de Corrigir

Você também precisa criar o perfil do admin na tabela `users`. Vou fazer isso depois que o JWT estiver funcionando.
