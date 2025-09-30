const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const campaignRoutes = require('../routes/campaigns');
const creativeRoutes = require('../routes/creatives');
const authRoutes = require('../routes/auth');
const clonadorRoutes = require('../routes/clonador');
const offersRoutes = require('../routes/offers');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://escalador.store', 'https://www.escalador.store'] 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/campaigns', campaignRoutes);
app.use('/api/creatives', creativeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clonador', clonadorRoutes);
app.use('/api/offers', offersRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV 
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const db = require('./database/connection');
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({ 
      success: true, 
      message: 'Conexão com banco OK',
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Endpoint não encontrado' 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Erro interno do servidor' 
  });
});

// Para Netlify Functions
exports.handler = app;

// Para desenvolvimento local
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
  });
}
