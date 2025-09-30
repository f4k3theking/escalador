import React, { useState, useEffect } from 'react';
import CampaignCard from '../components/Campaign/CampaignCard';
import FilterBar from '../components/Dashboard/FilterBar';
import StatsOverview from '../components/Dashboard/StatsOverview';
import { scrapingApi } from '../config/api';

// Define offer type (matching new API structure)
interface Offer {
  id: string;
  niche: string;
  offer_signature: string;
  is_scaled: boolean;
  active_ads_count: number;
  page_name: string;
  page_id: string;
  snapshot_url: string;
  ad_text_summary: string;
  status: 'active' | 'inactive' | 'paused';
  start_date: string;
  end_date: string | null;
  flags: {
    is_promotion: boolean;
    has_vsl: boolean;
  };
  last_scraped: string;
  created_at: string;
  updated_at: string;
}

// Define campaign type for compatibility with existing components
interface Campaign {
  id: number;
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

// Mock data for campaigns
const mockCampaigns = [
  {
    id: 1,
    title: 'Gatilhos da Mente Gorda VSL - Lead 01',
    image: '/api/placeholder/400/250',
    network: 'FACEBOOK',
    structure: 'VSL',
    language: 'PT_BR',
    type: 'Low Ticket',
    niche: 'Emagrecimento',
    funnel: 'VSL',
    totalClicks: 369,
    totalCreatives: 327,
    isScaling: true,
    tags: ['Low ticket'],
    createdDate: '12/06/2025'
  },
  {
    id: 2,
    title: 'Criativo 01 - Fitness Revolution',
    image: '/api/placeholder/400/250',
    network: 'FACEBOOK',
    structure: 'UGC',
    language: 'EN_US',
    type: 'High Ticket',
    niche: 'Fitness',
    funnel: 'Webinar',
    totalClicks: 1250,
    totalCreatives: 89,
    isScaling: true,
    tags: ['High ticket', 'Trending'],
    createdDate: '10/06/2025'
  },
  {
    id: 3,
    title: 'Dr. James Calp - Testosterone Boost',
    image: '/api/placeholder/400/250',
    network: 'FACEBOOK',
    structure: 'VSL',
    language: 'EN_US',
    type: 'Medium Ticket',
    niche: 'Saúde',
    funnel: 'VSL',
    totalClicks: 892,
    totalCreatives: 156,
    isScaling: false,
    tags: ['Health', 'Male'],
    createdDate: '08/06/2025'
  },
  {
    id: 4,
    title: 'Quiz Emotional - Lead Generation',
    image: '/api/placeholder/400/250',
    network: 'FACEBOOK',
    structure: 'Quiz',
    language: 'PT_BR',
    type: 'Lead Gen',
    niche: 'Relacionamento',
    funnel: 'Quiz',
    totalClicks: 567,
    totalCreatives: 234,
    isScaling: true,
    tags: ['Quiz', 'Emotional'],
    createdDate: '05/06/2025'
  },
  {
    id: 5,
    title: 'Crypto Master Class - High Ticket',
    image: '/api/placeholder/400/250',
    network: 'FACEBOOK',
    structure: 'Webinar',
    language: 'EN_US',
    type: 'High Ticket',
    niche: 'Investimentos',
    funnel: 'Webinar',
    totalClicks: 2341,
    totalCreatives: 78,
    isScaling: true,
    tags: ['Crypto', 'Investment'],
    createdDate: '03/06/2025'
  },
  {
    id: 6,
    title: 'Beauty Secrets Revealed',
    image: '/api/placeholder/400/250',
    network: 'FACEBOOK',
    structure: 'UGC',
    language: 'PT_BR',
    type: 'Medium Ticket',
    niche: 'Beleza',
    funnel: 'E-commerce',
    totalClicks: 445,
    totalCreatives: 167,
    isScaling: false,
    tags: ['Beauty', 'Female'],
    createdDate: '01/06/2025'
  }
];

const Dashboard: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch offers and stats from database (via offers API)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch offers and stats from new API
        const [offersResponse, statsResponse] = await Promise.all([
          fetch('http://localhost:5000/api/offers?limit=50'),
          fetch('http://localhost:5000/api/offers/stats')
        ]);

