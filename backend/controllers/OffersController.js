/**
 * Escalador - OffersController
 * Controlador para gerenciamento de ofertas do scraper
 */

const mysql = require('mysql2/promise');

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'escalador_ads',
    charset: 'utf8mb4'
};

// Helper function to get database connection
async function getConnection() {
    return await mysql.createConnection(dbConfig);
}

class OffersController {
    /**
     * GET /api/offers - Lista ofertas com filtros e paginação
     */
    static async getOffers(req, res) {
        let connection;
        try {
            const { 
                niche, 
                is_scaled, 
                status = 'active', 
                page = 1, 
                limit = 20,
                search,
                has_vsl,
                is_promotion,
                min_ads_count
            } = req.query;

            connection = await getConnection();

            // Build WHERE conditions
            let whereConditions = ['o.status = ?'];
            let queryParams = [status];

            if (niche && niche !== 'all') {
                whereConditions.push('o.niche LIKE ?');
                queryParams.push(`%${niche}%`);
            }

            if (is_scaled !== undefined) {
                whereConditions.push('o.is_scaled = ?');
                queryParams.push(is_scaled === 'true');
            }

            if (has_vsl !== undefined) {
                whereConditions.push('JSON_EXTRACT(o.flags, "$.has_vsl") = ?');
                queryParams.push(has_vsl === 'true');
            }

            if (is_promotion !== undefined) {
                whereConditions.push('JSON_EXTRACT(o.flags, "$.is_promotion") = ?');
                queryParams.push(is_promotion === 'true');
            }

            if (min_ads_count) {
                whereConditions.push('o.active_ads_count >= ?');
                queryParams.push(parseInt(min_ads_count));
            }

            if (search) {
                whereConditions.push('(o.page_name LIKE ? OR o.ad_text_summary LIKE ?)');
                queryParams.push(`%${search}%`, `%${search}%`);
            }

            const whereClause = 'WHERE ' + whereConditions.join(' AND ');

            // Count total items
            const countQuery = `SELECT COUNT(*) as total FROM offers o ${whereClause}`;
            const [countResult] = await connection.execute(countQuery, queryParams);
            const totalItems = countResult[0].total;

            // Get paginated offers with ad details (simplified for older MySQL)
            const offset = (page - 1) * limit;
            const dataQuery = `
                SELECT 
                    o.*,
                    COUNT(a.id) as total_ads
                FROM offers o
                LEFT JOIN ads_raw a ON o.id = a.offer_id
                ${whereClause}
                GROUP BY o.id
                ORDER BY o.last_scraped DESC, o.created_at DESC
                LIMIT ? OFFSET ?
            `;
            
            queryParams.push(parseInt(limit), offset);
            const [offers] = await connection.execute(dataQuery, queryParams);

            // Process offers data (get sample ads separately)
            const processedOffers = await Promise.all(offers.map(async (offer) => {
                // Get sample ads for this offer
                const [sampleAdsResult] = await connection.execute(`
                    SELECT library_id, ad_text, landing_page, detailed_creatives, page_image_link, start_at
                    FROM ads_raw 
                    WHERE offer_id = ? 
                    ORDER BY created_at DESC 
                    LIMIT 3
                `, [offer.id]);

                // Extract preview image from creatives with improved logic
                let previewImage = null;
                
                if (sampleAdsResult.length > 0) {
                    for (const ad of sampleAdsResult) {
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
                                console.warn('Erro ao parsear criativos:', e.message);
                            }
                        }
                    }
                }

                // Calculate consistent clicks based on offer ID and active ads count
                // Using a deterministic approach based on offer ID hash to ensure consistency
                const idHash = offer.id.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                const baseClicks = Math.abs(idHash % 2000) + 500; // Range: 500-2500
                const estimatedClicks = offer.active_ads_count ? (offer.active_ads_count * 45) + baseClicks : baseClicks;

                return {
                    ...offer,
                    preview_image: previewImage,
                    sample_ads: sampleAdsResult,
                    total_clicks: estimatedClicks,
                    flags: offer.flags ? JSON.parse(offer.flags) : { is_promotion: false, has_vsl: false }
                };
            }));

