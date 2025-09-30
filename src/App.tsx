import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import CampaignDetails from './pages/CampaignDetails';
import OfferDetails from './pages/OfferDetails';

import Salvos from './pages/Salvos';
import Clonador from './pages/Clonador';
import Configuracoes from './pages/Configuracoes';
import Suporte from './pages/Suporte';

function App() {
  return (
    <div className="App bg-escalador-dark min-h-screen antialiased">
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/campaign/:id" element={<CampaignDetails />} />
            <Route path="/offer/:id" element={<OfferDetails />} />

            <Route path="/salvos" element={<Salvos />} />
            <Route path="/clonador" element={<Clonador />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/suporte" element={<Suporte />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

export default App;
