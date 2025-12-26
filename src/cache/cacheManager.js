/**
 * In-Memory Cache with TTL support
 * Stores weather, NOTAM, and airport data with automatic expiration
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Set cache value with TTL (Time To Live)
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds
   */
  set(key, value, ttlSeconds = 300) {
    // Clear existing timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Store value
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
      createdAt: Date.now(),
      ttl: ttlSeconds,
    });

    // Set expiration timer
    const timer = setTimeout(() => this.delete(key), ttlSeconds * 1000);
    this.timers.set(key, timer);

    console.log(`✅ Cached: ${key} (TTL: ${ttlSeconds}s)`);
  }

  /**
   * Get cache value if not expired
   * @param {string} key - Cache key
   * @returns {any|null} Value or null if expired/missing
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check expiration
    if (Date.now() > item.expiresAt) {
      this.delete(key);
      return null;
    }

    console.log(`✅ Cache HIT: ${key}`);
    return item.value;
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Delete cache entry
   * @param {string} key - Cache key
   */
  delete(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    this.cache.delete(key);
    console.log(`🗑️  Cache deleted: ${key}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.cache.clear();
    this.timers.clear();
    console.log('🗑️  Cache cleared');
  }

  /**
   * Get cache stats
   * @returns {Object} Cache statistics
   */
  getStats() {
    const stats = {
      totalKeys: this.cache.size,
      entries: [],
    };

    for (const [key, item] of this.cache) {
      stats.entries.push({
        key,
        createdAt: new Date(item.createdAt).toISOString(),
        expiresAt: new Date(item.expiresAt).toISOString(),
        ttl: item.ttl,
        ageSeconds: Math.round((Date.now() - item.createdAt) / 1000),
      });
    }

    return stats;
  }
}

/**
 * Specialized cache for aviation data with default TTLs
 */
class AviationCacheManager extends CacheManager {
  // Default TTLs based on data type
  static TTL = {
    METAR: 300,      // 5 minutes
    TAF: 1800,       // 30 minutes
    NOTAM: 600,      // 10 minutes
    AIRPORT: 3600,   // 1 hour
    WEATHER_BATCH: 300, // 5 minutes
  };

  /**
   * Cache METAR data
   * @param {string} icao - Airport ICAO code
   * @param {Object} metarData - METAR data
   */
  cacheMetar(icao, metarData) {
    const key = `metar:${icao}`;
    this.set(key, metarData, AviationCacheManager.TTL.METAR);
  }

  /**
   * Get cached METAR data
   * @param {string} icao - Airport ICAO code
   * @returns {Object|null}
   */
  getMetar(icao) {
    return this.get(`metar:${icao}`);
  }

  /**
   * Cache TAF data
   * @param {string} icao - Airport ICAO code
   * @param {Object} tafData - TAF data
   */
  cacheTaf(icao, tafData) {
    const key = `taf:${icao}`;
    this.set(key, tafData, AviationCacheManager.TTL.TAF);
  }

  /**
   * Get cached TAF data
   * @param {string} icao - Airport ICAO code
   * @returns {Object|null}
   */
  getTaf(icao) {
    return this.get(`taf:${icao}`);
  }

  /**
   * Cache NOTAM data
   * @param {string} icao - Airport ICAO code
   * @param {Array} notamData - NOTAMs array
   */
  cacheNotams(icao, notamData) {
    const key = `notam:${icao}`;
    this.set(key, notamData, AviationCacheManager.TTL.NOTAM);
  }

  /**
   * Get cached NOTAMs
   * @param {string} icao - Airport ICAO code
   * @returns {Array|null}
   */
  getNotams(icao) {
    return this.get(`notam:${icao}`);
  }

  /**
   * Cache airport data
   * @param {string} icao - Airport ICAO code
   * @param {Object} airportData - Airport data
   */
  cacheAirport(icao, airportData) {
    const key = `airport:${icao}`;
    this.set(key, airportData, AviationCacheManager.TTL.AIRPORT);
  }

  /**
   * Get cached airport data
   * @param {string} icao - Airport ICAO code
   * @returns {Object|null}
   */
  getAirport(icao) {
    return this.get(`airport:${icao}`);
  }

  /**
   * Invalidate all data for an airport
   * @param {string} icao - Airport ICAO code
   */
  invalidateAirport(icao) {
    this.delete(`metar:${icao}`);
    this.delete(`taf:${icao}`);
    this.delete(`notam:${icao}`);
    this.delete(`airport:${icao}`);
    console.log(`📍 Invalidated cache for ${icao}`);
  }
}

// Global cache instance
const cache = new AviationCacheManager();

module.exports = {
  CacheManager,
  AviationCacheManager,
  cache,
};
