import React, { useState } from 'react';
import { User, Bell, Globe, Palette, Shield, Database, Save } from 'lucide-react';

const Configuracoes: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: 'João Silva',
      email: 'joao@exemplo.com',
      avatar: '',
      timezone: 'America/Sao_Paulo'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      scalingAlerts: true,
      weeklyReports: false
    },
    preferences: {
      language: 'pt-BR',
      theme: 'dark',
      defaultView: 'grid',
      itemsPerPage: 12
    },
    privacy: {
      profileVisible: false,
      dataSharing: false,
      analytics: true
    }
  });

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'preferences', label: 'Preferências', icon: Palette },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'data', label: 'Dados', icon: Database }
  ];

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // TODO: Implement save logic
  };

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-escalador-white font-outfit tracking-tight">Configurações</h1>
        <p className="text-escalador-gray-400 text-lg leading-relaxed">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-morphism rounded-2xl p-6 space-y-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-4 px-5 py-4 rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-escalador-accent text-white font-semibold'
                      : 'text-escalador-gray-300 hover:bg-escalador-slate/50 hover:text-escalador-white'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium tracking-wide">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="glass-morphism rounded-2xl p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <h3 className="text-2xl font-semibold text-escalador-white font-outfit tracking-wide">Informações do Perfil</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-escalador-gray-400 text-sm font-medium mb-3">Nome Completo</label>
                    <input
                      type="text"
                      value={settings.profile.name}
                      onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                      className="w-full bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-6 py-4 text-escalador-white focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-escalador-gray-400 text-sm font-medium mb-3">E-mail</label>
                    <input
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                      className="w-full bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-6 py-4 text-escalador-white focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-escalador-gray-400 text-sm font-medium mb-3">Fuso Horário</label>
                  <select
                    value={settings.profile.timezone}
                    onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                    className="w-full bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-6 py-4 text-escalador-white focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200"
                  >
                    <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                    <option value="America/New_York">Nova York (UTC-5)</option>
                    <option value="Europe/London">Londres (UTC+0)</option>
                    <option value="Asia/Tokyo">Tóquio (UTC+9)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-escalador-white font-outfit tracking-wide">Preferências de Notificação</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-escalador-gray-light rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Notificações por E-mail</h4>
                      <p className="text-gray-400 text-sm">Receba atualizações importantes por e-mail</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-escalador-neon-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-escalador-gray-light rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Notificações Push</h4>
                      <p className="text-gray-400 text-sm">Receba notificações no navegador</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.pushNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-escalador-neon-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-escalador-gray-light rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Alertas de Escala</h4>
                      <p className="text-gray-400 text-sm">Seja notificado quando campanhas começarem a escalar</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.scalingAlerts}
                        onChange={(e) => handleSettingChange('notifications', 'scalingAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-escalador-neon-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-escalador-gray-light rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Relatórios Semanais</h4>
                      <p className="text-gray-400 text-sm">Receba resumos semanais de performance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.weeklyReports}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyReports', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-escalador-neon-blue"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Preferências da Interface</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Idioma</label>
                    <select
                      value={settings.preferences.language}
                      onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                      className="w-full bg-escalador-gray-light border border-escalador-gray-light rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-escalador-neon-blue"
                    >
                      <option value="pt-BR">🇧🇷 Português</option>
                      <option value="en-US">🇺🇸 English</option>
                      <option value="es-ES">🇪🇸 Español</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Visualização Padrão</label>
                    <select
                      value={settings.preferences.defaultView}
                      onChange={(e) => handleSettingChange('preferences', 'defaultView', e.target.value)}
                      className="w-full bg-escalador-gray-light border border-escalador-gray-light rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-escalador-neon-blue"
                    >
                      <option value="grid">Grade</option>
                      <option value="list">Lista</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Itens por Página</label>
                  <select
                    value={settings.preferences.itemsPerPage}
                    onChange={(e) => handleSettingChange('preferences', 'itemsPerPage', parseInt(e.target.value))}
                    className="w-full bg-escalador-gray-light border border-escalador-gray-light rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-escalador-neon-blue"
                  >
                    <option value={6}>6 itens</option>
                    <option value={12}>12 itens</option>
                    <option value={24}>24 itens</option>
                    <option value={48}>48 itens</option>
                  </select>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Configurações de Privacidade</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-escalador-gray-light rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Perfil Público</h4>
                      <p className="text-gray-400 text-sm">Permitir que outros usuários vejam seu perfil</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.profileVisible}
                        onChange={(e) => handleSettingChange('privacy', 'profileVisible', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-escalador-neon-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-escalador-gray-light rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Compartilhamento de Dados</h4>
                      <p className="text-gray-400 text-sm">Permitir uso de dados para melhorias do produto</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.dataSharing}
                        onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-escalador-neon-blue"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-escalador-gray-light rounded-lg">
                    <div>
                      <h4 className="text-white font-medium">Analytics</h4>
                      <p className="text-gray-400 text-sm">Permitir coleta de dados de uso para analytics</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.privacy.analytics}
                        onChange={(e) => handleSettingChange('privacy', 'analytics', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-escalador-neon-blue"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Data Tab */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Gerenciamento de Dados</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-escalador-gray-light rounded-lg">
                    <h4 className="text-white font-medium mb-2">Exportar Dados</h4>
                    <p className="text-gray-400 text-sm mb-4">Baixe todos os seus dados em formato JSON</p>
                    <button className="bg-escalador-neon-blue text-escalador-dark px-4 py-2 rounded-lg font-medium hover:bg-escalador-neon-blue/90 transition-colors">
                      Exportar Dados
                    </button>
                  </div>

                  <div className="p-4 bg-escalador-gray-light rounded-lg">
                    <h4 className="text-white font-medium mb-2">Limpar Cache</h4>
                    <p className="text-gray-400 text-sm mb-4">Limpe dados temporários e cache do navegador</p>
                    <button className="bg-escalador-yellow text-escalador-dark px-4 py-2 rounded-lg font-medium hover:bg-escalador-yellow/90 transition-colors">
                      Limpar Cache
                    </button>
                  </div>

                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="text-red-400 font-medium mb-2">Excluir Conta</h4>
                    <p className="text-gray-400 text-sm mb-4">Exclua permanentemente sua conta e todos os dados associados</p>
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors">
                      Excluir Conta
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-8 border-t border-escalador-slate/30">
              <button
                onClick={handleSave}
                className="flex items-center space-x-3 accent-gradient text-white px-8 py-4 rounded-xl font-semibold hover:opacity-90 transition-all duration-200 text-lg"
              >
                <Save className="w-6 h-6" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuracoes;
