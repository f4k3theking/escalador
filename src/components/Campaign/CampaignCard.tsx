import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Download, ExternalLink, Play, Eye, Calendar, TrendingUp } from 'lucide-react';

interface Campaign {
  id: string | number;
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
}

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(false);

  // Verificar se a oferta está salva ao carregar o componente
  useEffect(() => {
    checkIfSaved();
  }, [campaign.id]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/offers/saved/list');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.offers) {
          const isSaved = data.data.offers.some((offer: any) => offer.id === campaign.id);
          setIsFavorited(isSaved);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar se está salvo:', error);
    }
  };

  const getNetworkColor = (network: string) => {
    const colors: { [key: string]: string } = {
      'FACEBOOK': 'bg-blue-600 border border-blue-400',
      'INSTAGRAM': 'bg-pink-600 opacity-50 cursor-not-allowed',
      'TIKTOK': 'bg-black opacity-50 cursor-not-allowed',
      'GOOGLE': 'bg-red-600 opacity-50 cursor-not-allowed',
      'YOUTUBE': 'bg-red-600 opacity-50 cursor-not-allowed'
    };
    return colors[network] || 'bg-gray-600';
  };

  const getLanguageFlag = (language: string) => {
    const flags: { [key: string]: string } = {
      'PT_BR': '🇧🇷',
      'EN_US': '🇺🇸',
      'ES_ES': '🇪🇸',
      'FR_FR': '🇫🇷'
    };
    return flags[language] || '🌍';
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (loading) return; // Evitar cliques múltiplos
    
    setLoading(true);
    console.log(`🔄 Iniciando toggle save para oferta: ${campaign.id} (${campaign.title})`);
    console.log(`📊 Estado atual isFavorited: ${isFavorited}`);
    
    try {
      const response = await fetch('http://localhost:5000/api/offers/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ offer_id: campaign.id })
      });

      console.log(`📡 Response status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📦 Response data:`, data);
        
        if (data.success) {
          const newFavoritedState = data.action === 'saved';
          setIsFavorited(newFavoritedState);
          console.log(`✅ ${data.action === 'saved' ? 'SALVO' : 'REMOVIDO'}: ${campaign.title}`);
          console.log(`🔄 Novo estado isFavorited: ${newFavoritedState}`);
        } else {
          console.error('❌ API retornou success: false', data);
        }
      } else {
        const errorText = await response.text();
        console.error(`❌ Erro HTTP ${response.status}:`, errorText);
      }
    } catch (error) {
      console.error('💥 Erro ao salvar/remover favorito:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement download logic
    console.log('Download campaign:', campaign.id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/offer/${campaign.id}`);
  };

  const handleCardClick = () => {
    navigate(`/offer/${campaign.id}`);
  };

  return (
    <div
      className="glass-morphism rounded-2xl overflow-hidden premium-card cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image/Video Thumbnail */}
      <div className="relative h-52 bg-gradient-to-br from-escalador-accent/10 to-escalador-secondary/10 overflow-hidden">
        {campaign.image && campaign.image !== '/api/placeholder/400/250' ? (
          <img 
            src={campaign.image} 
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              // Fallback to gradient on image error
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        
        <div className={`absolute inset-0 ${campaign.image && campaign.image !== '/api/placeholder/400/250' ? 'bg-black/40' : 'bg-gradient-to-br from-escalador-accent/20 to-escalador-secondary/20'} flex items-center justify-center transition-all duration-300 group-hover:bg-black/20`}>
          <div className="p-4 rounded-full bg-white/10 border border-white/20 transition-transform duration-200 group-hover:scale-105">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
        
        {/* Scaling Indicator */}
        {campaign.isScaling && (
          <div className="absolute top-4 left-4">
            <div className="bg-escalador-success text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Escalando</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`absolute top-4 right-4 flex space-x-3 transition-all duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={handleFavorite}
            disabled={loading}
            className={`p-3 rounded-xl transition-all duration-200 relative z-10 ${
              loading
                ? 'bg-escalador-steel/50 text-white cursor-not-allowed'
                : isFavorited 
                  ? 'bg-red-500/80 text-white border border-red-500/50' 
                  : 'bg-white/10 text-white hover:bg-red-500/80 border border-white/20 hover:border-red-500/50'
            }`}
            title={loading ? 'Carregando...' : isFavorited ? 'Remover dos salvos' : 'Salvar oferta'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''} ${loading ? 'animate-pulse' : ''}`} />
          </button>
          <button
            onClick={handleDownload}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-escalador-accent/80 transition-all duration-200 border border-white/20 hover:border-escalador-accent/50"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={handleView}
            className="p-3 rounded-xl bg-white/10 text-white hover:bg-escalador-success/80 transition-all duration-200 border border-white/20 hover:border-escalador-success/50"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>

        {/* Network Badge */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-blue-600/80 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 border border-blue-600/30">
            <span>👍</span>
            <span>FACEBOOK</span>
            <span className="ml-1 bg-escalador-success text-white px-2 py-1 rounded-lg text-xs">ATIVO</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <h3 className="text-escalador-white font-semibold text-base line-clamp-2 group-hover:text-escalador-accent transition-colors duration-300 font-outfit leading-relaxed">
          {campaign.title}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span className="bg-escalador-accent/20 text-escalador-accent px-3 py-1 rounded-lg text-xs font-medium border border-escalador-accent/30">
            {getLanguageFlag(campaign.language)} {campaign.language.replace('_', '-')}
          </span>
          <span className="bg-escalador-success/20 text-escalador-success px-3 py-1 rounded-lg text-xs font-medium border border-escalador-success/30">
            {campaign.structure}
          </span>
          <span className="bg-escalador-warning/20 text-escalador-warning px-3 py-1 rounded-lg text-xs font-medium border border-escalador-warning/30">
            {campaign.type}
          </span>
        </div>

        {/* Niche and Funnel */}
        <div className="flex items-center justify-between text-sm text-escalador-gray-400">
          <span className="flex items-center space-x-1">
            <span>🎯</span>
            <span>{campaign.niche}</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>🔄</span>
            <span>{campaign.funnel}</span>
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-escalador-slate/30">
          <div className="text-center p-3 rounded-xl bg-escalador-accent/10 border border-escalador-accent/20">
            <div className="text-escalador-accent font-bold text-xl font-outfit">{campaign.totalClicks.toLocaleString()}</div>
            <div className="text-escalador-gray-400 text-xs font-medium">Total de Cliques</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-escalador-success/10 border border-escalador-success/20">
            <div className="text-escalador-success font-bold text-xl font-outfit">{campaign.totalCreatives}</div>
            <div className="text-escalador-gray-400 text-xs font-medium">Quantidade de Anúncios</div>
          </div>
        </div>

        {/* Tags */}
        {campaign.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {campaign.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-escalador-secondary/20 text-escalador-secondary px-3 py-1 rounded-full text-xs font-medium border border-escalador-secondary/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Date */}
        <div className="flex items-center justify-center pt-3 text-xs text-escalador-gray-500">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{campaign.createdDate}</span>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