        // Process offers
        if (offersResponse.ok) {
          const offersData = await offersResponse.json();
          if (offersData.success && offersData.data.offers) {
            console.log('📊 API returned offers:', offersData.data.offers.length);
            setOffers(offersData.data.offers);
            
            // Transform offers to campaigns format for compatibility with existing components
            const transformedCampaigns = offersData.data.offers.map((offer: any) => {
              // Extract preview image
              let previewImage = offer.preview_image || '/api/placeholder/400/250';
              
              // Count total creatives from sample ads
              let totalCreatives = 0;
              if (offer.sample_ads) {
                totalCreatives = offer.sample_ads.reduce((sum: number, ad: any) => {
                  if (ad.detailed_creatives) {
                    try {
                      const creatives = JSON.parse(ad.detailed_creatives);
                      return sum + creatives.length;
                    } catch (e) {
                      return sum + 1;
                    }
                  }
                  return sum + 1;
                }, 0);
              }

              // Determine structure based on landing page
              let structure = 'Static';
              let funnel = 'Website';
              
              if (offer.sample_ads && offer.sample_ads.length > 0) {
                const landingPage = offer.sample_ads[0].landing_page;
                if (landingPage) {
                  if (landingPage.includes('http')) {
                    structure = 'Landing Page';
                    funnel = 'Landing Page';
                  } else if (landingPage === 'whatsapp') {
                    structure = 'WhatsApp';
                    funnel = 'WhatsApp';
                  } else if (landingPage === 'instagram') {
                    structure = 'Instagram';
                    funnel = 'Instagram';
                  }
                }
              }

              return {
                id: offer.id,
                title: (offer.page_name || 'Oferta sem título').substring(0, 60) + 
                       ((offer.page_name || '').length > 60 ? '...' : ''),
                image: previewImage,
                network: 'FACEBOOK',
                structure: structure,
                language: 'PT_BR',
                type: offer.niche || 'Geral',
                niche: offer.niche || 'Geral',
                funnel: funnel,
                totalClicks: offer.total_clicks || 0,
                totalCreatives: totalCreatives || 1,
                isScaling: offer.is_scaled || false,
                tags: ['Escalando', offer.niche].filter(Boolean),
                createdDate: new Date(offer.created_at).toLocaleDateString('pt-BR')
              };
            });
            
            setCampaigns(transformedCampaigns);
            setFilteredCampaigns(transformedCampaigns);
          }
        }

