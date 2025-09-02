# Portal de Colecionáveis Marvel 🚀

Um portal moderno e interativo para colecionadores de bonecos e figuras Marvel, construído com **Next.js 14**, **React 18**, **TypeScript** e **Tailwind CSS**.

## ✨ Características

- 🎨 **Interface Moderna**: Design responsivo com tema escuro e animações suaves
- 🔐 **Autenticação Segura**: Sistema de login/registro com validação
- 📱 **Totalmente Responsivo**: Funciona perfeitamente em todos os dispositivos
- 🖼️ **Galeria Interativa**: Visualize e filtre colecionáveis
- 💬 **Sistema de Chat**: Negocie diretamente com outros colecionadores
- 📊 **Dashboard Pessoal**: Gerencie sua coleção com estatísticas
- 🎯 **Busca Avançada**: Filtros por condição, negociação, ano e fonte
- 🚀 **Performance Otimizada**: Next.js App Router e otimizações de imagem

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React com App Router
- **React 18** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **Framer Motion** - Animações e transições
- **Lucide React** - Ícones modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de esquemas

### Backend (Preparado para)
- **Next.js API Routes** - Endpoints da API
- **MongoDB** - Banco de dados
- **NextAuth.js** - Autenticação
- **bcryptjs** - Hash de senhas
- **JWT** - Tokens de autenticação

## 🚀 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/portal-colecionaveis.git
cd portal-colecionaveis
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Banco de dados
MONGODB_URI=sua_uri_mongodb

# NextAuth
NEXTAUTH_SECRET=seu_secret_muito_seguro
NEXTAUTH_URL=http://localhost:3000

# Outras configurações
NODE_ENV=development
```

### 4. Execute o projeto
```bash
npm run dev
# ou
yarn dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
portal-colecionaveis/
├── app/                    # App Router do Next.js
│   ├── dashboard/         # Dashboard do usuário
│   ├── gallery/           # Galeria pública
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── chat/             # Componentes de chat
│   ├── collectibles/     # Componentes de colecionáveis
│   ├── layout/           # Componentes de layout
│   ├── search/           # Componentes de busca
│   └── ui/               # Componentes de interface
├── types/                 # Definições TypeScript
├── lib/                   # Utilitários e configurações
├── public/                # Arquivos estáticos
└── package.json           # Dependências e scripts
```

## 🎯 Funcionalidades Principais

### 🔐 Autenticação
- **Registro**: Criação de conta com validação completa
- **Login**: Autenticação segura com sessões
- **Perfil**: Gerenciamento de informações pessoais

### 🖼️ Galeria
- **Visualização**: Grid responsivo de colecionáveis
- **Filtros**: Por condição, negociação, ano e fonte
- **Detalhes**: Modal com informações completas
- **Paginação**: Navegação por páginas

### 💬 Chat
- **Negociações**: Chat direto entre usuários
- **Histórico**: Mensagens persistentes
- **Notificações**: Sistema de alertas

### 📊 Dashboard
- **Estatísticas**: Resumo da coleção
- **Gerenciamento**: Adicionar, editar e remover itens
- **Upload**: Múltiplas imagens por item

## 🎨 Design System

### Cores
- **Primária**: `#ffcc00` (Amarelo Marvel)
- **Escuro**: `#1a1a2e` (Fundo principal)
- **Acentos**: Tons de azul e verde para feedback

### Tipografia
- **Inter**: Fonte principal para interface
- **Poppins**: Fonte para títulos e destaque

### Componentes
- **Cards**: Design consistente para itens
- **Botões**: Estados hover e loading
- **Formulários**: Validação visual e feedback

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Linting
npm run lint         # Executa ESLint
```

## 📱 Responsividade

O projeto é totalmente responsivo com breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deploy

### Vercel (Recomendado)
1. Conecte seu repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Outras Plataformas
- **Netlify**: Compatível com Next.js
- **Railway**: Deploy full-stack
- **AWS**: Amplify ou EC2

## 🔒 Segurança

- **Validação**: Esquemas Zod para entrada de dados
- **Autenticação**: NextAuth.js com JWT
- **Senhas**: Hash bcrypt para armazenamento
- **CORS**: Configuração segura para APIs

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- **Marvel**: Inspiração para o tema
- **Next.js Team**: Framework incrível
- **Tailwind CSS**: Sistema de design
- **Framer Motion**: Animações suaves

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/portal-colecionaveis/issues)
- **Email**: seu-email@exemplo.com
- **Discord**: [Servidor da Comunidade](https://discord.gg/seu-servidor)

---

**Desenvolvido com ❤️ para a comunidade de colecionadores Marvel**

⭐ **Se este projeto te ajudou, considere dar uma estrela!**
