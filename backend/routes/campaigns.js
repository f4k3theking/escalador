const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Get all campaigns with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      niche = 'all',
      language = 'all',
      isScaling = undefined,
      sortBy = 'last_seen',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereConditions = ['c.is_active = true'];
    let params = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(c.title LIKE ? OR a.name LIKE ?)`);
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }

    if (niche && niche !== 'all') {
      whereConditions.push(`c.niche = ?`);
      params.push(niche);
    }

    if (language && language !== 'all') {
      whereConditions.push(`c.language = ?`);
      params.push(language);
    }

    if (isScaling !== undefined) {
      whereConditions.push(`c.is_scaling = ?`);
      params.push(isScaling === 'true');
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    const validSortFields = ['last_seen', 'total_creatives', 'created_at', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'last_seen';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Main query (simplified for MySQL/MariaDB)
    const query = `
      SELECT 
        c.id,
        c.title,
        c.niche,
        c.language,
        c.countries,
        c.platforms,
        c.ad_format,
        c.funnel_type,
        c.total_creatives,
        c.total_clicks,
        c.estimated_spend,
        c.is_scaling,
        c.is_active,
        c.first_seen,
        c.last_seen,
        c.created_at,
        a.name as advertiser_name,
        a.page_id as advertiser_page_id
      FROM campaigns c
      JOIN advertisers a ON c.advertiser_id = a.id
      ${whereClause}
      ORDER BY c.${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Count total for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM campaigns c
      JOIN advertisers a ON c.advertiser_id = a.id
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0]['COUNT(*)']);

    // Format response
    const campaigns = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      image: row.sample_images?.[0] || '/api/placeholder/400/250',
      network: row.platforms?.[0] || 'FACEBOOK',
      structure: row.ad_format || 'Unknown',
      language: row.language || 'PT_BR',
      type: classifyTicketType(row.estimated_spend, row.funnel_type),
      niche: row.niche || 'Outros',
      funnel: row.funnel_type || 'Unknown',
      totalClicks: row.total_clicks || 0,
      totalCreatives: row.total_creatives || 0,
      isScaling: row.is_scaling || false,
      tags: generateTags(row),
      createdDate: formatDate(row.first_seen),
      advertiserName: row.advertiser_name,
      sampleImages: row.sample_images || [],
      sampleVideo: row.sample_video
    }));

    res.json({
      campaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        search,
        niche,
        language,
        isScaling,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// Get single campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.*,
        a.name as advertiser_name,
        a.page_id as advertiser_page_id,
        a.page_url as advertiser_page_url,
        a.category as advertiser_category,
        COUNT(cr.id) as total_creatives_count,
        array_agg(DISTINCT cr.image_urls[1]) FILTER (WHERE cr.image_urls IS NOT NULL) as all_images,
        array_agg(DISTINCT cr.video_url) FILTER (WHERE cr.video_url IS NOT NULL) as all_videos
      FROM campaigns c
      JOIN advertisers a ON c.advertiser_id = a.id
      LEFT JOIN creatives cr ON c.id = cr.campaign_id
      WHERE c.id = $1
      GROUP BY c.id, a.id
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const campaign = result.rows[0];

    // Get recent creatives
    const creativesQuery = `
      SELECT 
        id, ad_text, headline, image_urls, video_url, 
        landing_page_url, platforms, start_date, 
        clicks, ctr, estimated_spend, is_active, scraped_at
      FROM creatives 
      WHERE campaign_id = $1 
      ORDER BY scraped_at DESC 
      LIMIT 10
    `;

    const creativesResult = await db.query(creativesQuery, [id]);

    res.json({
      id: campaign.id,
      title: campaign.title,
      niche: campaign.niche,
      language: campaign.language,
      countries: campaign.countries,
      platforms: campaign.platforms,
      adFormat: campaign.ad_format,
      funnelType: campaign.funnel_type,
      totalCreatives: campaign.total_creatives,
      totalClicks: campaign.total_clicks,
      estimatedSpend: campaign.estimated_spend,
      isScaling: campaign.is_scaling,
      isActive: campaign.is_active,
      firstSeen: campaign.first_seen,
      lastSeen: campaign.last_seen,
      createdAt: campaign.created_at,
      advertiser: {
        name: campaign.advertiser_name,
        pageId: campaign.advertiser_page_id,
        pageUrl: campaign.advertiser_page_url,
        category: campaign.advertiser_category
      },
      media: {
        images: campaign.all_images || [],
        videos: campaign.all_videos || []
      },
      recentCreatives: creativesResult.rows
    });

  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
});

// Get campaign statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_campaigns,
        COUNT(*) FILTER (WHERE is_scaling = true) as scaling_campaigns,
        SUM(total_clicks) as total_clicks,
        SUM(total_creatives) as total_creatives,
        COUNT(DISTINCT advertiser_id) as unique_advertisers,
        COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '24 hours') as recent_campaigns
      FROM campaigns 
      WHERE is_active = true
    `);

    const nicheStats = await db.query(`
      SELECT 
        niche,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE is_scaling = true) as scaling_count
      FROM campaigns 
      WHERE is_active = true AND niche IS NOT NULL
      GROUP BY niche
      ORDER BY count DESC
      LIMIT 10
    `);

    const platformStats = await db.query(`
      SELECT 
        platform,
        COUNT(*) as count
      FROM (
        SELECT unnest(platforms) as platform
        FROM campaigns 
        WHERE is_active = true AND platforms IS NOT NULL
      ) p
      GROUP BY platform
      ORDER BY count DESC
    `);

    res.json({
      overview: stats.rows[0],
      niches: nicheStats.rows,
      platforms: platformStats.rows
    });

  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    res.status(500).json({ error: 'Failed to fetch campaign statistics' });
  }
});

// Helper functions
function classifyTicketType(estimatedSpend, funnelType) {
  if (estimatedSpend > 5000) return 'High Ticket';
  if (estimatedSpend > 1000) return 'Medium Ticket';
  if (funnelType === 'Lead Gen') return 'Lead Gen';
  return 'Low Ticket';
}

function generateTags(campaign) {
  const tags = [];
  
  if (campaign.is_scaling) tags.push('Escalando');
  if (campaign.total_creatives > 20) tags.push('High Volume');
  if (campaign.ad_format === 'VSL') tags.push('VSL');
  if (campaign.platforms?.includes('Instagram')) tags.push('Instagram');
  if (campaign.platforms?.includes('Facebook')) tags.push('Facebook');
  
  return tags;
}

function formatDate(date) {
  if (!date) return null;
  return new Date(date).toLocaleDateString('pt-BR');
}

module.exports = router;
