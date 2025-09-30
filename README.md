# 🚀 Escalador - SaaS de Análise e Escalonamento de Anúncios

**Levando suas campanhas ao topo, sem volta.**

## 📋 Sobre o Projeto

O Escalador é uma plataforma SaaS completa para análise, organização e escalonamento de anúncios digitais. Com interface moderna e intuitiva, permite que profissionais de marketing digital identifiquem e escalem campanhas de alto desempenho.

## ✨ Principais Funcionalidades

### 🎯 Dashboard Inteligente
- Cards de campanhas em estilo Pinterest
- Métricas em tempo real (CTR, cliques, ROI)
- Indicadores visuais de escalonamento
- Filtros avançados por nicho, idioma, plataforma

### 📊 Biblioteca de Criativos
- Galeria organizada por campanha
- Preview direto de vídeos e imagens
- Métricas individuais de performance
- Sistema de favoritos e tags

### 💾 Sistema de Salvos
- Organização por tags personalizadas
- Coleções de campanhas favoritas
- Busca e filtros inteligentes

### 🔄 Clonador Avançado
- **Clonador de Páginas**: Captura completa de landing pages (HTML, CSS, JS, imagens)
- **Clonador de Criativos**: Download de vídeos e imagens de anúncios
- Suporte para Facebook, Instagram, TikTok, Google
- Histórico de clonagens com downloads

### ⚙️ Configurações Completas
- Perfil do usuário
- Preferências de notificação
- Configurações de privacidade
- Gerenciamento de dados

### 🆘 Suporte Integrado
- Base de conhecimento (FAQ)
- Tutoriais em vídeo
- Chat ao vivo
- Múltiplos canais de contato

## 🎨 Design System

### Identidade Visual
- **Nome**: Escalador 🚀
- **Slogan**: "Levando suas campanhas ao topo, sem volta."
- **Tema**: Dark mode por padrão
- **Tipografia**: Inter (principal) e Poppins (títulos)

### Paleta de Cores
- **Preto**: `#0a0a0a` (fundo principal)
- **Cinza Escuro**: `#1a1a1a` (sidebar)
- **Cinza Claro**: `#2a2a2a` (cards)
- **Azul Neon**: `#00d4ff` (primário)
- **Verde**: `#00ff88` (sucesso/escala)
- **Amarelo**: `#ffd700` (destaque)

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** + TypeScript
- **TailwindCSS** para estilização
- **Lucide React** para ícones
- **React Router** para navegação
- **ShadCN UI** components

### Backend (Planejado)
- **Node.js** + Express/NestJS
- **PostgreSQL** (banco principal)
- **JWT** + OAuth (Google, Facebook)
- **Puppeteer/Playwright** (scraping)

### Deploy (Sugerido)
- **Frontend**: Vercel
- **Backend**: Railway/AWS
- **Banco**: PostgreSQL (Supabase/Neon)

## 🚀 Como Executar

### Pré-requisitos
- Node.js 16+ 
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd escalador
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
```

3. **Execute o projeto**
```bash
npm start
# ou
yarn start
```

4. **Acesse a aplicação**
```
http://localhost:3000
```

### Comandos Disponíveis

```bash
# Desenvolvimento
npm start

# Build para produção
npm run build

# Testes
npm test

# Ejetar configurações (não recomendado)
npm run eject
```

## 📱 Funcionalidades Implementadas

### ✅ Concluído
- [x] Estrutura base do projeto (React + TypeScript + TailwindCSS)
- [x] Sistema de roteamento
- [x] Layout responsivo com sidebar fixa
- [x] Dashboard com cards de campanhas
- [x] Sistema de filtros avançados
- [x] Página de criativos com galeria
- [x] Sistema de salvos com tags personalizadas
- [x] Clonador de páginas e criativos
- [x] Configurações completas
- [x] Central de suporte com FAQ
- [x] Dark theme aplicado
- [x] Componentes interativos
- [x] Animações e transições

### 🔄 Em Desenvolvimento
- [ ] Integração com APIs reais
- [ ] Sistema de autenticação
- [ ] Backend completo
- [ ] Banco de dados
- [ ] Sistema de scraping
- [ ] Integração com saveweb2zip

### 🎯 Próximos Passos
- [ ] Testes unitários
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Analytics integrado
- [ ] API para integrações

## 📂 Estrutura do Projeto

```
escalador/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── Campaign/
│   │   │   └── CampaignCard.tsx
│   │   └── Dashboard/
│   │       ├── FilterBar.tsx
│   │       └── StatsOverview.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Criativos.tsx
│   │   ├── Salvos.tsx
│   │   ├── Clonador.tsx
│   │   ├── Configuracoes.tsx
│   │   └── Suporte.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Contato

- **Website**: [escalador.com](https://escalador.com)
- **Email**: contato@escalador.com
- **WhatsApp**: +55 11 99999-9999

---

**Escalador** - Levando suas campanhas ao topo, sem volta. 🚀
