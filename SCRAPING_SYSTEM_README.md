# 🎯 Sistema de Scraping Facebook Ads Library

## ✅ **Sistema Implementado**

Solução completa de **scraping pontual** da Facebook Ads Library usando **Playwright**, sem dependência da API oficial da Meta.

### 🏗️ **Arquitetura**

```
📁 backend/
├── services/FacebookAdsLibraryScraper.js  # Core do scraping
├── controllers/ScrapingController.js      # Lógica de negócio
├── routes/scraping.js                     # Endpoints REST
└── scripts/setup-scraping-system.js      # Configuração inicial
```

### 🗄️ **Banco de Dados**

```sql
scraped_ads              # Anúncios coletados
├── id, facebook_id      # Identificadores únicos
├── ad_text, headline    # Conteúdo do anúncio
├── page_name           # Nome da página
├── media_urls (JSON)   # Imagens/vídeos
├── snapshot_url        # Link para o anúncio original
├── search_term         # Termo usado na busca
└── scraped_at          # Timestamp da coleta

scraping_stats          # Estatísticas de coleta
scraping_logs          # Histórico de execuções
```

## 🚀 **Como Usar**

### **1. Configuração Inicial**

```bash
# 1. Instalar dependências
npm install playwright

# 2. Instalar browsers
npx playwright install chromium

# 3. Configurar banco de dados
node scripts/setup-scraping-system.js

# 4. Iniciar servidor
npm start
```

### **2. Executar Scraping**

#### **Coleta Simples (1 termo)**
```bash
POST http://localhost:3001/api/scraping/run
Content-Type: application/json

{
  "search_term": "emagrecimento",
  "max_ads": 100
}
```

#### **Coleta em Lote (múltiplos termos)**
```bash
POST http://localhost:3001/api/scraping/batch
Content-Type: application/json

{
  "search_terms": ["emagrecimento", "dieta", "fitness"],
  "max_ads_per_term": 50
}
```

#### **Execução Rápida (termos pré-definidos)**
```bash
POST http://localhost:3001/api/scraping/quick-run
```

### **3. Consultar Dados Coletados**

#### **Listar Anúncios**
```bash
GET http://localhost:3001/api/scraping/ads?page=1&limit=20
GET http://localhost:3001/api/scraping/ads?search_term=emagrecimento
GET http://localhost:3001/api/scraping/ads?page_name=Emagreça Já
```

#### **Detalhes de um Anúncio**
```bash
GET http://localhost:3001/api/scraping/ads/{id}
```

#### **Estatísticas**
```bash
GET http://localhost:3001/api/scraping/stats
```

## 📊 **Estrutura de Dados Coletados**

```json
{
  "id": "uuid",
  "facebook_id": "123456789",
  "ad_text": "Descubra o segredo para emagrecer 10kg em 30 dias...",
  "headline": "Método Revolucionário de Emagrecimento",
  "page_name": "Emagreça Já Oficial",
  "media_urls": [
    "https://scontent.xx.fbcdn.net/v/image1.jpg",
    "https://scontent.xx.fbcdn.net/v/video1.mp4"
  ],
  "call_to_action": "Saiba Mais",
  "start_date": "2025-01-15",
  "snapshot_url": "https://www.facebook.com/ads/library/?id=123456789",
  "search_term": "emagrecimento",
  "scraped_at": "2025-01-20T10:30:00Z"
}
```

## 🎯 **Funcionalidades Principais**

### ✅ **Scraping Inteligente**
- **Anti-detecção**: User agents, delays, configurações realísticas
- **Scroll automático**: Coleta até 100+ anúncios por termo
- **Extração robusta**: Textos, imagens, vídeos, metadados
- **Tratamento de erros**: Captcha detection, timeouts

### ✅ **Upsert Inteligente**
- **Sem duplicatas**: Baseado no `facebook_id`
- **Atualização**: Dados novos sobrescrevem antigos
- **Histórico**: Mantém timestamp de primeira coleta

### ✅ **API Completa**
- **Filtros avançados**: Por termo, página, mídia
- **Paginação**: Performance otimizada
- **Busca**: Texto livre em títulos e descrições
- **Exportação**: JSON para backup/análise

### ✅ **Monitoramento**
- **Logs detalhados**: Sucesso, falhas, durações
- **Estatísticas**: Por termo, página, período
- **Limpeza**: Remove dados antigos automaticamente

## 🛠️ **Configurações Avançadas**

### **Personalizar Seletores**
Se o Facebook mudar o layout, edite em `FacebookAdsLibraryScraper.js`:

```javascript
// Seletores principais
const adCards = await this.page.$$('[data-testid="search_result_item"]');
const textElement = await cardElement.$('[data-testid="ad_creative_body"]');
const headlineElement = await cardElement.$('[data-testid="ad_creative_title"]');
```

### **Ajustar Delays**
```javascript
// Delay entre scrolls
await this.page.waitForTimeout(2000);

// Delay entre termos (batch)
await new Promise(resolve => setTimeout(resolve, 5000));
```

### **Configurar Browser**
```javascript
this.browser = await chromium.launch({
  headless: false,  // true = invisível, false = visível
  slowMo: 100,      // Delay entre ações (ms)
});
```

## 📈 **Endpoints da API**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/scraping/run` | Coleta um termo específico |
| POST | `/api/scraping/batch` | Coleta múltiplos termos |
| POST | `/api/scraping/quick-run` | Execução rápida (emagrecimento) |
| GET | `/api/scraping/ads` | Lista anúncios com filtros |
| GET | `/api/scraping/ads/:id` | Detalhes de um anúncio |
| GET | `/api/scraping/stats` | Estatísticas gerais |
| GET | `/api/scraping/search-terms` | Termos utilizados |
| GET | `/api/scraping/pages` | Páginas mais frequentes |
| GET | `/api/scraping/export` | Exportar dados (JSON/CSV) |
| POST | `/api/scraping/cleanup` | Limpar dados antigos |

## 🔧 **Manutenção**

### **Monitoramento**
```bash
# Ver logs em tempo real
tail -f logs/scraping.log

# Verificar estatísticas
curl http://localhost:3001/api/scraping/stats
```

### **Limpeza Periódica**
```bash
# Remove anúncios com mais de 30 dias
POST /api/scraping/cleanup
{"days_old": 30}
```

### **Backup**
```bash
# Exportar todos os dados
GET /api/scraping/export > backup_$(date +%Y%m%d).json
```

## 🎯 **Vantagens desta Solução**

✅ **Sem burocracia** - Não precisa de aprovação da Meta  
✅ **Dados reais** - Direto da fonte pública  
✅ **Controle total** - Você decide quando e como coletar  
✅ **Escalável** - Pode coletar milhares de anúncios  
✅ **Manutenção baixa** - Estrutura robusta e simples  
✅ **Custo zero** - Apenas seu servidor e tempo de processamento  

## 🚨 **Considerações Importantes**

- **Use com moderação**: Não abuse da frequência
- **Respeite os delays**: Evita bloqueios temporários  
- **Monitore logs**: Detecte problemas rapidamente
- **Backup regular**: Seus dados são valiosos
- **Headless mode**: Use `true` em produção

## 🎉 **Sistema Pronto!**

Você agora tem um **minerador profissional** de anúncios do Facebook que:
- Coleta dados reais sem APIs burocráticas
- Armazena tudo no seu banco de dados
- Oferece API completa para seu frontend
- Funciona de forma pontual e confiável

**Execute o primeiro scraping e veja a magia acontecer!** 🚀