        // Process stats
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.data);
          }
        }

      } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        // Fallback to mock data
        setCampaigns(mockCampaigns);
        setFilteredCampaigns(mockCampaigns);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);



  // Function to refresh data without page reload
  const refreshDashboardData = async () => {
    try {
      console.log('🔄 Atualizando dados do dashboard...');
      
      // Fetch fresh data from offers API
      const [offersResponse, statsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/offers?limit=50'),
        fetch('http://localhost:5000/api/offers/stats')
      ]);

      // Process fresh offers data
      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        if (offersData.success && offersData.data.offers) {
          console.log('📊 Dados atualizados:', offersData.data.offers.length, 'ofertas');
          setOffers(offersData.data.offers);
          
          // Transform fresh data using same logic as initial load
          const transformedCampaigns = offersData.data.offers.map((offer: any) => {
            let previewImage = offer.preview_image || '/api/placeholder/400/250';
            
            let totalCreatives = 0;
            if (offer.sample_ads) {
              totalCreatives = offer.sample_ads.reduce((sum: number, ad: any) => {
                if (ad.detailed_creatives) {
                  try {
                    const creatives = JSON.parse(ad.detailed_creatives);
                    return sum + creatives.length;
                  } catch (e) {
                    return sum + 1;
                  }
                }
                return sum + 1;
              }, 0);
            }

            let structure = 'Static';
            let funnel = 'Website';
            
            if (offer.sample_ads && offer.sample_ads.length > 0) {
              const landingPage = offer.sample_ads[0].landing_page;
              if (landingPage) {
                if (landingPage.includes('http')) {
                  structure = 'Landing Page';
                  funnel = 'Landing Page';
                } else if (landingPage === 'whatsapp') {
                  structure = 'WhatsApp';
                  funnel = 'WhatsApp';
                } else if (landingPage === 'instagram') {
                  structure = 'Instagram';
                  funnel = 'Instagram';
                }
              }
            }

            return {
              id: offer.id,
              title: (offer.page_name || 'Oferta sem título').substring(0, 60) + 
                     ((offer.page_name || '').length > 60 ? '...' : ''),
              image: previewImage,
              network: 'FACEBOOK',
              structure: structure,
              language: 'PT_BR',
              type: offer.niche || 'Geral',
              niche: offer.niche || 'Geral',
              funnel: funnel,
              totalClicks: offer.total_clicks || 0,
              totalCreatives: totalCreatives || 1,
              isScaling: offer.is_scaled || false,
              tags: ['Escalando', offer.niche].filter(Boolean),
              createdDate: new Date(offer.created_at).toLocaleDateString('pt-BR')
            };
          });
          
          setCampaigns(transformedCampaigns);
          setFilteredCampaigns(transformedCampaigns);
        }
      }

      // Process fresh stats
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setStats(statsData.data);
        }
      }

      console.log('✅ Dashboard atualizado com novos dados!');
    } catch (error) {
      console.error('❌ Erro ao atualizar dashboard:', error);
    }
  };

  const handleFilter = (filters: any) => {
    let filtered = campaigns;

    if (filters.search) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        campaign.niche.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.network && filters.network !== 'all') {
      filtered = filtered.filter(campaign => campaign.network === filters.network);
    }

    if (filters.language && filters.language !== 'all') {
      filtered = filtered.filter(campaign => campaign.language === filters.language);
    }

    if (filters.niche && filters.niche !== 'all') {
      filtered = filtered.filter(campaign => campaign.niche === filters.niche);
    }

    if (filters.isScaling !== undefined) {
      filtered = filtered.filter(campaign => campaign.isScaling === filters.isScaling);
    }

    setFilteredCampaigns(filtered);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <StatsOverview campaigns={campaigns} stats={stats} />

      {/* Filter Bar */}
      <FilterBar onFilter={handleFilter} />



      {/* Featured Section */}
      <div className="mb-12">
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-escalador-white font-outfit tracking-tight mb-3">Ofertas em destaque - Facebook</h3>
          <p className="text-escalador-gray-400 text-lg leading-relaxed">Campanhas que estão apresentando maior escalabilidade no Facebook com performance comprovada</p>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center space-x-3 text-sm text-escalador-gray-400 bg-escalador-slate/20 px-4 py-2 rounded-xl border border-escalador-slate/30">
            <div className="w-3 h-3 bg-escalador-success rounded-full"></div>
            <span className="font-medium">BLACK / WHITE</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-escalador-gray-400 bg-escalador-slate/20 px-4 py-2 rounded-xl border border-escalador-slate/30">
            <div className="w-3 h-3 bg-escalador-accent rounded-full"></div>
            <span className="font-medium">TODOS OS NICHOS</span>
          </div>
          <div className="flex items-center space-x-3 text-sm text-escalador-gray-400 bg-escalador-slate/20 px-4 py-2 rounded-xl border border-escalador-slate/30">
            <div className="w-3 h-3 bg-escalador-warning rounded-full"></div>
            <span className="font-medium">FILTRE DO JEITO QUE VOCÊ QUISER!</span>
          </div>
        </div>

        {/* Campaign Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-escalador-accent/20 rounded-2xl mb-4">
              <div className="w-8 h-8 border-2 border-escalador-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-escalador-accent text-xl mb-2 font-outfit font-semibold">Carregando campanhas premium...</div>
            <div className="text-escalador-gray-400 text-base">Buscando insights de alta performance</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}

        {filteredCampaigns.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-escalador-slate/20 rounded-2xl mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="text-escalador-gray-300 text-xl mb-2 font-outfit font-semibold">Nenhuma campanha encontrada</div>
            <div className="text-escalador-gray-400 text-base">Tente ajustar os filtros para descobrir mais oportunidades</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
