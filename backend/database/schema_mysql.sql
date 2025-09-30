-- Escalador Database Schema
-- MySQL

-- Create database (run this separately if needed)
-- CREATE DATABASE escalador CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE escalador;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Advertisers table
CREATE TABLE advertisers (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(255) NOT NULL,
    page_id VARCHAR(100) UNIQUE,
    page_url VARCHAR(500),
    category VARCHAR(100),
    country VARCHAR(10),
    is_verified BOOLEAN DEFAULT false,
    total_ads INTEGER DEFAULT 0,
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Campaigns table (grouped ads by advertiser + similar content)
CREATE TABLE campaigns (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    advertiser_id VARCHAR(36),
    title VARCHAR(500) NOT NULL,
    niche VARCHAR(100),
    language VARCHAR(10) DEFAULT 'pt-BR',
    countries JSON, -- JSON array of country codes
    platforms JSON, -- JSON array: Facebook, Instagram, etc.
    ad_format VARCHAR(50), -- VSL, UGC, Static, Carousel, etc.
    funnel_type VARCHAR(50), -- Landing Page, E-commerce, Lead Gen, etc.
    
    -- Metrics
    total_creatives INTEGER DEFAULT 0,
    total_clicks INTEGER DEFAULT 0,
    estimated_spend INTEGER DEFAULT 0,
    
    -- Status
    is_scaling BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    
    -- Dates
    first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id) ON DELETE CASCADE
);

-- Creatives table (individual ads)
CREATE TABLE creatives (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    campaign_id VARCHAR(36),
    advertiser_id VARCHAR(36),
    
    -- Facebook data
    fb_ad_id VARCHAR(100) UNIQUE,
    fb_page_id VARCHAR(100),
    
    -- Content
    ad_text TEXT,
    headline VARCHAR(500),
    description TEXT,
    call_to_action VARCHAR(100),
    landing_page_url TEXT,
    
    -- Media
    image_urls JSON, -- JSON array of image URLs
    video_url VARCHAR(500),
    media_type VARCHAR(20), -- image, video, carousel
    
    -- Metadata
    language VARCHAR(10),
    countries JSON,
    platforms JSON,
    
    -- Metrics (estimated/scraped)
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    ctr DECIMAL(5,2) DEFAULT 0,
    estimated_spend INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Dates
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (advertiser_id) REFERENCES advertisers(id) ON DELETE CASCADE
);

-- User favorites
CREATE TABLE user_favorites (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36),
    campaign_id VARCHAR(36),
    tags JSON, -- JSON array of user custom tags
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_campaign (user_id, campaign_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

-- Scraping logs
CREATE TABLE scraping_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    status VARCHAR(50) NOT NULL, -- started, completed, failed
    total_ads_found INTEGER DEFAULT 0,
    new_ads_added INTEGER DEFAULT 0,
    updated_ads INTEGER DEFAULT 0,
    errors_count INTEGER DEFAULT 0,
    error_message TEXT,
    duration_seconds INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

-- Indexes for performance
CREATE INDEX idx_campaigns_advertiser_id ON campaigns(advertiser_id);
CREATE INDEX idx_campaigns_niche ON campaigns(niche);
CREATE INDEX idx_campaigns_is_scaling ON campaigns(is_scaling);
CREATE INDEX idx_campaigns_last_seen ON campaigns(last_seen);

CREATE INDEX idx_creatives_campaign_id ON creatives(campaign_id);
CREATE INDEX idx_creatives_fb_ad_id ON creatives(fb_ad_id);
CREATE INDEX idx_creatives_is_active ON creatives(is_active);
CREATE INDEX idx_creatives_scraped_at ON creatives(scraped_at);

CREATE INDEX idx_advertisers_page_id ON advertisers(page_id);
CREATE INDEX idx_advertisers_total_ads ON advertisers(total_ads);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
