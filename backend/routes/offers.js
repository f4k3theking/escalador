const express = require('express');
const router = express.Router();
const OffersController = require('../controllers/OffersController');

/**
 * @route POST /api/offers/scrape
 * @desc Executa scraping de ofertas usando Meta Ad Library API
 * @body { search_terms?: string[] }
 */
router.post('/scrape', async (req, res) => {
  await OffersController.scrapeAndSaveOffers(req, res);
});

/**
 * @route GET /api/offers
 * @desc Lista ofertas com filtros e paginação
 * @query {
 *   niche?: string,
 *   is_scaled?: boolean,
 *   status?: 'active'|'inactive'|'paused'|'all',
 *   has_vsl?: boolean,
 *   is_promotion?: boolean,
 *   min_ads_count?: number,
 *   page?: number,
 *   limit?: number,
 *   search?: string
 * }
 */
router.get('/', async (req, res) => {
  await OffersController.getOffers(req, res);
});

/**
 * @route GET /api/offers/stats
 * @desc Obtém estatísticas para o dashboard
 */
router.get('/stats', async (req, res) => {
  await OffersController.getDashboardStats(req, res);
});

/**
 * @route GET /api/offers/:id
 * @desc Obtém detalhes de uma oferta específica
 */
router.get('/:id', async (req, res) => {
  await OffersController.getOfferDetails(req, res);
});

/**
 * @route POST /api/offers/save
 * @desc Salva/remove oferta dos favoritos
 * @body { offer_id: string }
 */
router.post('/save', async (req, res) => {
  await OffersController.toggleSavedOffer(req, res);
});

/**
 * @route GET /api/offers/saved/list
 * @desc Lista ofertas salvas pelo usuário
 */
