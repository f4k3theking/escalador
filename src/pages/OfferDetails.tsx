import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Creative {
  type: 'video' | 'image';
  library_id: string;
  source: string;
  urls: {
    video_url?: string;
    thumbnail_url?: string;
    image_url?: string;
  };
  dimensions?: string;
  duration?: string;
}

interface Ad {
  id: string;
  library_id: string;
  ad_text: string;
  ad_description: string;
  landing_page: string;
  page_image_link: string;
  start_at: string;
  detailed_creatives: Creative[];
}

interface OfferDetail {
  id: string;
  niche: string;
  page_name: string;
  page_id: string;
  is_scaled: boolean;
  active_ads_count: number;
  ad_text_summary: string;
  flags: {
    is_promotion: boolean;
    has_vsl: boolean;
  };
  ads: Ad[];
  media: {
    videos: Creative[];
    images: Creative[];
    total_creatives: number;
  };
  pages: {
    landing_pages: Array<{
      type: 'url' | 'channel';
      value: string;
      ad_id: string;
    }>;
    advertiser_pages: Array<{
      page_image_link: string;
      page_name: string;
      ad_id: string;
    }>;
  };
  stats: {
    total_ads: number;
    total_videos: number;
    total_images: number;
    total_creatives: number;
  };
  created_at: string;
  last_scraped: string;
}

const OfferDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<OfferDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
  const [activeTab, setActiveTab] = useState<'videos' | 'images'>('videos');

  useEffect(() => {
    const fetchOfferDetails = async () => {
      try {
        setLoading(true);
        console.log(`🔍 Buscando oferta ID: ${id}`);
        
        const response = await fetch(`http://localhost:5000/api/offers/${id}`);
        console.log(`📡 Response status: ${response.status}`);
        
        if (response.ok) {
          const text = await response.text();
          console.log(`📄 Response text:`, text);
          
          try {
            const data = JSON.parse(text);
            console.log(`📊 Parsed data:`, data);
            
            if (data.success) {
              setOffer(data.data);
              console.log('✅ Oferta carregada com sucesso');
            } else {
              console.error('❌ API retornou erro:', data.error);
            }
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse do JSON:', parseError);
            console.error('❌ Response text era:', text);
          }
        } else {
          console.error(`❌ Response não ok: ${response.status} ${response.statusText}`);
          const errorText = await response.text();
          console.error('❌ Error response:', errorText);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar detalhes da oferta:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOfferDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-escalador-charcoal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-escalador-neon-blue mx-auto"></div>
          <p className="text-white mt-4">Carregando detalhes da oferta...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-escalador-charcoal flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl">Oferta não encontrada</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-escalador-neon-blue text-white rounded-lg hover:bg-blue-600"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Use structured data from API
  const videoCreatives = offer.media?.videos || [];
  const imageCreatives = offer.media?.images || [];
  const landingPages = offer.pages?.landing_pages || [];
  const advertiserPages = offer.pages?.advertiser_pages || [];

  const downloadCreative = (creative: Creative) => {
    const url = creative.urls.video_url || creative.urls.image_url;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.download = `creative_${creative.library_id}_${Date.now()}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="min-h-screen bg-escalador-charcoal text-white">
      {/* Header */}
      <div className="border-b border-escalador-gray-light">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-escalador-gray rounded-lg transition-colors"
              >
                ← Voltar
              </button>
              <div>
                <h1 className="text-2xl font-bold">{offer.page_name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="px-3 py-1 bg-escalador-neon-blue/20 text-escalador-neon-blue rounded-full text-sm">
                    {offer.niche}
                  </span>
                  <span className="px-3 py-1 bg-escalador-green/20 text-escalador-green rounded-full text-sm">
                    Escalando
                  </span>
                  {offer.flags.is_promotion && (
                    <span className="px-3 py-1 bg-escalador-yellow/20 text-escalador-yellow rounded-full text-sm">
                      Promoção
                    </span>
                  )}
                  {offer.flags.has_vsl && (
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                      VSL
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-escalador-gray-400">
              <p>{offer.stats?.total_ads || offer.active_ads_count} anúncios ativos</p>
              <p>{offer.stats?.total_creatives || 0} criativos</p>
              <p>Última atualização: {new Date(offer.last_scraped).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Creatives */}
          <div className="lg:col-span-2">
            <div className="bg-escalador-gray rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Criativos</h2>
                <div className="flex bg-escalador-gray-light rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('videos')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'videos'
                        ? 'bg-escalador-neon-blue text-white'
                        : 'text-escalador-gray-400 hover:text-white'
                    }`}
                  >
                    Vídeos ({videoCreatives.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('images')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'images'
                        ? 'bg-escalador-neon-blue text-white'
                        : 'text-escalador-gray-400 hover:text-white'
                    }`}
                  >
                    Imagens ({imageCreatives.length})
                  </button>
                </div>
              </div>

              {/* Videos Tab */}
              {activeTab === 'videos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videoCreatives.length > 0 ? (
                    videoCreatives.map((creative, index) => (
                      <div key={index} className="bg-escalador-charcoal rounded-lg overflow-hidden border border-escalador-slate/30">
                        <div className="relative aspect-video">
                          <video
                            controls
                            poster={creative.urls.thumbnail_url}
                            className="w-full h-full object-cover"
                            preload="metadata"
                          >
                            <source src={creative.urls.video_url} type="video/mp4" />
                            Seu navegador não suporta vídeo.
                          </video>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-escalador-gray-400">
                              {creative.dimensions && <span>{creative.dimensions}</span>}
                              {creative.duration && <span> • {creative.duration}s</span>}
                            </div>
                            <button
                              onClick={() => downloadCreative(creative)}
                              className="px-3 py-1 bg-escalador-accent text-white rounded text-sm hover:bg-escalador-accent/80 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-escalador-gray-400">
                      Nenhum vídeo encontrado
                    </div>
                  )}
                </div>
              )}

              {/* Images Tab */}
              {activeTab === 'images' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imageCreatives.length > 0 ? (
                    imageCreatives.map((creative, index) => (
                      <div key={index} className="bg-escalador-charcoal rounded-lg overflow-hidden border border-escalador-slate/30">
                        <div className="relative aspect-square">
                          <img
                            src={creative.urls.image_url}
                            alt={`Creative ${index + 1}`}
                            className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                            onClick={() => setSelectedCreative(creative)}
                          />
                        </div>
                        <div className="p-2">
                          <div className="flex items-center justify-between">
                            <div className="text-xs text-escalador-gray-400">
                              {creative.dimensions}
                            </div>
                            <button
                              onClick={() => downloadCreative(creative)}
                              className="px-2 py-1 bg-escalador-accent text-white rounded text-xs hover:bg-escalador-accent/80 transition-colors"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-4 text-center py-12 text-escalador-gray-400">
                      Nenhuma imagem encontrada
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Páginas */}
            <div className="bg-escalador-charcoal rounded-xl p-6 border border-escalador-slate/30">
              <h3 className="text-lg font-semibold mb-4 text-escalador-white font-outfit">Páginas</h3>
              <div className="space-y-4">
                
                {/* Landing Pages */}
                {landingPages.length > 0 && landingPages.map((landingPage, index) => (
                  <div key={index} className="bg-escalador-charcoal rounded-lg p-4">
                    {landingPage.type === 'url' ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-escalador-gray-400">Landing Page</span>
                          <span className="px-2 py-1 bg-escalador-success/20 text-escalador-success rounded text-xs border border-escalador-success/30">
                            Ativo
                          </span>
                        </div>
                        <a
                          href={landingPage.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-escalador-accent hover:text-escalador-accent/80 break-all transition-colors"
                        >
                          {landingPage.value}
                        </a>
                      </>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          landingPage.value === 'whatsapp' ? 'bg-green-500' : 
                          landingPage.value === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                          landingPage.value === 'telegram' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}>
                          {landingPage.value === 'whatsapp' ? '💬' : 
                           landingPage.value === 'instagram' ? '📸' : 
                           landingPage.value === 'telegram' ? '✈️' : '📱'}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{landingPage.value}</p>
                          <p className="text-sm text-escalador-gray-400">Canal: {landingPage.value.charAt(0).toUpperCase() + landingPage.value.slice(1)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Página do Anunciante */}
                {advertiserPages.length > 0 && advertiserPages.map((page, index) => (
                  <div key={index} className="bg-escalador-charcoal rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={`${page.page_image_link}/picture?type=large`}
                        alt="Page"
                        className="w-12 h-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/48/48';
                        }}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{page.page_name}</p>
                        <a
                          href={page.page_image_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-escalador-accent hover:text-escalador-accent/80 transition-colors"
                        >
                          Ver no Facebook →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Se não houver páginas */}
                {landingPages.length === 0 && advertiserPages.length === 0 && (
                  <div className="bg-escalador-charcoal rounded-lg p-4">
                    <p className="text-escalador-gray-400">Nenhuma página encontrada</p>
                  </div>
                )}
                
                {/* Resumo do anúncio */}
                <div className="bg-escalador-charcoal rounded-lg p-3">
                  <p className="text-sm text-escalador-gray-400 mb-1">Resumo do anúncio</p>
                  <p className="text-sm">{offer.ad_text_summary}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-escalador-charcoal rounded-xl p-6 border border-escalador-slate/30">
              <h3 className="text-lg font-semibold mb-4 text-escalador-white font-outfit">Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-escalador-gray-400">Anúncios ativos</span>
                  <span className="font-medium text-escalador-white">{offer.stats?.total_ads || offer.active_ads_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-escalador-gray-400">Total de criativos</span>
                  <span className="font-medium text-escalador-white">{offer.stats?.total_creatives || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-escalador-gray-400">Vídeos</span>
                  <span className="font-medium text-escalador-white">{offer.stats?.total_videos || videoCreatives.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-escalador-gray-400">Imagens</span>
                  <span className="font-medium text-escalador-white">{offer.stats?.total_images || imageCreatives.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-escalador-gray-400">Landing Pages</span>
                  <span className="font-medium text-escalador-white">{landingPages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-escalador-gray-400">Data de criação</span>
                  <span className="font-medium text-escalador-white">{new Date(offer.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedCreative && selectedCreative.type === 'image' && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCreative(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedCreative.urls.image_url}
              alt="Creative"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedCreative(null)}
              className="absolute top-4 right-4 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"
            >
              ✕
            </button>
            <button
              onClick={() => downloadCreative(selectedCreative)}
              className="absolute bottom-4 right-4 px-4 py-2 bg-escalador-neon-blue text-white rounded-lg hover:bg-blue-600"
            >
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetails;
