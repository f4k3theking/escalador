-- Escalador - Offers Database Schema
-- MySQL

-- Tabela de ofertas (estrutura principal do sistema)
CREATE TABLE IF NOT EXISTS offers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    niche VARCHAR(100) NOT NULL,
    offer_signature VARCHAR(500) NOT NULL UNIQUE,
    is_scaled BOOLEAN DEFAULT false,
    active_ads_count INT DEFAULT 0,
    page_name VARCHAR(255),
    page_id VARCHAR(100),
    snapshot_url TEXT,
    ad_text_summary TEXT,
    status ENUM('active', 'inactive', 'paused') DEFAULT 'active',
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    
    -- Flags JSON (is_promotion, has_vsl)
    flags JSON,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_scraped TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_niche (niche),
    INDEX idx_is_scaled (is_scaled),
    INDEX idx_status (status),
    INDEX idx_active_ads_count (active_ads_count),
    INDEX idx_offer_signature (offer_signature),
    INDEX idx_last_scraped (last_scraped)
);

-- Tabela de anúncios individuais (raw data do scraper)
CREATE TABLE IF NOT EXISTS ads_raw (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    offer_id VARCHAR(36),
    
    -- Dados do Facebook Ad Library (via scraper)
    library_id VARCHAR(100) UNIQUE,
    ad_text TEXT,
    ad_description TEXT,
    advertiser_name VARCHAR(255),
    page_name VARCHAR(255),
    page_id VARCHAR(100),
    page_image_link TEXT,
    landing_page TEXT,
    start_at VARCHAR(255),
    result_count INT DEFAULT 0,
    is_scaled BOOLEAN DEFAULT false,
    
    -- Dados de criativos (JSON)
    detailed_creatives JSON,
    creative_count_detailed INT DEFAULT 0,
    
    -- Metadados
    keyword VARCHAR(100),
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    INDEX idx_offer_id (offer_id),
    INDEX idx_library_id (library_id),
    INDEX idx_page_id (page_id),
    INDEX idx_is_scaled (is_scaled),
    INDEX idx_scraped_at (scraped_at)
);

-- Tabela de logs de scraping
CREATE TABLE IF NOT EXISTS scraping_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    status ENUM('started', 'completed', 'failed') NOT NULL,
    search_terms JSON,
    total_ads_found INT DEFAULT 0,
    total_offers_created INT DEFAULT 0,
    total_offers_updated INT DEFAULT 0,
    scaled_offers_found INT DEFAULT 0,
    errors_count INT DEFAULT 0,
    error_message TEXT,
    duration_seconds INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    INDEX idx_status (status),
    INDEX idx_started_at (started_at)
);

-- Tabela de usuários salvos/favoritos
CREATE TABLE IF NOT EXISTS user_saved_offers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36), -- Será implementado quando houver autenticação
    offer_id VARCHAR(36) NOT NULL,
    tags JSON, -- Tags customizadas pelo usuário
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
    INDEX idx_offer_id (offer_id),
    INDEX idx_user_id (user_id)
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_config (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value JSON,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_config_key (config_key)
);

-- Inserir configurações padrão
INSERT IGNORE INTO system_config (config_key, config_value, description) VALUES
('meta_api_credentials', '{"app_id": "23930007850034120", "app_secret": "6c8e38c9ce32a864ad9902825759a8d4"}', 'Credenciais da Meta Ad Library API'),
('search_terms_default', '["emagrecimento", "dieta", "fitness", "suplementos", "academia", "saúde masculina", "estética", "beleza"]', 'Termos de busca padrão'),
('scraping_config', '{"min_scaled_ads": 10, "delay_between_requests": 1000, "max_ads_per_term": 1000}', 'Configurações de scraping');

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    COUNT(*) as total_offers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_offers,
    COUNT(CASE WHEN is_scaled = true THEN 1 END) as scaled_offers,
    COUNT(CASE WHEN JSON_EXTRACT(flags, '$.is_promotion') = true THEN 1 END) as promotion_offers,
    COUNT(CASE WHEN JSON_EXTRACT(flags, '$.has_vsl') = true THEN 1 END) as vsl_offers,
    SUM(active_ads_count) as total_active_ads,
    COUNT(DISTINCT niche) as total_niches,
    MAX(last_scraped) as last_scraping_time
FROM offers;
