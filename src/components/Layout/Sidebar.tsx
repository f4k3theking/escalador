import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Heart, 
  Copy, 
  Settings, 
  HelpCircle, 
  LogOut,
  TrendingUp
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log('Logout clicked');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/salvos', icon: Heart, label: 'Salvos' },
    { path: '/clonador', icon: Copy, label: 'Clonador' },
    { path: '/configuracoes', icon: Settings, label: 'Configurações' },
    { path: '/suporte', icon: HelpCircle, label: 'Suporte' },
  ];

  return (
    <div className="w-72 bg-escalador-charcoal border-r border-escalador-slate/30 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-escalador-slate/20">
        <div className="flex items-center justify-center w-full">
          <img 
            src="/images/escalador logo.png" 
            alt="Escalador - SaaS Premium" 
            className="w-56 h-16 object-contain"
            onError={(e) => {
              // Fallback para layout com ícone e texto se imagem não carregar
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          {/* Fallback layout */}
          <div className="items-center space-x-4" style={{display: 'none'}}>
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 border border-white/20 flex items-center justify-center">
              <div className="w-10 h-10 accent-gradient rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-escalador-white font-outfit tracking-tight">ESCALADOR</h1>
              <p className="text-sm text-escalador-gray-400 font-medium leading-relaxed">Sua máquina premium de insights</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-escalador-accent text-white font-semibold'
                    : 'text-escalador-gray-300 hover:bg-escalador-slate/50 hover:text-escalador-white'
                }`
              }
            >
              <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-medium tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>



      {/* Logout */}
      <div className="p-6 border-t border-escalador-slate/20">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-4 px-5 py-4 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 w-full group"
        >
          <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          <span className="font-medium tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
