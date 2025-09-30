const express = require('express');
const router = express.Router();
const db = require('../database/connection');

// Get all creatives with filters
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      campaignId = null,
      type = 'all', // image, video, all
      isActive = undefined,
      sortBy = 'scraped_at',
      sortOrder = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    if (campaignId && campaignId !== 'all') {
      whereConditions.push(`cr.campaign_id = $${paramIndex}`);
      params.push(campaignId);
      paramIndex++;
    }

    if (type && type !== 'all') {
      if (type === 'video') {
        whereConditions.push(`cr.video_url IS NOT NULL AND cr.video_url != ''`);
      } else if (type === 'image') {
        whereConditions.push(`(cr.video_url IS NULL OR cr.video_url = '') AND cr.image_urls IS NOT NULL`);
      }
    }

    if (isActive !== undefined) {
      whereConditions.push(`cr.is_active = $${paramIndex}`);
      params.push(isActive === 'true');
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    const validSortFields = ['scraped_at', 'clicks', 'ctr', 'start_date'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'scraped_at';
    const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Main query
    const query = `
      SELECT 
        cr.id,
        cr.campaign_id,
        cr.fb_ad_id,
        cr.ad_text,
        cr.headline,
        cr.description,
        cr.call_to_action,
        cr.landing_page_url,
        cr.image_urls,
        cr.video_url,
        cr.media_type,
        cr.language,
        cr.countries,
        cr.platforms,
        cr.impressions,
        cr.clicks,
        cr.ctr,
        cr.estimated_spend,
        cr.is_active,
        cr.start_date,
        cr.end_date,
        cr.scraped_at,
        c.title as campaign_title,
        c.niche as campaign_niche,
        a.name as advertiser_name
      FROM creatives cr
      JOIN campaigns c ON cr.campaign_id = c.id
      JOIN advertisers a ON cr.advertiser_id = a.id
      ${whereClause}
      ORDER BY cr.${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Count total for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM creatives cr
      JOIN campaigns c ON cr.campaign_id = c.id
      JOIN advertisers a ON cr.advertiser_id = a.id
      ${whereClause}
    `;

    const countResult = await db.query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].count);

    // Format response
    const creatives = result.rows.map(row => ({
      id: row.id,
      campaignId: row.campaign_id,
      campaignTitle: row.campaign_title,
      campaignNiche: row.campaign_niche,
      advertiserName: row.advertiser_name,
      fbAdId: row.fb_ad_id,
      
      // Content
      adText: row.ad_text,
      headline: row.headline,
      description: row.description,
      callToAction: row.call_to_action,
      landingPageUrl: row.landing_page_url,
      
      // Media
      imageUrls: row.image_urls || [],
      videoUrl: row.video_url,
      mediaType: row.video_url ? 'video' : 'image',
      thumbnailUrl: row.image_urls?.[0] || '/api/placeholder/300/400',
      
      // Metadata
      language: row.language,
      countries: row.countries || [],
      platforms: row.platforms || [],
      
      // Metrics
      impressions: row.impressions || 0,
      clicks: row.clicks || 0,
      ctr: parseFloat(row.ctr) || 0,
      estimatedSpend: row.estimated_spend || 0,
      
      // Status
      isActive: row.is_active,
      startDate: row.start_date,
      endDate: row.end_date,
      scrapedAt: row.scraped_at,
      
      // Generated tags
      tags: generateCreativeTags(row)
    }));

    res.json({
      creatives,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        campaignId,
        type,
        isActive,
        sortBy,
        sortOrder
      }
    });

  } catch (error) {
    console.error('Error fetching creatives:', error);
    res.status(500).json({ error: 'Failed to fetch creatives' });
  }
});