router.get('/saved/list', async (req, res) => {
  try {
    const user_id = req.user?.id || 'anonymous';
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    console.log(`📚 Buscando ofertas salvas para usuário: ${user_id}`);

    const db = require('../database/connection');
    
    const result = await db.query(`
      SELECT 
        o.*,
        uso.tags,
        uso.notes,
        uso.created_at as saved_at
      FROM user_saved_offers uso
      JOIN offers o ON uso.offer_id = o.id
      WHERE uso.user_id = ?
      ORDER BY uso.created_at DESC
      LIMIT ? OFFSET ?
    `, [user_id, parseInt(limit), offset]);

    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM user_saved_offers WHERE user_id = ?',
      [user_id]
    );

    console.log(`📊 Encontradas ${result.rows.length} ofertas salvas`);

    // Process each offer to add preview_image and sample_ads
    const processedOffers = await Promise.all(result.rows.map(async (offer) => {
      // Get sample ads for this offer
      const sampleAdsResult = await db.query(`
        SELECT id, ad_text, detailed_creatives 
        FROM ads_raw 
        WHERE offer_id = ? 
        ORDER BY created_at DESC 
        LIMIT 3
      `, [offer.id]);

      // Extract preview image from detailed_creatives with improved logic
      let previewImage = null;
      
      if (sampleAdsResult.rows.length > 0) {
        for (const ad of sampleAdsResult.rows) {
          if (ad.detailed_creatives) {
            try {
              const creatives = JSON.parse(ad.detailed_creatives);
              if (Array.isArray(creatives)) {
                for (const creative of creatives) {
                  // Primeiro: procurar por thumbnail de vídeo em urls
                  if (creative.urls?.thumbnail_url && creative.urls.thumbnail_url.includes('http')) {
                    previewImage = creative.urls.thumbnail_url;
                    break;
                  }
                  
                  // Segundo: procurar imagens em urls
                  if (creative.urls?.image_url && creative.urls.image_url.includes('http')) {
                    previewImage = creative.urls.image_url;
                    break;
                  }
                  
                  // Terceiro: fallback para propriedades diretas (retrocompatibilidade)
                  if (creative.thumbnail_url && creative.thumbnail_url.includes('http')) {
                    previewImage = creative.thumbnail_url;
                    break;
                  }
                  
                  if (creative.image_url && creative.image_url.includes('http')) {
                    previewImage = creative.image_url;
                    break;
                  }
                  
                  // Quarto: procurar imagens em media_links
                  if (creative.media_links && Array.isArray(creative.media_links)) {
                    for (const media of creative.media_links) {
                      if (typeof media === 'string' && media.includes('http') && 
                          (media.includes('.jpg') || media.includes('.png') || media.includes('.jpeg') || media.includes('.webp'))) {
                        previewImage = media;
                        break;
                      }
                    }
                    if (previewImage) break;
                  }
                }
              }
              if (previewImage) break;
            } catch (e) {
              console.error('Error parsing creatives for offer', offer.id, ':', e);
            }
          }
        }
      }
      
      console.log(`🖼️ Preview image para oferta ${offer.id}:`, previewImage ? '✅ Encontrada' : '❌ Não encontrada');

      // Generate random clicks between 1000-10000 for each offer
      const randomClicks = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;

      return {
        ...offer,
        preview_image: previewImage,
        sample_ads: sampleAdsResult.rows,
        total_clicks: randomClicks,
        flags: offer.flags ? JSON.parse(offer.flags) : { is_promotion: false, has_vsl: false },
        tags: offer.tags ? JSON.parse(offer.tags) : []
      };
    }));

    console.log(`✅ Enviando ${processedOffers.length} ofertas processadas`);

    res.json({
      success: true,
      data: {
        offers: processedOffers,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult.rows[0].total,
          total_pages: Math.ceil(countResult.rows[0].total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar ofertas salvas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/offers/niches/list
 * @desc Lista todos os nichos disponíveis
 */
router.get('/niches/list', async (req, res) => {
  try {
    const db = require('../database/connection');
    
    const result = await db.query(`
      SELECT 
        niche,
        COUNT(*) as total_offers,
        COUNT(CASE WHEN is_scaled = true THEN 1 END) as scaled_offers,
        SUM(active_ads_count) as total_ads,
        MAX(last_scraped) as last_updated
      FROM offers
      WHERE status = 'active'
      GROUP BY niche
      ORDER BY scaled_offers DESC, total_offers DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Erro ao buscar nichos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route GET /api/offers/logs/scraping
 * @desc Obtém logs de scraping
 */
router.get('/logs/scraping', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const db = require('../database/connection');
    
    const result = await db.query(`
      SELECT 
        id, status, search_terms, total_ads_found, total_offers_created,
        total_offers_updated, scaled_offers_found, errors_count,
        error_message, duration_seconds, started_at, completed_at
      FROM scraping_logs
      ORDER BY started_at DESC
      LIMIT ? OFFSET ?
    `, [parseInt(limit), offset]);

    const countResult = await db.query('SELECT COUNT(*) as total FROM scraping_logs');

    const logs = result.rows.map(log => ({
      ...log,
      search_terms: JSON.parse(log.search_terms || '[]')
    }));

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          current_page: parseInt(page),
          per_page: parseInt(limit),
          total: countResult.rows[0].total,
          total_pages: Math.ceil(countResult.rows[0].total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao buscar logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/offers/:id
 * @desc Remove uma oferta (admin only)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = require('../database/connection');

    const result = await db.query('DELETE FROM offers WHERE id = ?', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Oferta não encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Oferta removida com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao remover oferta:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * @route POST /api/offers/import-json
 * @desc Importa dados do scraper a partir de arquivo JSON
 * @body { file_path: string, niche?: string }
 */
router.post('/import-json', async (req, res) => {
  try {
    const { file_path, niche } = req.body;
    
    if (!file_path) {
      return res.status(400).json({
        success: false,
        error: 'file_path é obrigatório'
      });
    }

    console.log(`📥 Importando dados do scraper: ${file_path}`);

    // Import data using the ScraperDataImporter
    const ScraperDataImporter = require('../scripts/import-scraper-data');
    const importer = new ScraperDataImporter();
    
    await importer.importData(file_path);

    res.json({
      success: true,
      message: 'Dados importados com sucesso!',
      stats: importer.stats
    });

  } catch (error) {
    console.error('❌ Erro ao importar dados:', error);
    res.status(500).json({
      success: false,
      error: 'Falha na importação: ' + error.message
    });
  }
});

/**
 * @route POST /api/offers/test-api
 * @desc Testa conexão com Meta Ad Library API
 */
router.post('/test-api', async (req, res) => {
  try {
    const MetaAdLibraryService = require('../services/MetaAdLibraryService');
    const metaService = new MetaAdLibraryService();
    
    console.log('🧪 Testando Meta Ad Library API...');
    
    const result = await metaService.searchAds('emagrecimento', { limit: 5 });
    
    res.json({
      success: result.success,
      message: result.success 
        ? `API funcionando! Encontrados ${result.data.length} anúncios de teste.`
        : 'Falha na API: ' + result.error,
      data: {
        ads_found: result.data.length,
        sample_ad: result.data[0] || null,
        error: result.error || null
      }
    });

  } catch (error) {
    console.error('❌ Erro no teste da API:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste da Meta Ad Library API'
    });
  }
});

module.exports = router;
