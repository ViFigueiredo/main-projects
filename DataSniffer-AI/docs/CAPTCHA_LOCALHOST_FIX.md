# 🔓 CAPTCHA Desabilitado em Localhost

## ✅ Mudanças Aplicadas

### Frontend - LoginView.vue
1. **CAPTCHA condicional no template:**
   - Adicionado `v-if="!isLocalhost"` no div do Turnstile
   - CAPTCHA só aparece em produção

2. **Script do Turnstile condicional:**
   - Script só é carregado se não for localhost
   - Evita carregar recursos desnecessários

3. **Login simplificado:**
   - Removida toda lógica de validação de CAPTCHA
   - Login direto via `authStore.signIn()`
   - Tratamento de erro melhorado

### Frontend - RegisterModal.vue
1. **Registro simplificado:**
   - Removida toda lógica de validação de CAPTCHA
   - Registro direto via `authStore.signUp()`

## 🧪 Como Testar

### 1. Iniciar Backend
```bash
cd backend
python main.py
```

### 2. Iniciar Frontend
```bash
cd frontend
pnpm dev
```

### 3. Testar Login
1. Acesse http://localhost:5173/login
2. **Observe:** Não há campo de CAPTCHA visível
3. Digite credenciais:
   - **Admin:** `admin@datasniffer.ai` / `DataSniffer2025!Admin`
   - **User1:** `user1@test.com` / `test123`
4. Clique em "Entrar"
5. Deve fazer login sem pedir CAPTCHA

### 4. Testar Registro
1. Na tela de login, clique em "Criar conta"
2. Preencha email e senha
3. Clique em "Cadastrar"
4. Deve criar conta sem pedir CAPTCHA

## 🔒 Comportamento em Produção

Quando o app estiver em produção (não localhost):
- ✅ CAPTCHA será exibido normalmente
- ✅ Validação do Turnstile será executada
- ✅ Script do Cloudflare será carregado

## 📝 Detecção de Localhost

O código detecta localhost verificando:
```javascript
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1'
```

Isso funciona para:
- `http://localhost:5173`
- `http://127.0.0.1:5173`

## ✅ Status

**CAPTCHA desabilitado em localhost!** 🎉

Agora você pode fazer login e cadastro sem precisar resolver o CAPTCHA durante o desenvolvimento.
