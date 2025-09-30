import React, { useState } from 'react';
import { MessageCircle, Book, Video, Mail, Phone, Clock, Send, Search, ChevronRight, ExternalLink } from 'lucide-react';

const Suporte: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const faqItems = [
    {
      id: 1,
      question: 'Como funciona o sistema de escalonamento?',
      answer: 'O Escalador analisa automaticamente o desempenho de suas campanhas e identifica aquelas com maior potencial de escala baseado em métricas como CTR, ROI e volume de cliques.',
      category: 'Funcionalidades'
    },
    {
      id: 2,
      question: 'Posso clonar páginas de qualquer site?',
      answer: 'Sim, nosso clonador de páginas funciona com a maioria dos sites. No entanto, algumas páginas com proteções específicas ou JavaScript complexo podem ter limitações.',
      category: 'Clonador'
    },
    {
      id: 3,
      question: 'Como adicionar tags personalizadas aos salvos?',
      answer: 'Na seção Salvos, clique no botão "Tag" em qualquer campanha salva e digite sua tag personalizada. Você pode adicionar múltiplas tags para melhor organização.',
      category: 'Organização'
    },
    {
      id: 4,
      question: 'Qual é o limite de campanhas que posso salvar?',
      answer: 'Não há limite para o número de campanhas que você pode salvar. Organize-as usando tags personalizadas para facilitar a localização.',
      category: 'Limites'
    },
    {
      id: 5,
      question: 'Como baixar criativos de anúncios?',
      answer: 'Use o Clonador de Criativos inserindo a URL do anúncio. Suportamos Facebook, Instagram, TikTok e URLs diretas de mídia.',
      category: 'Clonador'
    }
  ];

  const tutorials = [
    {
      id: 1,
      title: 'Primeiros Passos no Escalador',
      duration: '5 min',
      description: 'Aprenda a navegar pela plataforma e configurar sua conta',
      thumbnail: '/api/placeholder/300/200',
      url: '#'
    },
    {
      id: 2,
      title: 'Como Usar o Clonador de Páginas',
      duration: '8 min',
      description: 'Tutorial completo sobre clonagem de landing pages',
      thumbnail: '/api/placeholder/300/200',
      url: '#'
    },
    {
      id: 3,
      title: 'Organizando Campanhas com Tags',
      duration: '6 min',
      description: 'Melhores práticas para organizar seus salvos',
      thumbnail: '/api/placeholder/300/200',
      url: '#'
    },
    {
      id: 4,
      title: 'Identificando Campanhas Escaláveis',
      duration: '12 min',
      description: 'Como interpretar métricas e identificar oportunidades',
      thumbnail: '/api/placeholder/300/200',
      url: '#'
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!message.trim()) return;
    console.log('Sending message:', message);
    setMessage('');
    // TODO: Implement chat logic
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-escalador-white font-outfit tracking-tight">Suporte</h1>
        <p className="text-escalador-gray-400 text-lg leading-relaxed">Central de ajuda e suporte ao cliente</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-escalador-gray border border-escalador-gray-light rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-escalador-neon-blue mx-auto mb-2" />
          <div className="text-white font-semibold">&lt; 2h</div>
          <div className="text-gray-400 text-sm">Tempo médio de resposta</div>
        </div>
        <div className="bg-escalador-gray border border-escalador-gray-light rounded-lg p-4 text-center">
          <MessageCircle className="w-8 h-8 text-escalador-green mx-auto mb-2" />
          <div className="text-white font-semibold">24/7</div>
          <div className="text-gray-400 text-sm">Suporte disponível</div>
        </div>
        <div className="bg-escalador-gray border border-escalador-gray-light rounded-lg p-4 text-center">
          <Book className="w-8 h-8 text-escalador-yellow mx-auto mb-2" />
          <div className="text-white font-semibold">{faqItems.length}</div>
          <div className="text-gray-400 text-sm">Artigos na base</div>
        </div>
        <div className="bg-escalador-gray border border-escalador-gray-light rounded-lg p-4 text-center">
          <Video className="w-8 h-8 text-purple-400 mx-auto mb-2" />
          <div className="text-white font-semibold">{tutorials.length}</div>
          <div className="text-gray-400 text-sm">Tutoriais em vídeo</div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-escalador-gray border border-escalador-gray-light rounded-xl p-6 hover:border-escalador-neon-blue transition-colors text-left group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-escalador-neon-blue/10 rounded-lg group-hover:bg-escalador-neon-blue/20 transition-colors">
              <MessageCircle className="w-6 h-6 text-escalador-neon-blue" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Chat ao Vivo</h3>
              <p className="text-gray-400 text-sm">Fale conosco agora</p>
            </div>
          </div>
        </button>

        <button className="bg-escalador-gray border border-escalador-gray-light rounded-xl p-6 hover:border-escalador-green transition-colors text-left group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-escalador-green/10 rounded-lg group-hover:bg-escalador-green/20 transition-colors">
              <Mail className="w-6 h-6 text-escalador-green" />
            </div>
            <div>
              <h3 className="text-white font-semibold">E-mail</h3>
              <p className="text-gray-400 text-sm">suporte@escalador.com</p>
            </div>
          </div>
        </button>

        <button className="bg-escalador-gray border border-escalador-gray-light rounded-xl p-6 hover:border-escalador-yellow transition-colors text-left group">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-escalador-yellow/10 rounded-lg group-hover:bg-escalador-yellow/20 transition-colors">
              <Phone className="w-6 h-6 text-escalador-yellow" />
            </div>
            <div>
              <h3 className="text-white font-semibold">WhatsApp</h3>
              <p className="text-gray-400 text-sm">+55 11 99999-9999</p>
            </div>
          </div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-escalador-gray border border-escalador-gray-light rounded-lg p-1">
        <button
          onClick={() => setActiveTab('faq')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'faq'
              ? 'bg-escalador-neon-blue text-escalador-dark'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Book className="w-5 h-5" />
          <span>FAQ</span>
        </button>
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'tutorials'
              ? 'bg-escalador-neon-blue text-escalador-dark'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Video className="w-5 h-5" />
          <span>Tutoriais</span>
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md font-medium transition-colors ${
            activeTab === 'chat'
              ? 'bg-escalador-neon-blue text-escalador-dark'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <MessageCircle className="w-5 h-5" />
          <span>Chat</span>
        </button>
      </div>

      {/* FAQ Tab */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar na base de conhecimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-escalador-gray-light border border-escalador-gray-light rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-escalador-neon-blue focus:border-transparent"
            />
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQ.map((item) => (
              <div
                key={item.id}
                className="bg-escalador-gray border border-escalador-gray-light rounded-xl p-6 hover:border-escalador-neon-blue/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="bg-escalador-neon-blue/10 text-escalador-neon-blue px-2 py-1 rounded text-xs font-medium">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-2">{item.question}</h3>
                    <p className="text-gray-400">{item.answer}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              </div>
            ))}
          </div>

          {filteredFAQ.length === 0 && (
            <div className="text-center py-8">
              <Book className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <div className="text-gray-400">Nenhum resultado encontrado</div>
              <div className="text-gray-500 text-sm">Tente usar termos diferentes na busca</div>
            </div>
          )}
        </div>
      )}

      {/* Tutorials Tab */}
      {activeTab === 'tutorials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial) => (
            <div
              key={tutorial.id}
              className="bg-escalador-gray border border-escalador-gray-light rounded-xl overflow-hidden hover:border-escalador-neon-blue/50 transition-colors group cursor-pointer"
            >
              <div className="relative h-48 bg-escalador-gray-light">
                <div className="absolute inset-0 bg-gradient-to-br from-escalador-neon-blue/20 to-escalador-green/20 flex items-center justify-center">
                  <Video className="w-12 h-12 text-white opacity-60" />
                </div>
                <div className="absolute bottom-3 right-3 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                  {tutorial.duration}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-white font-semibold mb-2 group-hover:text-escalador-neon-blue transition-colors">
                  {tutorial.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4">{tutorial.description}</p>
                <button className="flex items-center space-x-2 text-escalador-neon-blue hover:text-escalador-neon-blue/80 transition-colors">
                  <span>Assistir</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-escalador-gray border border-escalador-gray-light rounded-xl p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">Envie uma mensagem</h3>
              <p className="text-gray-400">Nossa equipe responderá em breve</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Assunto</label>
                <select className="w-full bg-escalador-gray-light border border-escalador-gray-light rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-escalador-neon-blue">
                  <option>Dúvida sobre funcionalidade</option>
                  <option>Problema técnico</option>
                  <option>Solicitação de feature</option>
                  <option>Feedback</option>
                  <option>Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Mensagem</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  placeholder="Descreva sua dúvida ou problema..."
                  className="w-full bg-escalador-gray-light border border-escalador-gray-light rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-escalador-neon-blue resize-none"
                />
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                className="w-full bg-escalador-neon-blue text-escalador-dark font-semibold py-3 px-6 rounded-lg hover:bg-escalador-neon-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Enviar Mensagem</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suporte;
