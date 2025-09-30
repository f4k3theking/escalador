import React from 'react';
import { TrendingUp, Target, MousePointer, Image } from 'lucide-react';

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

interface StatsOverviewProps {
  campaigns: Campaign[];
  stats?: {
    total_offers: number;
    active_offers: number;
    scaled_offers: number;
    total_active_ads: number;
    total_clicks: number;
    total_creatives: number;
    promotion_offers: number;
    vsl_offers: number;
    total_niches: number;
    last_scraping_time: string | null;
  } | null;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ campaigns, stats }) => {
  // Use stats from API if available, otherwise fallback to campaigns calculation
  const totalCampaigns = stats?.total_offers || campaigns.length;
  const scalingCampaigns = stats?.scaled_offers || campaigns.filter(c => c.isScaling).length;
  const totalClicks = stats?.total_clicks || campaigns.reduce((sum, c) => sum + c.totalClicks, 0);
  const totalCreatives = stats?.total_creatives || campaigns.reduce((sum, c) => sum + c.totalCreatives, 0);

  const statsData = [
    {
      title: 'Total de Campanhas',
      value: totalCampaigns.toLocaleString(),
      icon: Target,
      color: 'escalador-neon-blue',
      bgColor: 'escalador-neon-blue/10',
      description: 'Campanhas ativas no sistema'
    },
    {
      title: 'Escalando Agora',
      value: scalingCampaigns.toLocaleString(),
      icon: TrendingUp,
      color: 'escalador-green',
      bgColor: 'escalador-green/10',
      description: 'Campanhas em processo de escala'
    },
    {
      title: 'Total de Cliques',
      value: totalClicks.toLocaleString(),
      icon: MousePointer,
      color: 'escalador-yellow',
      bgColor: 'escalador-yellow/10',
      description: 'Cliques acumulados em todas as campanhas'
    },
    {
      title: 'Total de Criativos',
      value: totalCreatives.toLocaleString(),
      icon: Image,
      color: 'purple-400',
      bgColor: 'purple-400/10',
      description: 'Criativos catalogados na plataforma'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="glass-morphism rounded-2xl p-8 premium-card group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-escalador-accent/20 to-escalador-secondary/20 border border-escalador-accent/30">
                <Icon className="w-7 h-7 text-escalador-accent" />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-escalador-white group-hover:text-escalador-accent transition-colors duration-300 font-outfit">
                  {stat.value}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-escalador-white font-semibold mb-2 text-lg font-outfit tracking-wide">{stat.title}</h3>
              <p className="text-escalador-gray-400 text-sm leading-relaxed">{stat.description}</p>
            </div>
            
            {/* Premium accent line */}
            <div className="mt-6 h-1 bg-gradient-to-r from-escalador-accent/50 to-escalador-secondary/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsOverview;
