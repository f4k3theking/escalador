import React from 'react';
import { Search, Filter, Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-escalador-charcoal/80 border-b border-escalador-slate/20 px-8 py-6">
      <div className="flex items-center justify-between">
        {/* Page Title */}
        <div>
          <h2 className="text-3xl font-bold text-escalador-white font-outfit tracking-tight">Dashboard</h2>
          <p className="text-escalador-gray-400 text-base font-medium mt-1">Monitore ofertas em escala com inteligência premium</p>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-escalador-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar ofertas..."
              className="bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl pl-12 pr-6 py-3 text-escalador-white placeholder-escalador-gray-400 focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200 w-96"
            />
          </div>

          {/* Filter Button */}
          <button className="flex items-center space-x-3 bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-6 py-3 text-escalador-gray-300 hover:text-escalador-white hover:border-escalador-accent transition-all duration-200 group">
            <Filter className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">Filtros</span>
          </button>

          {/* Notifications */}
          <button className="relative p-3 text-escalador-gray-400 hover:text-escalador-white transition-all duration-200 rounded-xl hover:bg-escalador-slate/30 group">
            <Bell className="w-6 h-6 transition-transform duration-200 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 bg-escalador-success text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile */}
          <button className="flex items-center space-x-3 bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-6 py-3 text-escalador-gray-300 hover:text-escalador-white hover:border-escalador-accent transition-all duration-200 group">
            <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            <span className="font-medium">Perfil</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
