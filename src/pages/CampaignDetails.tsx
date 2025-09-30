import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, Play, Eye, Calendar, TrendingUp, Heart, Share2 } from 'lucide-react';
import { scrapingApi } from '../config/api';

interface Creative {
  id: string;
  ad_text: string;
  headline: string;
  image_urls: string[];
  video_url?: string;
  landing_page_url?: string;
  platforms: string[];
  start_date: string;
  is_active: boolean;
  scraped_at: string;
}

interface Campaign {
  id: string;
  title: string;
  niche: string;
  language: string;
  countries: string[];
  platforms: string[];
  ad_format: string;
  funnel_type: string;
  total_creatives: number;
  total_clicks: number;
  estimated_spend: number;
  is_scaling: boolean;
  first_seen: string;
  last_seen: string;
  advertiser_name: string;
  creatives: Creative[];
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);

  useEffect(() => {
    const fetchCampaignDetails = async () => {
      try {
        setLoading(true);
        console.log('🔍 Buscando detalhes para ID:', id);
        
        // Use the scraping API to get ad details
        const response = await scrapingApi.getAdDetails(id || '');
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data) {
            const ad = data.data;
            
            // Parse media URLs
            let mediaUrls = [];
            try {
              mediaUrls = typeof ad.media_urls === 'string' ? JSON.parse(ad.media_urls) : (ad.media_urls || []);
            } catch (e) {
              mediaUrls = [];
            }

            // Transform scraped ad to campaign format
            const campaignData: Campaign = {
              id: ad.id,
              title: ad.page_name || ad.headline || 'Oferta sem título',
              niche: ad.search_term || 'Geral',
              language: 'PT_BR',
              countries: ['BR'],
              platforms: ['Facebook'],
              ad_format: mediaUrls.some((url: string) => url.includes('.mp4')) ? 'Video' : 'Image',
              funnel_type: 'Website',
              total_creatives: mediaUrls.length || 1,
              total_clicks: 0,
              estimated_spend: 0,
              is_scaling: true,
              first_seen: ad.created_at,
              last_seen: ad.updated_at,
              advertiser_name: ad.page_name || 'Anunciante',
              creatives: [{
                id: ad.facebook_id || ad.id,
                ad_text: ad.ad_text || '',
                headline: ad.headline || '',
                image_urls: mediaUrls.filter((url: string) => url.includes('.jpg') || url.includes('.png')),
                video_url: mediaUrls.find((url: string) => url.includes('.mp4')),
                landing_page_url: ad.snapshot_url,
                platforms: ['Facebook'],
                start_date: ad.start_date || ad.created_at,
                is_active: true,
                scraped_at: ad.scraped_at
              }]
            };
            
            setCampaign(campaignData);
            setSelectedCreative(campaignData.creatives[0]);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao buscar detalhes da campanha:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCampaignDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-escalador-dark flex items-center justify-center">
        <div className="text-escalador-neon-blue text-lg">🔄 Carregando detalhes da campanha...</div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-escalador-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">❌ Campanha não encontrada</div>
          <button
            onClick={() => navigate('/')}
            className="bg-escalador-neon-blue text-white px-6 py-2 rounded-lg hover:bg-opacity-80"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-escalador-dark text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-escalador-neon-blue hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Dashboard</span>
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-escalador-yellow font-semibold">{campaign.title}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-escalador-green text-white px-4 py-2 rounded-lg hover:bg-opacity-80">
            <Heart size={16} />
            <span>Salvar</span>
          </button>
          <button className="flex items-center space-x-2 bg-escalador-neon-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80">
            <Share2 size={16} />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* Campaign Header */}
      <div className="bg-escalador-card rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-escalador-yellow mb-2">{campaign.title}</h1>
            <p className="text-gray-300 mb-4">Anunciante: {campaign.advertiser_name}</p>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-escalador-neon-blue rounded-full"></div>
                <span>Rede: FACEBOOK</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-escalador-green rounded-full"></div>
                <span>Estrutura: {campaign.ad_format || 'VSL'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-escalador-yellow rounded-full"></div>
                <span>Idioma: {campaign.language === 'pt-BR' ? 'PT_BR' : 'EN_US'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Tipo: Low Ticket</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>Nicho: {campaign.niche}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-escalador-neon-blue rounded-full"></div>
                <span>Funil: {campaign.funnel_type || 'VSL'}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            {campaign.is_scaling && (
              <div className="bg-escalador-green text-white px-3 py-1 rounded-full text-sm mb-2">
                #Escalando
              </div>
            )}
            <div className="text-gray-400 text-sm">
              Primeira vista: {new Date(campaign.first_seen).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creatives List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-bold mb-4">Criativos ({campaign.creatives?.length || 0})</h2>
          
          <div className="space-y-4">
            {campaign.creatives?.map((creative, index) => (
              <div
                key={creative.id}
                onClick={() => setSelectedCreative(creative)}
                className={`bg-escalador-card rounded-lg p-4 cursor-pointer transition-all ${
                  selectedCreative?.id === creative.id 
                    ? 'border-2 border-escalador-neon-blue' 
                    : 'border border-gray-600 hover:border-escalador-yellow'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {creative.image_urls && creative.image_urls.length > 0 ? (
                    <img
                      src={creative.image_urls[0]}
                      alt={`Creative ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/64/64';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                      <Play size={20} className="text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">Criativo {index + 1}</h3>
                    <p className="text-gray-400 text-xs line-clamp-2">
                      {creative.headline || creative.ad_text.substring(0, 60) + '...'}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="bg-escalador-neon-blue text-white px-2 py-1 rounded text-xs">
                        Facebook
                      </span>
                      {creative.video_url && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                          Vídeo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Creative Viewer */}
        <div className="lg:col-span-2">
          {selectedCreative ? (
            <div className="space-y-6">
              {/* Creative Media */}
              <div className="bg-escalador-card rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Visualizar Criativo</h2>
                  <div className="flex items-center space-x-2">
                    <button className="bg-escalador-yellow text-black px-4 py-2 rounded-lg hover:bg-opacity-80 flex items-center space-x-2">
                      <Download size={16} />
                      <span>Baixar</span>
                    </button>
                    {selectedCreative.landing_page_url && (
                      <button 
                        onClick={() => window.open(selectedCreative.landing_page_url, '_blank')}
                        className="bg-escalador-neon-blue text-white px-4 py-2 rounded-lg hover:bg-opacity-80 flex items-center space-x-2"
                      >
                        <ExternalLink size={16} />
                        <span>Ver Landing</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Media Display */}
                <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                  {selectedCreative.video_url ? (
                    <video
                      controls
                      className="w-full h-full object-contain"
                      poster={selectedCreative.image_urls?.[0]}
                    >
                      <source src={selectedCreative.video_url} type="video/mp4" />
                      Seu navegador não suporta vídeo.
                    </video>
                  ) : selectedCreative.image_urls && selectedCreative.image_urls.length > 0 ? (
                    <img
                      src={selectedCreative.image_urls[0]}
                      alt="Creative"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/api/placeholder/800/450';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <Play size={48} className="mx-auto mb-2" />
                      <p>Nenhuma mídia disponível</p>
                    </div>
                  )}
                </div>

                {/* Creative Text */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Headline:</h3>
                    <p className="text-gray-300 bg-gray-800 p-3 rounded-lg">
                      {selectedCreative.headline || 'Sem headline disponível'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Texto do Anúncio:</h3>
                    <p className="text-gray-300 bg-gray-800 p-3 rounded-lg whitespace-pre-wrap">
                      {selectedCreative.ad_text}
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics & Info */}
              <div className="bg-escalador-card rounded-xl p-6">
                <h2 className="text-xl font-bold mb-4">Informações</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-escalador-neon-blue mb-1">
                      {campaign.total_clicks || 0}
                    </div>
                    <div className="text-sm text-gray-400">Total de Cliques</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-escalador-green mb-1">
                      {campaign.total_creatives || 0}
                    </div>
                    <div className="text-sm text-gray-400">Total de Criativos</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-escalador-yellow mb-1">
                      R$ {(campaign.estimated_spend || 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-400">Investimento Est.</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500 mb-1">
                      {Math.ceil((new Date().getTime() - new Date(campaign.first_seen).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="text-sm text-gray-400">Dias Rodando</div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-600">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Plataformas:</span>
                      <span className="ml-2 text-white">{selectedCreative.platforms.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Data de Início:</span>
                      <span className="ml-2 text-white">
                        {new Date(selectedCreative.start_date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <span className={`ml-2 ${selectedCreative.is_active ? 'text-escalador-green' : 'text-red-500'}`}>
                        {selectedCreative.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Última Atualização:</span>
                      <span className="ml-2 text-white">
                        {new Date(selectedCreative.scraped_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-escalador-card rounded-xl p-6 flex items-center justify-center h-96">
              <div className="text-center text-gray-400">
                <Eye size={48} className="mx-auto mb-4" />
                <p>Selecione um criativo para visualizar</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
