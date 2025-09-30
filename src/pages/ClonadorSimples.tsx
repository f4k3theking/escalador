import React, { useState } from 'react';
import { Download, Copy, Globe, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const ClonadorSimples: React.FC = () => {
  const [pageUrl, setPageUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleClonePage = async () => {
    if (!pageUrl.trim()) return;

    setIsCloning(true);
    setMessage(null);
    
    try {
      // Usar uma API externa para clonagem
      const response = await fetch('https://api.htmlcsstoimage.com/v1/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: pageUrl,
          css: '',
          html: '',
          device_scale_factor: 1,
          format: 'png',
          full_page: true
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        // Criar link de download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `cloned_page_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('success', 'Página clonada com sucesso!');
        setPageUrl('');
      } else {
        showMessage('error', 'Erro ao clonar página');
      }
    } catch (error) {
      console.error('Erro ao clonar página:', error);
      showMessage('error', 'Erro de conexão com o servidor');
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-escalador-white font-outfit tracking-tight">Clonador</h1>
        <p className="text-escalador-gray-400 text-lg leading-relaxed">Captura/clonagem de páginas e criativos</p>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`flex items-center space-x-4 p-6 rounded-xl border glass-morphism ${
          message.type === 'success' 
            ? 'bg-escalador-success/10 border-escalador-success/30 text-escalador-success'
            : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            <XCircle className="w-6 h-6" />
          )}
          <span className="font-medium text-base">{message.text}</span>
        </div>
      )}

      {/* Page Cloner */}
      <div className="space-y-6">
        {/* Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-escalador-accent/20 to-escalador-secondary/20 border border-escalador-accent/30 rounded-xl">
            <Globe className="w-8 h-8 text-escalador-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-escalador-white font-outfit tracking-wide">Clonador de Páginas</h2>
            <p className="text-escalador-gray-400 text-base leading-relaxed">Capture e clone páginas de landing completas</p>
          </div>
        </div>

        {/* Clone Form */}
        <div className="glass-morphism rounded-2xl p-8">
          <h3 className="text-2xl font-semibold text-escalador-white mb-6 font-outfit tracking-wide">Clonar Página</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-escalador-gray-400 text-sm font-medium mb-3">URL da Página</label>
              <input
                type="url"
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                placeholder="https://exemplo.com/landing-page"
                className="w-full bg-escalador-slate/30 border border-escalador-steel/30 rounded-xl px-6 py-4 text-escalador-white placeholder-escalador-gray-400 focus:outline-none focus:ring-2 focus:ring-escalador-accent focus:border-escalador-accent transition-all duration-200"
              />
            </div>
            
            <div className="flex items-start space-x-4 p-6 bg-escalador-accent/10 border border-escalador-accent/30 rounded-xl">
              <AlertCircle className="w-6 h-6 text-escalador-accent mt-0.5" />
              <div className="text-sm text-escalador-accent">
                <p className="font-semibold mb-2 text-base">Como funciona:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Capturamos uma imagem completa da página</li>
                  <li>Geramos um arquivo PNG para download</li>
                  <li>Funciona com qualquer site público</li>
                  <li>Download automático após processamento</li>
                </ul>
              </div>
            </div>

            <button
              onClick={handleClonePage}
              disabled={!pageUrl.trim() || isCloning}
              className="w-full accent-gradient text-white font-semibold py-4 px-8 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-3 text-lg"
            >
              {isCloning ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Processando...</span>
                </>
              ) : (
                <>
                  <Copy className="w-6 h-6" />
                  <span>Clonar Página</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClonadorSimples;
