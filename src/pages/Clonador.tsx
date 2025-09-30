import React, { useState, useEffect } from 'react';
import { Download, Copy, Globe, Image, Video, Archive, ExternalLink, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { apiRequest } from '../config/api';

interface CloneItem {
  id: string;
  type: 'page' | 'creative';
  url: string;
  title: string;
  date: string;
  status: 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  fileName?: string;
  fileId?: string;
  error?: string;
}

const Clonador: React.FC = () => {
  const [pageUrl, setPageUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const [cloneHistory, setCloneHistory] = useState<CloneItem[]>([]);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Hacker-style progress states
  const [showHackerProgress, setShowHackerProgress] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  
  const hackerSteps = [
    { message: 'Inicializando sistema de clonagem...', duration: 800 },
    { message: 'Estabelecendo conexão segura com o target...', duration: 1200 },
    { message: 'Analisando estrutura HTML e CSS...', duration: 1500 },
    { message: 'Verificando proteções anti-cloaker...', duration: 1000 },
    { message: 'Extraindo recursos e dependências...', duration: 1800 },
    { message: 'Decodificando JavaScript obfuscado...', duration: 1300 },
    { message: 'Capturando assets de mídia...', duration: 1600 },
    { message: 'Processando imagens e otimizando...', duration: 1100 },
    { message: 'Compilando pacote ZIP seguro...', duration: 1400 },
    { message: 'Armazenando no banco de dados criptografado...', duration: 1000 },
    { message: 'Verificando integridade dos dados...', duration: 800 },
    { message: 'Finalizando processo de clonagem...', duration: 600 }
  ];

  // Carregar histórico ao montar o componente
  useEffect(() => {
    loadCloneHistory();
  }, []);

  // Função para carregar histórico de downloads
  const loadCloneHistory = async () => {
    try {
      const response = await apiRequest('/api/clonador/downloads');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedHistory: CloneItem[] = data.files.map((file: any) => ({
            id: file.fileId,
            type: 'page' as const,
            url: 'URL clonada',
            title: `Página Clonada - ${new Date(file.createdAt).toLocaleDateString('pt-BR')}`,
            date: new Date(file.createdAt).toLocaleDateString('pt-BR'),
            status: 'completed' as const,
            downloadUrl: file.downloadUrl,
            fileName: file.fileName,
            fileId: file.fileId
          }));
          setCloneHistory(formattedHistory);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  // Função para mostrar mensagem temporária
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Função para simular o processo hacker
  const startHackerProcess = async () => {
    setShowHackerProgress(true);
    setCurrentStep(0);
    setProgress(0);
    
    for (let i = 0; i < hackerSteps.length; i++) {
      setCurrentStep(i);
      setCurrentMessage(hackerSteps[i].message);
      
      // Simular progresso gradual durante cada step
      const stepProgress = (i / hackerSteps.length) * 100;
      const nextStepProgress = ((i + 1) / hackerSteps.length) * 100;
      
      // Animar progresso durante a duração do step
      const startTime = Date.now();
      const duration = hackerSteps[i].duration;
      
      const animateProgress = () => {
        const elapsed = Date.now() - startTime;
        const stepProgressPercent = Math.min(elapsed / duration, 1);
        const currentProgress = stepProgress + (nextStepProgress - stepProgress) * stepProgressPercent;
        
        setProgress(currentProgress);
        
        if (elapsed < duration) {
          requestAnimationFrame(animateProgress);
        }
      };
      
      requestAnimationFrame(animateProgress);
      
      // Esperar duração do step
      await new Promise(resolve => setTimeout(resolve, hackerSteps[i].duration));
    }
    
    setProgress(100);
    
    // Aguardar um pouco antes de fechar
    await new Promise(resolve => setTimeout(resolve, 800));
    setShowHackerProgress(false);
  };

  const handleClonePage = async () => {
    if (!pageUrl.trim()) return;

    setIsCloning(true);
    setMessage(null);
    
    try {
      // Iniciar processo hacker antes da requisição real
      const hackerPromise = startHackerProcess();
      
      const response = await apiRequest('/api/clonador/clone-page', {
        method: 'POST',
        body: JSON.stringify({ url: pageUrl })
      });

      // Aguardar o processo hacker terminar
      await hackerPromise;

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Página clonada com sucesso!');
        
        // Adicionar ao histórico
        const newClone: CloneItem = {
          id: data.data.fileId,
          type: 'page',
          url: pageUrl,
          title: `Página Clonada - ${new Date().toLocaleDateString('pt-BR')}`,
          date: new Date().toLocaleDateString('pt-BR'),
          status: 'completed',
          downloadUrl: data.data.downloadUrl,
          fileName: data.data.fileName,
          fileId: data.data.fileId
        };
        
        setCloneHistory(prev => [newClone, ...prev]);
        setPageUrl('');
      } else {
        showMessage('error', data.error || 'Erro ao clonar página');
      }
    } catch (error) {
      console.error('Erro ao clonar página:', error);
      showMessage('error', 'Erro de conexão com o servidor');
    } finally {
      setIsCloning(false);
    }
  };



  const handleDownload = (item: CloneItem) => {
    if (item.downloadUrl) {
      const fullUrl = item.downloadUrl.startsWith('http') 
        ? item.downloadUrl 
        : `http://localhost:5000${item.downloadUrl}`;
      
      console.log(`🔗 Download URL: ${fullUrl}`);
      window.open(fullUrl, '_blank');
    }
  };

  const handleDeleteClone = async (item: CloneItem) => {
    if (!item.fileId) return;

    try {
      const response = await apiRequest(`/api/clonador/download/${item.fileId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCloneHistory(prev => prev.filter(clone => clone.id !== item.id));
        showMessage('success', 'Arquivo deletado com sucesso');
      } else {
        showMessage('error', 'Erro ao deletar arquivo');
      }
    } catch (error) {
      console.error('Erro ao deletar clone:', error);
      showMessage('error', 'Erro de conexão com o servidor');
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
                    <li>Capturamos todo o HTML, CSS e JavaScript da página</li>
                    <li>Baixamos todas as imagens e recursos</li>
                    <li>Geramos um arquivo ZIP completo para download</li>
                    <li>A página clonada funciona offline</li>
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

        {/* Hacker Progress Overlay */}
        {showHackerProgress && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-escalador-dark border-2 border-escalador-accent/50 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl shadow-escalador-accent/25 hacker-border">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-escalador-accent rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{'>'}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-escalador-accent font-mono tracking-wider">SISTEMA DE CLONAGEM ATIVO</h3>
                </div>
                <div className="flex items-center justify-center space-x-2 text-escalador-success">
                  <div className="w-2 h-2 bg-escalador-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-mono">CONEXÃO ESTABELECIDA</span>
                  <div className="w-2 h-2 bg-escalador-success rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Terminal Window */}
              <div className="bg-black/50 border border-escalador-steel/30 rounded-xl p-6 mb-6">
                <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-escalador-steel/30">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-escalador-success rounded-full"></div>
                  <span className="text-escalador-gray-400 text-xs font-mono ml-4">escalador-terminal</span>
                </div>
                
                {/* Steps */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {hackerSteps.map((step, index) => (
                    <div key={index} className={`flex items-center space-x-3 transition-all duration-300 ${
                      index <= currentStep ? 'opacity-100' : 'opacity-30'
                    }`}>
                      <span className="text-escalador-accent font-mono text-sm">
                        {index < currentStep ? '✓' : index === currentStep ? '▶' : '○'}
                      </span>
                      <span className={`font-mono text-sm ${
                        index < currentStep 
                          ? 'text-escalador-success' 
                          : index === currentStep 
                            ? 'text-escalador-accent animate-pulse' 
                            : 'text-escalador-gray-400'
                      }`}>
                        {step.message}
                      </span>
                      {index === currentStep && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-escalador-accent rounded-full animate-bounce"></div>
                          <div className="w-1 h-1 bg-escalador-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1 h-1 bg-escalador-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-escalador-gray-400 text-sm font-mono">PROGRESSO</span>
                  <span className="text-escalador-accent text-sm font-mono font-bold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-escalador-steel/30 rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-escalador-accent to-escalador-secondary transition-all duration-300 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Current Operation */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-3 bg-escalador-slate/20 rounded-xl px-6 py-3 border border-escalador-accent/30">
                  <div className="w-4 h-4 border-2 border-escalador-accent border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-escalador-white font-mono text-sm">{currentMessage}</span>
                </div>
              </div>
            </div>
          </div>
        )}


      {/* Clone History */}
      <div className="glass-morphism rounded-2xl p-8">
        <h3 className="text-2xl font-semibold text-escalador-white mb-6 font-outfit tracking-wide">Histórico de Clonagens</h3>
        
        {cloneHistory.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-escalador-slate/20 rounded-2xl mb-6">
              <Copy className="w-10 h-10 text-escalador-gray-400" />
            </div>
            <div className="text-escalador-gray-300 text-xl mb-2 font-outfit font-semibold">Nenhuma clonagem realizada ainda</div>
            <div className="text-escalador-gray-400 text-base">Suas clonagens aparecerão aqui</div>
          </div>
        ) : (
          <div className="space-y-6">
            {cloneHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-6 bg-escalador-slate/20 border border-escalador-steel/30 rounded-xl hover:border-escalador-accent/50 transition-all duration-200 premium-card"
              >
                <div className="flex items-center space-x-6">
                  <div className="p-4 bg-escalador-accent/20 border border-escalador-accent/30 rounded-xl">
                    {item.type === 'page' ? (
                      <Globe className="w-8 h-8 text-escalador-accent" />
                    ) : (
                      <Image className="w-8 h-8 text-escalador-success" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-escalador-white font-semibold text-lg font-outfit">{item.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-escalador-gray-400 mt-1">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="text-escalador-accent">{item.url}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                    item.status === 'completed' 
                      ? 'bg-escalador-success/20 text-escalador-success border-escalador-success/30'
                      : item.status === 'processing'
                      ? 'bg-escalador-accent/20 text-escalador-accent border-escalador-accent/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {item.status === 'completed' ? 'Completo' : 
                     item.status === 'processing' ? 'Processando...' : 'Falhou'}
                  </span>
                  
                  {item.status === 'completed' && (
                    <button
                      onClick={() => handleDownload(item)}
                      className="flex items-center space-x-2 accent-gradient text-white px-6 py-3 rounded-xl hover:opacity-90 transition-all duration-200 font-semibold"
                    >
                      <Archive className="w-5 h-5" />
                      <span>Download</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDeleteClone(item)}
                    className="p-3 text-escalador-gray-400 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10"
                    title="Deletar arquivo"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clonador;
