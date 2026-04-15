# 🪓 Vikings Barbearia — Sistema Completo

Sistema web completo para barbearia/salão com agendamento online, controle financeiro e painel administrativo. Tema **Vikings** com design premium.

---

## 📁 Estrutura do Projeto

```
Salao/
├── backend/              # API Node.js + Express
│   ├── src/
│   │   ├── config/       # Firebase Admin SDK
│   │   ├── middleware/   # Auth (JWT)
│   │   ├── routes/       # Rotas da API
│   │   └── utils/        # Seed do banco
│   ├── .env.example
│   └── package.json
│
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/   # Navbar, Footer, Layouts
│   │   ├── context/      # AuthContext
│   │   ├── pages/        # Páginas públicas, cliente e admin
│   │   └── utils/        # API client, formatters
│   ├── tailwind.config.js
│   └── package.json
│
└── documentacao/         # Docs adicionais
```

---

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- Conta no [Firebase](https://firebase.google.com)
- npm ou yarn

---

### 1. Configurar Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um novo projeto
3. Ative o **Firestore Database** (modo de produção)
4. Vá em **Configurações do Projeto → Contas de Serviço**
5. Clique em **Gerar nova chave privada** → salve o JSON
6. Ative o **Storage** (para upload de imagens, opcional)

---

### 2. Configurar Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:

```env
PORT=5000
NODE_ENV=development

JWT_SECRET=minha_chave_super_secreta_minimo_32_caracteres

# Firebase (pegar do JSON gerado)
FIREBASE_PROJECT_ID=seu-projeto
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@seu-projeto.iam.gserviceaccount.com

FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com

ADMIN_EMAIL=admin@vikingssalao.com
ADMIN_PASSWORD=Admin@123456

FRONTEND_URL=http://localhost:5173
```

```bash
# Criar dados iniciais (admin + serviços)
node src/utils/seedAdmin.js

# Iniciar em desenvolvimento
npm run dev
```

O backend estará disponível em: `http://localhost:5000`

---

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

---

### 4. Acessar o Sistema

| Área | URL | Credenciais padrão |
|------|-----|--------------------|
| Site público | `http://localhost:5173` | — |
| Login cliente | `http://localhost:5173/login` | (criar conta) |
| Login admin | `http://localhost:5173/admin/login` | admin@vikingssalao.com / Admin@123456 |

---

## 🔧 Scripts Disponíveis

### Backend
```bash
npm run dev      # Desenvolvimento com nodemon
npm start        # Produção
```

### Frontend
```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build para produção
npm run preview  # Preview do build
```

---

## 📱 Funcionalidades

### Site Público
- ✅ Home com vídeo de fundo (hero section)
- ✅ Página Sobre com equipe
- ✅ Catálogo de serviços com filtros
- ✅ Galeria com lightbox
- ✅ Página de parceiros
- ✅ Banners/promoções dinâmicos

### Área do Cliente
- ✅ Cadastro e login
- ✅ Agendamento online em 4 passos
- ✅ Visualizar e cancelar agendamentos
- ✅ Editar perfil e serviço favorito
- ✅ Alterar senha

### Painel Admin
- ✅ Dashboard com métricas e gráficos
- ✅ Gerenciar agendamentos (confirmar, concluir, cancelar)
- ✅ Agendamentos manuais
- ✅ Bloquear dias/horários
- ✅ CRUD de serviços (com imagem)
- ✅ Galeria de fotos
- ✅ Banners/promoções
- ✅ Controle financeiro (receitas e despesas)
- ✅ Gráficos financeiros (6 meses)
- ✅ Gerenciar usuários
- ✅ Gerenciar parceiros
- ✅ Configurações (horários, dados do salão)

---

## 🛡️ Segurança

- JWT com expiração configurável
- Bcrypt para hashing de senhas
- Rate limiting (100 req/15min geral, 10 req/15min em login)
- Helmet.js para headers HTTP seguros
- Validação de inputs com express-validator
- Proteção de rotas por role (client/admin)

---

## 🎨 Design System

**Tema Vikings:**
- Preto: `#0A0A0A`
- Dourado: `#C9A84C`
- Vermelho Viking: `#8B0000`
- Tipografia: Cinzel (títulos) + Inter (corpo)

---

## 🏗️ Deploy

### Backend (Railway / Render / Heroku)
```bash
cd backend
npm start
```
Configure as variáveis de ambiente na plataforma.

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Faça upload da pasta dist/
```

Configure a variável `VITE_API_URL` se necessário.

---

## 🤝 Suporte

Para dúvidas ou melhorias, abra uma issue no repositório.

---

**Desenvolvido com ❤️ para Vikings Barbearia**