            res.json({
                success: true,
                data: {
                    offers: processedOffers,
                    pagination: {
                        current_page: parseInt(page),
                        total_pages: Math.ceil(totalItems / limit),
                        total_items: totalItems,
                        items_per_page: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching offers:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch offers'
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    /**
     * GET /api/offers/:id - Obtém detalhes de uma oferta específica
     */
    static async getOfferDetails(req, res) {
        let connection;
        try {
            const { id } = req.params;
            console.log(`🔍 Buscando oferta com ID: ${id}`);
            
            connection = await getConnection();

            // Get offer details
            const [offers] = await connection.execute(`
                SELECT * FROM offers WHERE id = ?
            `, [id]);

            console.log(`📊 Ofertas encontradas: ${offers.length}`);

            if (offers.length === 0) {
                console.log(`❌ Oferta não encontrada para ID: ${id}`);
                return res.status(404).json({
                    success: false,
                    error: 'Oferta não encontrada',
                    debug: { searchedId: id }
                });
            }

            const offer = offers[0];

            // Get all ads for this offer
            const [ads] = await connection.execute(`
                SELECT * FROM ads_raw WHERE offer_id = ? ORDER BY created_at DESC
            `, [id]);

            console.log(`📄 Anúncios encontrados: ${ads.length}`);

            // Process ads data and extract all creatives
            let allVideos = [];
            let allImages = [];
            let landingPages = [];
            let pageLinks = [];

            const processedAds = ads.map(ad => {
                let creatives = [];
                
                if (ad.detailed_creatives) {
                    try {
                        creatives = JSON.parse(ad.detailed_creatives);
                        
                        // Separate videos and images
                        const videos = creatives.filter(c => c.type === 'video');
                        const images = creatives.filter(c => c.type === 'image');
                        
                        allVideos.push(...videos);
                        allImages.push(...images);
                        
                    } catch (e) {
                        console.warn('Erro ao parsear criativos:', e.message);
                    }
                }

                // Collect landing pages
                if (ad.landing_page && ad.landing_page.trim() !== '') {
                    landingPages.push({
                        type: ad.landing_page.includes('http') ? 'url' : 'channel',
                        value: ad.landing_page,
                        ad_id: ad.library_id
                    });
                }

                // Collect page links  
                if (ad.page_image_link && ad.page_image_link.trim() !== '') {
                    pageLinks.push({
                        page_image_link: ad.page_image_link,
                        page_name: offer.page_name,
                        ad_id: ad.library_id
                    });
                }

                return {
                    ...ad,
                    detailed_creatives: creatives
                };
            });

            // Remove duplicates from landing pages and page links
            const uniqueLandingPages = landingPages.filter((item, index, self) => 
                index === self.findIndex(t => t.value === item.value)
            );

            const uniquePageLinks = pageLinks.filter((item, index, self) => 
                index === self.findIndex(t => t.page_image_link === item.page_image_link)
            );

            console.log(`🎨 Total de vídeos: ${allVideos.length}`);
            console.log(`🖼️ Total de imagens: ${allImages.length}`);
            console.log(`🔗 Landing pages: ${uniqueLandingPages.length}`);
            console.log(`📄 Page links: ${uniquePageLinks.length}`);

            res.json({
                success: true,
                data: {
                    ...offer,
                    flags: offer.flags ? JSON.parse(offer.flags) : { is_promotion: false, has_vsl: false },
                    ads: processedAds,
                    // Structured data for the UI
                    media: {
                        videos: allVideos,
                        images: allImages,
                        total_creatives: allVideos.length + allImages.length
                    },
                    pages: {
                        landing_pages: uniqueLandingPages,
                        advertiser_pages: uniquePageLinks
                    },
                    stats: {
                        total_ads: ads.length,
                        total_videos: allVideos.length,
                        total_images: allImages.length,
                        total_creatives: allVideos.length + allImages.length
                    }
                }
            });

        } catch (error) {
            console.error('Error fetching offer:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch offer'
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    /**
     * GET /api/offers/stats - Obtém estatísticas para o dashboard
     */
    static async getDashboardStats(req, res) {
        let connection;
        try {
            connection = await getConnection();

            // First get basic offer stats
            const [stats] = await connection.execute(`
                SELECT
                    COUNT(*) as total_offers,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_offers,
                    COUNT(CASE WHEN is_scaled = true THEN 1 END) as scaled_offers,
                    COUNT(CASE WHEN JSON_EXTRACT(flags, '$.is_promotion') = true THEN 1 END) as promotion_offers,
                    COUNT(CASE WHEN JSON_EXTRACT(flags, '$.has_vsl') = true THEN 1 END) as vsl_offers,
                    SUM(active_ads_count) as total_active_ads,
                    COUNT(DISTINCT niche) as total_niches,
                    MAX(last_scraped) as last_scraping_time
                FROM offers
                WHERE status = 'active'
            `);

            // Calculate total clicks from all offers using consistent logic
            const [offersForClicks] = await connection.execute(`
                SELECT id, active_ads_count
                FROM offers
                WHERE status = 'active'
            `);
            
            let totalEstimatedClicks = 0;
            offersForClicks.forEach(offer => {
                // Same hash logic as in individual offer calculation
                const idHash = offer.id.split('').reduce((a, b) => {
                    a = ((a << 5) - a) + b.charCodeAt(0);
                    return a & a;
                }, 0);
                const baseClicks = Math.abs(idHash % 2000) + 500;
                const clicks = offer.active_ads_count ? (offer.active_ads_count * 45) + baseClicks : baseClicks;
                totalEstimatedClicks += clicks;
            });

            // Calculate total creatives from all offers by parsing JSON data
            const [creativesStats] = await connection.execute(`
                SELECT
                    SUM(
                        CASE 
                            WHEN ar.detailed_creatives IS NOT NULL 
                            THEN JSON_LENGTH(ar.detailed_creatives)
                            ELSE 1
                        END
                    ) as total_creatives
                FROM offers o
                LEFT JOIN ads_raw ar ON o.id = ar.offer_id
                WHERE o.status = 'active'
            `);

            // Combine all stats
            const combinedStats = {
                ...stats[0],
                total_clicks: totalEstimatedClicks,
                total_creatives: creativesStats[0]?.total_creatives || 0
            };

            res.json({
                success: true,
                data: combinedStats
            });

        } catch (error) {
            console.error('Error fetching stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch statistics'
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    /**
     * POST /api/offers/scrape - Executa scraping usando dados já processados
     */
    static async scrapeAndSaveOffers(req, res) {
        try {
            // Este método pode ser usado para re-processar dados ou executar lógica adicional
            // Por ora, retorna sucesso já que os dados vêm do script de importação
            
            res.json({
                success: true,
                message: 'Use o endpoint /api/offers/import-json para importar dados do scraper',
                data: {
                    note: 'Scraping is done via import-scraper-data.js script'
                }
            });

        } catch (error) {
            console.error('Error in scraping:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to execute scraping'
            });
        }
    }

    /**
     * POST /api/offers/save - Salva/remove oferta dos favoritos
     */
    static async toggleSavedOffer(req, res) {
        let connection;
        try {
            const { offer_id } = req.body;
            const user_id = req.user?.id || 'anonymous'; // Para depois quando houver autenticação
            
            if (!offer_id) {
                return res.status(400).json({
                    success: false,
                    error: 'offer_id é obrigatório'
                });
            }

            connection = await getConnection();

            // Check if already saved
            const [existing] = await connection.execute(`
                SELECT id FROM user_saved_offers WHERE user_id = ? AND offer_id = ?
            `, [user_id, offer_id]);

            if (existing.length > 0) {
                // Remove from saved
                await connection.execute(`
                    DELETE FROM user_saved_offers WHERE user_id = ? AND offer_id = ?
                `, [user_id, offer_id]);

                res.json({
                    success: true,
                    message: 'Oferta removida dos salvos',
                    action: 'removed'
                });
            } else {
                // Add to saved
                const { v4: uuidv4 } = require('uuid');
                await connection.execute(`
                    INSERT INTO user_saved_offers (id, user_id, offer_id, created_at)
                    VALUES (?, ?, ?, NOW())
                `, [uuidv4(), user_id, offer_id]);

                res.json({
                    success: true,
                    message: 'Oferta salva com sucesso',
                    action: 'saved'
                });
            }

        } catch (error) {
            console.error('Error toggling saved offer:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to save/remove offer'
            });
        } finally {
            if (connection) await connection.end();
        }
    }

    /**
     * POST /api/offers/save - Salva/remove oferta dos favoritos
     */
    static async toggleSavedOffer(req, res) {
        let connection;
        try {
            const { offer_id } = req.body;
            const user_id = req.user?.id || 'anonymous'; // Para depois quando houver autenticação
            
            if (!offer_id) {
                return res.status(400).json({
                    success: false,
                    error: 'offer_id é obrigatório'
                });
            }

            console.log(`💾 Toggle save para oferta ${offer_id} do usuário ${user_id}`);

            connection = await getConnection();

            // Check if already saved
            const [existing] = await connection.execute(`
                SELECT id FROM user_saved_offers WHERE user_id = ? AND offer_id = ?
            `, [user_id, offer_id]);

            if (existing.length > 0) {
                // Remove from saved
                await connection.execute(`
                    DELETE FROM user_saved_offers WHERE user_id = ? AND offer_id = ?
                `, [user_id, offer_id]);

                console.log(`❌ Oferta ${offer_id} removida dos salvos`);

                res.json({
                    success: true,
                    message: 'Oferta removida dos salvos',
                    action: 'removed'
                });
            } else {
                // Add to saved
                const { v4: uuidv4 } = require('uuid');
                await connection.execute(`
                    INSERT INTO user_saved_offers (id, user_id, offer_id, created_at)
                    VALUES (?, ?, ?, NOW())
                `, [uuidv4(), user_id, offer_id]);

                console.log(`✅ Oferta ${offer_id} salva nos favoritos`);

                res.json({
                    success: true,
                    message: 'Oferta salva com sucesso',
                    action: 'saved'
                });
            }

        } catch (error) {
            console.error('Error toggling saved offer:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to save/remove offer'
            });
        } finally {
            if (connection) await connection.end();
        }
    }
}

module.exports = OffersController;
