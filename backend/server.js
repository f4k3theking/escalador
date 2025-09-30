const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const campaignRoutes = require('./routes/campaigns');
const creativeRoutes = require('./routes/creatives');
const authRoutes = require('./routes/auth');
const clonadorRoutes = require('./routes/clonador');
const offersRoutes = require('./routes/offers');

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
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
    const result = await db.healthCheck();
    res.json({
      status: 'Database OK',
      ...result
    });
  } catch (error) {
    res.status(500).json({
      status: 'Database Error',
      error: error.message
    });
  }
});

// Debug endpoint
app.get('/api/debug', async (req, res) => {
  try {
    const db = require('./database/connection');
    
    console.log('🔍 Starting debug queries...');
    
    const advertisers = await db.query('SELECT * FROM advertisers');
    console.log('✅ Advertisers query result:', advertisers);
    
    const campaigns = await db.query('SELECT * FROM campaigns');
    console.log('✅ Campaigns query result:', campaigns);
    
    const creatives = await db.query('SELECT * FROM creatives');
    console.log('✅ Creatives query result:', creatives);
    
    res.json({
      advertisers: advertisers?.rows || [],
      campaigns: campaigns?.rows || [],
      creatives: creatives?.rows || [],
      debug: {
        advertisersType: typeof advertisers,
        campaignsType: typeof campaigns,
        creativesType: typeof creatives
      }
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get campaign details with creatives
app.get('/api/campaign-details/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = require('./database/connection');
    
    console.log(`🔍 Fetching campaign details for ID: ${id}`);
    
    let campaignResult;
    const isNumeric = !isNaN(parseInt(id));
    
    if (isNumeric) {
      const campaignQuery = `
        SELECT 
          c.*,
          a.name as advertiser_name,
          a.page_id as advertiser_page_id
        FROM campaigns c
        JOIN advertisers a ON c.advertiser_id = a.id
        ORDER BY c.created_at ASC
        LIMIT 1 OFFSET ?
      `;
      
      campaignResult = await db.query(campaignQuery, [parseInt(id) - 1]);
    } else {
      const campaignQuery = `
        SELECT 
          c.*,
          a.name as advertiser_name,
          a.page_id as advertiser_page_id
        FROM campaigns c
        JOIN advertisers a ON c.advertiser_id = a.id
        WHERE c.id = ?
        LIMIT 1
      `;
      
      campaignResult = await db.query(campaignQuery, [id]);
    }
    
    if (campaignResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }
    
    const campaign = campaignResult.rows[0];
    
    // Get creatives for this campaign
    let creativesResult = { rows: [] };
    try {
      creativesResult = await db.query(
        'SELECT * FROM creatives WHERE campaign_id = ? ORDER BY created_at DESC',
        [campaign.id]
      );
    } catch (creativesError) {
      console.error('❌ Error fetching creatives:', creativesError.message);
      creativesResult = { rows: [] };
    }
    
    // Parse JSON fields safely
    const campaignData = {
      ...campaign,
      countries: campaign.countries ? JSON.parse(campaign.countries) : [],
      platforms: campaign.platforms ? JSON.parse(campaign.platforms) : [],
      creatives: creativesResult?.rows ? creativesResult.rows.map(creative => ({
        ...creative,
        image_urls: creative.image_urls ? JSON.parse(creative.image_urls) : [],
        platforms: creative.platforms ? JSON.parse(creative.platforms) : []
      })) : []
    };
    
    res.json({
      success: true,
      campaign: campaignData
    });
    
  } catch (error) {
    console.error('Error fetching campaign details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear ALL data endpoint
app.get('/api/clear-all-data', async (req, res) => {
  try {
    const db = require('./database/connection');

    console.log('🗑️ Clearing ALL campaign data...');

    await db.query('DELETE FROM creatives');
    await db.query('DELETE FROM campaigns');
    await db.query('DELETE FROM advertisers');

    console.log('✅ All data cleared!');

    res.json({
      success: true,
      message: 'All campaign data cleared successfully!'
    });
  } catch (error) {
    console.error('Error clearing all data:', error);
    res.status(500).json({ error: error.message });
  }
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== FACEBOOK ADS SCRAPER INTEGRATION =====

// Process scraped Facebook ads data
app.post('/api/scraper/process-ads', async (req, res) => {
  try {
    console.log('📥 Processing scraped ads data...');
    
    const { ads, metadata } = req.body;
    
    if (!ads || !Array.isArray(ads)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid data format. Expected ads array.'
      });
    }

    console.log(`📊 Processing ${ads.length} ads from scraper...`);
    
    let processed = 0;
    let skipped = 0;
    const errors = [];

    for (const ad of ads) {
      try {
        // Check if ad already exists
        const existingAd = await db.query(
          'SELECT id FROM scraped_ads WHERE ad_library_id = ?',
          [ad.library_id || ad.id || `fb_${Date.now()}_${Math.random()}`]
        );

        if (existingAd.rows.length > 0) {
          skipped++;
          continue;
        }

        // Insert into scraped_ads table
        await db.query(`
          INSERT INTO scraped_ads (
            ad_library_id, page_name, ad_description, start_date, end_date,
            cta_button, destination_url, media_type, media_urls, 
            impressions_range, spend_range, demographics, regions,
            keyword, scraped_at, raw_data
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          ad.library_id || ad.id || `fb_${Date.now()}_${Math.random()}`,
          ad.page_name || 'Unknown',
          ad.ad_description || ad.text || '',
          ad.start_date || new Date().toISOString(),
          ad.end_date || null,
          ad.cta_button || null,
          ad.destination_url || null,
          ad.media_type || 'unknown',
          JSON.stringify(ad.media_urls || []),
          ad.impressions_range || null,
          ad.spend_range || null,
          JSON.stringify(ad.demographics || {}),
          JSON.stringify(ad.regions || []),
          ad.keyword || 'facebook_ads',
          ad.scraped_at || new Date().toISOString(),
          JSON.stringify(ad)
        ]);

        processed++;

      } catch (adError) {
        console.error('❌ Error processing ad:', adError.message);
        errors.push({
          ad_id: ad.library_id || 'unknown',
          error: adError.message
        });
      }
    }

    console.log(`✅ Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors.length}`);

    res.json({
      success: true,
      processed,
      skipped,
      errors: errors.length,
      total_received: ads.length,
      metadata: {
        processed_at: new Date().toISOString(),
        scraper_metadata: metadata
      }
    });

  } catch (error) {
    console.error('❌ Error processing scraped ads:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get processed scraped ads
app.get('/api/scraper/ads', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const keyword = req.query.keyword;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM scraped_ads';
    let params = [];

    if (keyword) {
      query += ' WHERE keyword = ? OR page_name LIKE ? OR ad_description LIKE ?';
      params = [keyword, `%${keyword}%`, `%${keyword}%`];
    }

    query += ' ORDER BY scraped_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM scraped_ads';
    let countParams = [];

    if (keyword) {
      countQuery += ' WHERE keyword = ? OR page_name LIKE ? OR ad_description LIKE ?';
      countParams = [keyword, `%${keyword}%`, `%${keyword}%`];
    }

    const countResult = await db.query(countQuery, countParams);
    const total = countResult.rows[0].total;

    res.json({
      success: true,
      ads: result.rows.map(ad => ({
        ...ad,
        media_urls: JSON.parse(ad.media_urls || '[]'),
        demographics: JSON.parse(ad.demographics || '{}'),
        regions: JSON.parse(ad.regions || '[]'),
        raw_data: JSON.parse(ad.raw_data || '{}')
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('❌ Error fetching scraped ads:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Escalador Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
