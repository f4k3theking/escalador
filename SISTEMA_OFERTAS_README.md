# 🚀 Sistema de Mineração de Ofertas - Escalador

## ✅ O que foi implementado

### 🔧 Backend Completo
- **Meta Ad Library API Integration**: Serviço completo usando suas credenciais (App ID: 23930007850034120)
- **Banco de Dados**: Estrutura otimizada para ofertas com MySQL
- **Classificação Automática**: Sistema de detecção de nichos por palavras-chave
- **Agrupamento Inteligente**: Ofertas agrupadas por assinatura única
- **Detecção de Escala**: Identifica ofertas com 10+ anúncios ativos
- **Flags Automáticas**: Detecta promoções e VSLs
- **API REST Completa**: Endpoints para frontend consumir

### 🎨 Frontend Atualizado
- **Dashboard Modernizado**: Consome dados reais do sistema de ofertas
- **Botão de Mineração**: Interface para iniciar scraping
- **Estatísticas Dinâmicas**: Dados atualizados em tempo real

## 🗄️ Estrutura do Banco

```sql
offers               # Ofertas processadas e agrupadas
├── id, niche, offer_signature
├── is_scaled, active_ads_count
├── page_name, page_id, snapshot_url
├── ad_text_summary, status
├── flags (JSON): is_promotion, has_vsl
└── timestamps

ads_raw              # Dados brutos da Meta API
scraping_logs        # Histórico de mineração
user_saved_offers    # Favoritos dos usuários
system_config        # Configurações do sistema
```

## 🚀 Como Testar

### 1. Iniciar o Servidor Backend
```bash
cd backend
npm start
```

### 2. Testar Endpoints Principais

**Health Check:**
```bash
GET http://localhost:3001/api/health
```

**Testar Meta API:**
```bash
POST http://localhost:3001/api/offers/test-api
```

**Minerar Ofertas:**
```bash
POST http://localhost:3001/api/offers/scrape
Content-Type: application/json
{
  "search_terms": ["emagrecimento", "dieta", "fitness"]
}
```

**Ver Ofertas:**
```bash
GET http://localhost:3001/api/offers?is_scaled=true&limit=10
```

**Estatísticas:**
```bash
GET http://localhost:3001/api/offers/stats
```

### 3. Iniciar Frontend
```bash
npm start
```

## 📊 Funcionalidades Principais

### 🔍 Mineração Automática
- Busca na Meta Ad Library API usando termos estratégicos
- Processa e classifica automaticamente por nicho
- Detecta ofertas escaladas (10+ anúncios ativos)
- Identifica promoções e VSLs automaticamente

### 🎯 Classificação de Nichos
- **Emagrecimento**: emagrec, peso, dieta, magra, barriga
- **Saúde Masculina**: testosterona, masculin, homem, próstata
- **Estética**: estética, beleza, pele, cabelo, rugas
- **Pets**: pet, cachorro, gato, animal, ração
- **Finanças**: dinheiro, investir, renda, lucro, ganhar
- **E mais...**

### 🏷️ Flags Automáticas
- **is_promotion**: Detecta "frete grátis", "cupom", "desconto", "50% off"
- **has_vsl**: Identifica vídeos e VSLs por palavras-chave

### 📈 Dashboard Inteligente
- Estatísticas em tempo real
- Filtros avançados por nicho, escala, promoção
- Botão de mineração integrado
- Interface responsiva e moderna

## 🔧 Configurações

### Meta API Credentials (já configuradas)
```json
{
  "app_id": "23930007850034120",
  "app_secret": "6c8e38c9ce32a864ad9902825759a8d4"
}
```

### Termos de Busca Padrão
```json
[
  "emagrecimento", "dieta", "fitness", "suplementos", 
  "academia", "saúde masculina", "estética", "beleza",
  "pets", "finanças"
]
```

## 🎯 Estrutura JSON de Saída

```json
[
  {
    "niche": "emagrecimento",
    "offer_signature": "emagrecer_agora_com_frete_gratis_IDpaginaXYZ",
    "is_scaled": true,
    "active_ads_count": 12,
    "page_name": "Nome da Página",
    "page_id": "1234567890",
    "snapshot_url": "https://www.facebook.com/ads/library/?id=...",
    "ad_text_summary": "Perca peso rápido com frete grátis neste final de semana",
    "status": "active",
    "start_date": "2025-08-15T12:34:56Z",
    "end_date": null,
    "flags": {
       "is_promotion": true,
       "has_vsl": true
    }
  }
]
```

## 🎮 Próximos Passos

1. **Inicie o servidor backend** (`npm start` na pasta backend)
2. **Teste a API** com os endpoints acima
3. **Execute uma mineração** usando o botão no dashboard
4. **Explore as ofertas** encontradas na interface
5. **Ajuste termos de busca** conforme necessário

## 🔥 Recursos Avançados

- **Paginação**: Todas as listagens com paginação
- **Filtros Avançados**: Por nicho, escala, promoção, VSL
- **Busca**: Por nome da página ou texto do anúncio  
- **Favoritos**: Sistema de salvamento de ofertas
- **Logs**: Histórico completo de minerações
- **Performance**: Queries otimizadas com índices

## 🎯 Objetivo Alcançado

✅ **Minerador de ofertas funcional**
✅ **Acesso a ofertas escaladas** 
✅ **Espionagem de criativos via snapshot_url**
✅ **Detecção automática de VSLs**
✅ **Interface completa no frontend**
✅ **Dados persistidos no banco**
✅ **API REST completa**

Seu sistema está pronto para minerar ofertas escaladas do Facebook usando a Meta Ad Library API oficial! 🎉
