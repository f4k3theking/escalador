import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  onFilter: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilter }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    network: 'all',
    language: 'all',
    niche: 'all'
  });

  const networks = [
    { value: 'all', label: 'Todas as Redes' },
    { value: 'FACEBOOK', label: 'Facebook', available: true },
    { value: 'INSTAGRAM', label: 'Instagram (Em breve)', available: false },
    { value: 'TIKTOK', label: 'TikTok (Em breve)', available: false },
    { value: 'GOOGLE', label: 'Google (Em breve)', available: false },
    { value: 'YOUTUBE', label: 'YouTube (Em breve)', available: false }
  ];

  const languages = [
    { value: 'all', label: 'Todos os Idiomas' },
    { value: 'PT_BR', label: '🇧🇷 Português' },
    { value: 'EN_US', label: '🇺🇸 Inglês' },
    { value: 'ES_ES', label: '🇪🇸 Espanhol' },
    { value: 'FR_FR', label: '🇫🇷 Francês' }
  ];

  const niches = [
    { value: 'all', label: 'Todos os Nichos' },
    { value: 'Emagrecimento', label: 'Emagrecimento' },
    { value: 'Fitness', label: 'Fitness' },
    { value: 'Saúde', label: 'Saúde' },
    { value: 'Relacionamento', label: 'Relacionamento' },
    { value: 'Investimentos', label: 'Investimentos' },
    { value: 'Beleza', label: 'Beleza' }
  ];

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      network: 'all',
      language: 'all',
      niche: 'all'
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = filters.search || filters.network !== 'all' || filters.language !== 'all' || filters.niche !== 'all';

  return (
    <div className="bg-escalador-charcoal/50 border border-escalador-slate/30 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-escalador-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar ofertas premium..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl pl-12 pr-6 py-3 text-escalador-white placeholder-escalador-gray-400 focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200 w-96"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center space-x-3 px-6 py-3 rounded-xl border transition-all duration-200 group ${
              isFilterOpen || hasActiveFilters
                ? 'bg-escalador-accent text-white border-escalador-accent'
                : 'bg-escalador-slate/30 border-escalador-steel/30 text-escalador-gray-300 hover:text-escalador-white hover:border-escalador-accent'
            }`}
          >
            <Filter className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">Filtros</span>
            {hasActiveFilters && (
              <span className="bg-escalador-success text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                !
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-3 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200 group"
            >
              <X className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-medium">Limpar</span>
            </button>
          )}
        </div>

        {/* Status Display */}
        <div className="flex items-center space-x-4">
          <span className="text-escalador-gray-400 text-sm font-medium">Status:</span>
          <div className="px-6 py-3 text-sm font-semibold bg-escalador-accent text-white rounded-xl">
            Todos
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-escalador-slate/30">
          {/* Network Filter */}
          <div>
            <label className="block text-escalador-gray-400 text-sm font-medium mb-3">Rede Social</label>
            <select
              value={filters.network}
              onChange={(e) => {
                const selectedNetwork = networks.find(n => n.value === e.target.value);
                if (selectedNetwork && (selectedNetwork.available || e.target.value === 'all')) {
                  handleFilterChange('network', e.target.value);
                }
              }}
              className="w-full bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-4 py-3 text-escalador-white focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200"
            >
              {networks.map(network => (
                <option 
                  key={network.value} 
                  value={network.value}
                  disabled={!network.available && network.value !== 'all'}
                  className={!network.available && network.value !== 'all' ? 'text-gray-500 bg-gray-700' : ''}
                >
                  {network.label}
                </option>
              ))}
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="block text-escalador-gray-400 text-sm font-medium mb-3">Idioma</label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-4 py-3 text-escalador-white focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200"
            >
              {languages.map(language => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          {/* Niche Filter */}
          <div>
            <label className="block text-escalador-gray-400 text-sm font-medium mb-3">Nicho</label>
            <select
              value={filters.niche}
              onChange={(e) => handleFilterChange('niche', e.target.value)}
              className="w-full bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-4 py-3 text-escalador-white focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200"
            >
              {niches.map(niche => (
                <option key={niche.value} value={niche.value}>
                  {niche.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
