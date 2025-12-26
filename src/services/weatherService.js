const https = require('https');
const { normalizeMetar, normalizeTaf } = require('../normalizers/aviationDataNormalizer');
const { cache } = require('../cache/cacheManager');

class WeatherService {
  // Base URL for aviationweather.gov API
  static BASE_URL = 'https://aviationweather.gov/api/data';

  /**
   * Validate ICAO code format
   * @param {string} icao - ICAO code to validate
   * @returns {boolean} True if valid 4-letter code
   */
  static validateIcao(icao) {
    if (!icao || typeof icao !== 'string') return false;
    return /^[A-Z]{4}$/.test(icao.toUpperCase());
  }

  /**
   * Helper to make HTTPS requests
   * @private
   */
  static _makeRequest(url) {
    return new Promise((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, 10000);

      https.get(url, { headers: { 'User-Agent': 'aviation-backend/1.0' } }, (res) => {
        clearTimeout(timeoutHandle);
        let data = '';

        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        });
      }).on('error', err => {
        clearTimeout(timeoutHandle);
        reject(err);
      });
    });
  }

  /**
   * Fetch METAR data from aviationweather.gov
   * @param {string} icao - Airport ICAO code
   * @returns {Object} METAR data or error object
   */
  static async getMetar(icao) {
    try {
      const upperIcao = icao.toUpperCase();

      if (!this.validateIcao(upperIcao)) {
        return {
          error: true,
          message: 'Invalid ICAO code. Must be exactly 4 letters.',
          example: 'CYYZ'
        };
      }

      // Check cache first
      const cachedMetar = cache.getMetar(upperIcao);
      if (cachedMetar) {
        console.log(`📊 Using cached METAR for ${upperIcao}`);
        return cachedMetar;
      }

      const url = `${this.BASE_URL}/metar?ids=${upperIcao}&format=json`;
      const { status, body } = await this._makeRequest(url);

      if (status !== 200) {
        return {
          error: true,
          message: `Aviation Weather API error: ${status}`,
          status: status
        };
      }

      // API returns array directly
      if (!Array.isArray(body) || body.length === 0) {
        return {
          error: true,
          message: `No METAR data found for airport ${upperIcao}`,
          icao: upperIcao
        };
      }

      const metar = body[0];
      const formatted = this._formatMetarResponse(metar);
      
      // Cache the formatted (already-normalized) data
      cache.cacheMetar(upperIcao, formatted);
      
      return formatted;
    } catch (error) {
      console.error('METAR fetch error:', error.message);
      return {
        error: true,
        message: 'Failed to fetch METAR data',
        detail: error.message
      };
    }
  }

  /**
   * Fetch TAF data from aviationweather.gov
   * @param {string} icao - Airport ICAO code
   * @returns {Object} TAF data or error object
   */
  static async getTaf(icao) {
    try {
      const upperIcao = icao.toUpperCase();

      if (!this.validateIcao(upperIcao)) {
        return {
          error: true,
          message: 'Invalid ICAO code. Must be exactly 4 letters.',
          example: 'CYYZ'
        };
      }

      const url = `${this.BASE_URL}/taf?ids=${upperIcao}&format=json`;
      const { status, body } = await this._makeRequest(url);

      if (status !== 200) {
        return {
          error: true,
          message: `Aviation Weather API error: ${status}`,
          status: status
        };
      }

      if (!Array.isArray(body) || body.length === 0) {
        return {
          error: true,
          message: `No TAF data found for airport ${upperIcao}`,
          icao: upperIcao
        };
      }

      const taf = body[0];
      return this._formatTafResponse(taf);
    } catch (error) {
      console.error('TAF fetch error:', error.message);
      return {
        error: true,
        message: 'Failed to fetch TAF data',
        detail: error.message
      };
    }
  }

  /**
   * Format METAR response for frontend
   * @private
   */
  static _formatMetarResponse(metar) {
    return {
      icao: metar.icaoId,
      timestamp: metar.reportTime || null,
      rawText: metar.rawOb || '',
      // Decoded fields
      wind: {
        direction: metar.wdir || null,
        speed: metar.wspd || null,
        gust: metar.wgst || null,
        unit: 'knots'
      },
      visibility: {
        miles: metar.visib || null,
        meters: null,
        unit: 'statute miles'
      },
      temperature: {
        celsius: metar.temp || null,
        fahrenheit: metar.temp ? (metar.temp * 9/5) + 32 : null
      },
      dewpoint: {
        celsius: metar.dewp || null,
        fahrenheit: metar.dewp ? (metar.dewp * 9/5) + 32 : null
      },
      altimeter: {
        inchesHg: metar.altim || null,
        hectopascals: null
      },
      flightCategory: metar.flightCategory || 'UNKNOWN',
      // Ceiling from cloud data
      ceiling: metar.clouds ? this._extractCeiling(metar.clouds) : null,
      clouds: metar.clouds || [],
      // Other conditions
      remarks: metar.rmk || null,
      station: {
        name: metar.name || '',
        lat: metar.lat || null,
        lon: metar.lon || null,
        elev: metar.elev || null
      }
    };
  }

  /**
   * Format TAF response for frontend
   * @private
   */
  static _formatTafResponse(taf) {
    return {
      icao: taf.icaoId,
      timestamp: taf.issueTime || null,
      validPeriod: {
        start: taf.validTimeFrom || null,
        end: taf.validTimeTo || null
      },
      rawText: taf.rawOb || '',
      forecastGroups: taf.fcstLines ? taf.fcstLines.map(line => ({
        timeRange: {
          start: line.validFrom || null,
          end: line.validTo || null
        },
        wind: {
          direction: line.wdir || null,
          speed: line.wspd || null,
          gust: line.wgst || null,
          unit: 'knots'
        },
        visibility: {
          miles: line.visib || null
        },
        weather: line.weather || [],
        clouds: line.clouds || [],
        ceiling: this._extractCeiling(line.clouds),
        changeIndicator: line.chgIndicator || null
      })) : []
    };
  }

  /**
   * Extract ceiling from cloud layers
   * Ceiling = lowest cloud layer at or above 5,000 feet that is broken or overcast
   * @private
   */
  static _extractCeiling(clouds) {
    if (!clouds || !Array.isArray(clouds)) return null;

    for (const cloud of clouds) {
      const coverage = cloud.cover || '';
      const altitude = cloud.base || 0;

      // Ceiling is the lowest BKN (broken) or OVC (overcast) layer >= 5000 ft
      if (altitude >= 5000 && (coverage === 'BKN' || coverage === 'OVC')) {
        return {
          altitude: altitude,
          coverage: coverage,
          unit: 'feet'
        };
      }
    }

    return null;
  }

  /**
   * Get combined METAR and TAF
   * @param {string} icao - Airport ICAO code
   * @returns {Object} Combined weather data
   */
  static async getCombined(icao) {
    const [metar, taf] = await Promise.all([
      this.getMetar(icao),
      this.getTaf(icao)
    ]);

    return {
      icao: icao.toUpperCase(),
      metar: metar.error ? null : metar,
      taf: taf.error ? null : taf,
      errors: {
        metar: metar.error ? metar.message : null,
        taf: taf.error ? taf.message : null
      }
    };
  }
}

module.exports = WeatherService;
