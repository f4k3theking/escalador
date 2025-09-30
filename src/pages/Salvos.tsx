import React, { useState, useEffect } from 'react';
import { Heart, Tag, Trash2, Grid, List } from 'lucide-react';
import CampaignCard from '../components/Campaign/CampaignCard';

interface SavedOffer {
  id: string;
  title: string;
  image: string;
  network: string;
  structure: string;
  language: string;
  type: string;
  niche: string;
  funnel: string;
  totalClicks: number;
  totalCreatives: number;
  isScaling: boolean;
  tags: string[];
  createdDate: string;
  savedDate: string;
  customTags: string[];
}

const Salvos: React.FC = () => {
  const [savedCampaigns, setSavedCampaigns] = useState<SavedOffer[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [newTag, setNewTag] = useState('');
  const [showAddTag, setShowAddTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar ofertas salvas ao montar o componente
  useEffect(() => {
    loadSavedOffers();
  }, []);

  const loadSavedOffers = async () => {
    try {
      setLoading(true);
      console.log('📚 Carregando ofertas salvas...');
      
      const response = await fetch('http://localhost:5000/api/offers/saved/list');
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Response data:', data);
        
        if (data.success) {
          console.log('✅ API Success! Ofertas encontradas:', data.data?.offers?.length || 0);
          
          if (data.data?.offers && data.data.offers.length > 0) {
            // Transformar dados da API para o formato esperado pelo componente
            const transformedOffers: SavedOffer[] = data.data.offers.map((offer: any) => {
              console.log('🔄 Transformando oferta:', offer.id, offer.page_name);
              return {
                id: offer.id,
                title: offer.page_name || 'Sem título',
                image: offer.preview_image || '/api/placeholder/400/250',
                network: 'FACEBOOK',
                structure: offer.niche || 'Geral',
                language: 'PT_BR',
                type: offer.niche || 'Geral',
                niche: offer.niche || 'Geral',
                funnel: offer.landing_page?.includes('http') ? 'Landing Page' : 'WhatsApp',
                totalClicks: offer.total_clicks || 0,
                totalCreatives: offer.active_ads_count || 0,
                isScaling: offer.is_scaled || false,
                tags: [offer.niche || 'Geral'],
                createdDate: new Date(offer.created_at).toLocaleDateString('pt-BR'),
                savedDate: new Date(offer.saved_at || offer.created_at).toLocaleDateString('pt-BR'),
                customTags: offer.tags && Array.isArray(offer.tags) ? offer.tags : []
              };
            });
            
            console.log('🎯 Ofertas transformadas:', transformedOffers.length);
            setSavedCampaigns(transformedOffers);
          } else {
            console.log('⚠️ Nenhuma oferta encontrada na resposta');
            setSavedCampaigns([]);
          }
        } else {
          console.error('❌ API retornou success: false', data);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Erro HTTP:', response.status, errorText);
      }
    } catch (error) {
      console.error('💥 Erro ao carregar ofertas salvas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all unique custom tags
  const allCustomTags = Array.from(
    new Set(savedCampaigns.flatMap(c => c.customTags))
  );

  const filteredCampaigns = savedCampaigns.filter(campaign => {
    if (selectedTag === 'all') return true;
    return campaign.customTags.includes(selectedTag);
  });

  const handleRemoveFromSaved = async (campaignId: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/offers/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offer_id: campaignId })
      });

      if (response.ok) {
        setSavedCampaigns(campaigns => campaigns.filter(c => c.id !== campaignId));
      }
    } catch (error) {
      console.error('Erro ao remover dos salvos:', error);
    }
  };

  const handleAddTag = (campaignId: string) => {
    if (!newTag.trim()) return;
    
    setSavedCampaigns(campaigns =>
      campaigns.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, customTags: [...campaign.customTags, newTag.trim()] }
          : campaign
      )
    );
    
    setNewTag('');
    setShowAddTag(null);
  };

  const handleRemoveTag = (campaignId: string, tagToRemove: string) => {
    setSavedCampaigns(campaigns =>
      campaigns.map(campaign =>
        campaign.id === campaignId
          ? { ...campaign, customTags: campaign.customTags.filter(tag => tag !== tagToRemove) }
          : campaign
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-escalador-white font-outfit tracking-tight">Salvos</h1>
          <p className="text-escalador-gray-400 text-lg leading-relaxed">Área de favoritos do usuário</p>
        </div>
        <div className="flex items-center space-x-6">
          {/* Refresh Button */}
          <button
            onClick={loadSavedOffers}
            disabled={loading}
            className="flex items-center space-x-3 px-6 py-3 accent-gradient text-white rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50 font-semibold"
          >
            <span className={loading ? 'animate-spin' : ''}>🔄</span>
            <span>Atualizar</span>
          </button>
          
          {/* View Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-escalador-steel/30">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-escalador-accent text-white'
                  : 'bg-escalador-slate/30 text-escalador-gray-300 hover:text-white'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 transition-colors ${
                viewMode === 'list'
                  ? 'bg-escalador-accent text-white'
                  : 'bg-escalador-slate/30 text-escalador-gray-300 hover:text-white'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-morphism rounded-2xl p-8 premium-card group">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-escalador-accent/20 to-escalador-secondary/20 border border-escalador-accent/30">
              <Heart className="w-7 h-7 text-escalador-accent" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-escalador-white group-hover:text-escalador-accent transition-colors duration-300 font-outfit">
                {savedCampaigns.length}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-escalador-white font-semibold mb-2 text-lg font-outfit tracking-wide">Total Salvos</h3>
            <p className="text-escalador-gray-400 text-sm leading-relaxed">Ofertas salvas como favoritas</p>
          </div>
          <div className="mt-6 h-1 bg-gradient-to-r from-escalador-accent/50 to-escalador-secondary/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </div>
        
        <div className="glass-morphism rounded-2xl p-8 premium-card group">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-escalador-success/20 to-escalador-accent/20 border border-escalador-success/30">
              <Tag className="w-7 h-7 text-escalador-success" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-escalador-white group-hover:text-escalador-success transition-colors duration-300 font-outfit">
                {allCustomTags.length}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-escalador-white font-semibold mb-2 text-lg font-outfit tracking-wide">Tags Personalizadas</h3>
            <p className="text-escalador-gray-400 text-sm leading-relaxed">Tags criadas pelo usuário</p>
          </div>
          <div className="mt-6 h-1 bg-gradient-to-r from-escalador-success/50 to-escalador-accent/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </div>
        
        <div className="glass-morphism rounded-2xl p-8 premium-card group">
          <div className="flex items-start justify-between mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-escalador-warning/20 to-escalador-success/20 border border-escalador-warning/30">
              <div className="w-7 h-7 bg-escalador-warning rounded-lg flex items-center justify-center">
                <span className="text-escalador-dark font-bold text-sm">🚀</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-escalador-white group-hover:text-escalador-warning transition-colors duration-300 font-outfit">
                {savedCampaigns.filter(c => c.isScaling).length}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-escalador-white font-semibold mb-2 text-lg font-outfit tracking-wide">Escalando</h3>
            <p className="text-escalador-gray-400 text-sm leading-relaxed">Ofertas em processo de escala</p>
          </div>
          <div className="mt-6 h-1 bg-gradient-to-r from-escalador-warning/50 to-escalador-success/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
        </div>
      </div>

      {/* Tag Filter */}
      <div className="glass-morphism rounded-2xl p-6">
        <div className="flex items-center space-x-6">
          <span className="text-escalador-gray-400 font-medium text-base">Filtrar por tag:</span>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                selectedTag === 'all'
                  ? 'bg-escalador-accent text-white border-escalador-accent'
                  : 'bg-escalador-slate/30 text-escalador-gray-300 hover:text-white border-escalador-steel/30 hover:border-escalador-accent'
              }`}
            >
              Todas ({savedCampaigns.length})
            </button>
            {allCustomTags.map(tag => {
              const count = savedCampaigns.filter(c => c.customTags.includes(tag)).length;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    selectedTag === tag
                      ? 'bg-escalador-success text-white border-escalador-success'
                      : 'bg-escalador-slate/30 text-escalador-gray-300 hover:text-white border-escalador-steel/30 hover:border-escalador-success'
                  }`}
                >
                  {tag} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Saved Campaigns */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="relative">
              <CampaignCard campaign={campaign} />
              
              {/* Saved-specific overlay */}
              <div className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              
              {/* Custom tags and actions */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 space-y-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {campaign.customTags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-1 bg-escalador-green/20 text-escalador-green px-2 py-1 rounded-full text-xs"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(campaign.id, tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2">
                  {showAddTag === campaign.id ? (
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nova tag..."
                        className="flex-1 bg-escalador-gray-light border border-escalador-gray-light rounded px-2 py-1 text-white text-xs focus:outline-none focus:ring-1 focus:ring-escalador-neon-blue"
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag(campaign.id)}
                      />
                      <button
                        onClick={() => handleAddTag(campaign.id)}
                        className="bg-escalador-green text-escalador-dark px-2 py-1 rounded text-xs font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => setShowAddTag(null)}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setShowAddTag(campaign.id)}
                        className="flex items-center space-x-1 bg-escalador-gray-light text-gray-300 hover:text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        <Tag className="w-3 h-3" />
                        <span>Tag</span>
                      </button>
                      <button
                        onClick={() => handleRemoveFromSaved(campaign.id)}
                        className="flex items-center space-x-1 bg-red-500/20 text-red-400 hover:text-red-300 px-2 py-1 rounded text-xs transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remover</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-escalador-gray border border-escalador-gray-light rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-escalador-gray-light border-b border-escalador-gray-light">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Campanha</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Tags Personalizadas</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Data Salva</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-escalador-gray-light hover:bg-escalador-gray-light/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-red-500 fill-current" />
                        <div>
                          <div className="text-white font-medium">{campaign.title}</div>
                          <div className="text-gray-400 text-sm">{campaign.niche} • {campaign.network}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {campaign.customTags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-escalador-green/20 text-escalador-green px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{campaign.savedDate}</td>
                    <td className="px-6 py-4">
                      {campaign.isScaling ? (
                        <span className="bg-escalador-green/20 text-escalador-green px-2 py-1 rounded text-xs font-medium">
                          Escalando
                        </span>
                      ) : (
                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium">
                          Parado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowAddTag(campaign.id)}
                          className="p-2 text-gray-400 hover:text-escalador-green transition-colors"
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromSaved(campaign.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredCampaigns.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-escalador-slate/20 rounded-2xl mb-6">
            <Heart className="w-10 h-10 text-escalador-gray-400" />
          </div>
          <div className="text-escalador-gray-300 text-xl mb-2 font-outfit font-semibold">Nenhuma campanha salva</div>
          <div className="text-escalador-gray-400 text-base">
            {selectedTag === 'all' 
              ? 'Comece salvando suas campanhas favoritas no Dashboard'
              : `Nenhuma campanha encontrada com a tag "${selectedTag}"`
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default Salvos;