// Get single creative by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        cr.*,
        c.title as campaign_title,
        c.niche as campaign_niche,
        c.ad_format as campaign_ad_format,
        a.name as advertiser_name,
        a.page_id as advertiser_page_id,
        a.page_url as advertiser_page_url
      FROM creatives cr
      JOIN campaigns c ON cr.campaign_id = c.id
      JOIN advertisers a ON cr.advertiser_id = a.id
      WHERE cr.id = $1
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creative not found' });
    }

    const creative = result.rows[0];

    res.json({
      id: creative.id,
      campaignId: creative.campaign_id,
      advertiserId: creative.advertiser_id,
      fbAdId: creative.fb_ad_id,
      
      // Content
      adText: creative.ad_text,
      headline: creative.headline,
      description: creative.description,
      callToAction: creative.call_to_action,
      landingPageUrl: creative.landing_page_url,
      
      // Media
      imageUrls: creative.image_urls || [],
      videoUrl: creative.video_url,
      mediaType: creative.media_type,
      
      // Metadata
      language: creative.language,
      countries: creative.countries || [],
      platforms: creative.platforms || [],
      
      // Metrics
      impressions: creative.impressions || 0,
      clicks: creative.clicks || 0,
      ctr: parseFloat(creative.ctr) || 0,
      estimatedSpend: creative.estimated_spend || 0,
      
      // Status and dates
      isActive: creative.is_active,
      startDate: creative.start_date,
      endDate: creative.end_date,
      scrapedAt: creative.scraped_at,
      createdAt: creative.created_at,
      updatedAt: creative.updated_at,
      
      // Related data
      campaign: {
        title: creative.campaign_title,
        niche: creative.campaign_niche,
        adFormat: creative.campaign_ad_format
      },
      advertiser: {
        name: creative.advertiser_name,
        pageId: creative.advertiser_page_id,
        pageUrl: creative.advertiser_page_url
      }
    });

  } catch (error) {
    console.error('Error fetching creative:', error);
    res.status(500).json({ error: 'Failed to fetch creative' });
  }
});

// Get creative statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_creatives,
        COUNT(*) FILTER (WHERE is_active = true) as active_creatives,
        COUNT(*) FILTER (WHERE video_url IS NOT NULL) as video_creatives,
        COUNT(*) FILTER (WHERE image_urls IS NOT NULL) as image_creatives,
        SUM(clicks) as total_clicks,
        AVG(ctr) as average_ctr,
        SUM(estimated_spend) as total_estimated_spend,
        COUNT(*) FILTER (WHERE scraped_at > NOW() - INTERVAL '24 hours') as recent_creatives
      FROM creatives
    `);

    const platformStats = await db.query(`
      SELECT 
        platform,
        COUNT(*) as count,
        AVG(ctr) as avg_ctr
      FROM (
        SELECT unnest(platforms) as platform, ctr
        FROM creatives 
        WHERE platforms IS NOT NULL AND is_active = true
      ) p
      GROUP BY platform
      ORDER BY count DESC
    `);

    const mediaTypeStats = await db.query(`
      SELECT 
        CASE 
          WHEN video_url IS NOT NULL THEN 'Video'
          WHEN image_urls IS NOT NULL THEN 'Image'
          ELSE 'Text'
        END as media_type,
        COUNT(*) as count,
        AVG(ctr) as avg_ctr,
        AVG(clicks) as avg_clicks
      FROM creatives
      WHERE is_active = true
      GROUP BY media_type
      ORDER BY count DESC
    `);

    res.json({
      overview: stats.rows[0],
      platforms: platformStats.rows,
      mediaTypes: mediaTypeStats.rows
    });

  } catch (error) {
    console.error('Error fetching creative stats:', error);
    res.status(500).json({ error: 'Failed to fetch creative statistics' });
  }
});

// Download creative media
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'image' } = req.query; // image, video

    const result = await db.query(
      'SELECT image_urls, video_url, headline FROM creatives WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Creative not found' });
    }

    const creative = result.rows[0];
    let downloadUrl = null;

    if (type === 'video' && creative.video_url) {
      downloadUrl = creative.video_url;
    } else if (type === 'image' && creative.image_urls && creative.image_urls.length > 0) {
      downloadUrl = creative.image_urls[0];
    }

    if (!downloadUrl) {
      return res.status(404).json({ error: `${type} not available for this creative` });
    }

    // For now, just return the URL. In production, you might want to:
    // 1. Download the file to your server
    // 2. Serve it through your own endpoint
    // 3. Add watermarks or tracking
    
    res.json({
      downloadUrl,
      filename: `creative_${id}_${type}.${type === 'video' ? 'mp4' : 'jpg'}`,
      type
    });

  } catch (error) {
    console.error('Error downloading creative:', error);
    res.status(500).json({ error: 'Failed to download creative' });
  }
});

// Helper function to generate tags for creatives
function generateCreativeTags(creative) {
  const tags = [];
  
  if (creative.video_url) {
    tags.push('Video');
  } else if (creative.image_urls && creative.image_urls.length > 0) {
    tags.push('Image');
  }
  
  if (creative.ctr > 2) tags.push('High CTR');
  if (creative.clicks > 1000) tags.push('High Clicks');
  if (creative.is_active) tags.push('Active');
  
  // Add platform tags
  if (creative.platforms) {
    creative.platforms.forEach(platform => {
      if (platform && !tags.includes(platform)) {
        tags.push(platform);
      }
    });
  }
  
  // Add niche tag
  if (creative.campaign_niche) {
    tags.push(creative.campaign_niche);
  }
  
  return tags;
}

module.exports = router;
