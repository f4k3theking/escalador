// Configuração automática de API baseada no ambiente
const getApiBaseUrl = (): string => {
  // Se estiver rodando localmente (desenvolvimento)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  
  // Em produção, usar o backend no Netlify
  return 'https://escalador-backend.netlify.app';
};

export const API_BASE_URL = getApiBaseUrl();

// Helper para fazer requisições
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};

// APIs específicas para ofertas
export const offersApi = {
  // Scraping
  scrapeOffers: (searchTerms?: string[]) => 
    apiRequest('/api/offers/scrape', {
      method: 'POST',
      body: JSON.stringify({ search_terms: searchTerms })
    }),

  // Listagem e filtros
  getOffers: (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return apiRequest(`/api/offers?${params.toString()}`);
  },

  // Estatísticas
  getStats: () => apiRequest('/api/offers/stats'),

  // Detalhes de oferta
  getOfferDetails: (id: string) => apiRequest(`/api/offers/${id}`),

  // Salvos
  toggleSaved: (offerId: string) => 
    apiRequest('/api/offers/save', {
      method: 'POST',
      body: JSON.stringify({ offer_id: offerId })
    }),

  getSavedOffers: (page: number = 1, limit: number = 20) => 
    apiRequest(`/api/offers/saved/list?page=${page}&limit=${limit}`),

  // Nichos
  getNiches: () => apiRequest('/api/offers/niches/list'),

  // Logs
  getScrapingLogs: (page: number = 1, limit: number = 10) => 
    apiRequest(`/api/offers/logs/scraping?page=${page}&limit=${limit}`),

  // Teste da API
  testMetaApi: () => apiRequest('/api/offers/test-api', { method: 'POST' })
};

// APIs específicas para scraping
export const scrapingApi = {
  // Buscar ofertas coletadas
  getScrapedAds: (filters: any = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
    return apiRequest(`/api/scraping/ads?${params.toString()}`);
  },

  // Estatísticas do scraping
  getScrapingStats: () => apiRequest('/api/scraping/stats'),

  // Páginas mais escaladas
  getTopPages: (limit: number = 20) => apiRequest(`/api/scraping/pages?limit=${limit}`),

  // Executar novo scraping
  runScaling: () => apiRequest('/api/scraping/scaled-offers'),

  // Detalhes de uma oferta
  getAdDetails: (id: string) => apiRequest(`/api/scraping/ads/${id}`)
};

export default {
  API_BASE_URL,
  apiRequest,
  offersApi,
};
