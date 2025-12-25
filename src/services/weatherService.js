const fetch = require('node-fetch');

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

      const url = `${this.BASE_URL}/metar?ids=${upperIcao}&format=json`;
      const response = await fetch(url, {
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'aviation-backend/1.0'
        }
      });

      if (!response.ok) {
        return {
          error: true,
          message: `Aviation Weather API error: ${response.status}`,
          status: response.status
        };
      }

      const data = await response.json();

      // API returns array of results
      if (!data.Results || data.Results.length === 0) {
        return {
          error: true,
          message: `No METAR data found for airport ${upperIcao}`,
          icao: upperIcao
        };
      }

      const metar = data.Results[0];
      return this._formatMetarResponse(metar);
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
      const response = await fetch(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'aviation-backend/1.0'
        }
      });

      if (!response.ok) {
        return {
          error: true,
          message: `Aviation Weather API error: ${response.status}`,
          status: response.status
        };
      }

      const data = await response.json();

      if (!data.Results || data.Results.length === 0) {
        return {
          error: true,
          message: `No TAF data found for airport ${upperIcao}`,
          icao: upperIcao
        };
      }

      const taf = data.Results[0];
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
      timestamp: metar.obsTime?.dt || null,
      rawText: metar.rawText || '',
      // Decoded fields
      wind: {
        direction: metar.wdir?.value || null,
        speed: metar.wspd?.value || null,
        gust: metar.wgst?.value || null,
        unit: 'knots'
      },
      visibility: {
        miles: metar.visibility?.value || null,
        meters: metar.visibility?.value ? metar.visibility.value * 1609.34 : null,
        unit: 'miles'
      },
      temperature: {
        celsius: metar.temp?.value || null,
        fahrenheit: metar.temp?.value ? (metar.temp.value * 9/5) + 32 : null
      },
      dewpoint: {
        celsius: metar.dewp?.value || null,
        fahrenheit: metar.dewp?.value ? (metar.dewp.value * 9/5) + 32 : null
      },
      altimeter: {
        inchesHg: metar.altim?.value || null,
        hectopascals: metar.altim?.value ? metar.altim.value * 33.8639 : null
      },
      flightCategory: metar.flightCategory || 'UNKNOWN',
      // Ceiling - estimate from cloud layers
      ceiling: this._extractCeiling(metar.clouds),
      clouds: metar.clouds || [],
      // Other conditions
      remarks: metar.rmk || null
    };
  }

  /**
   * Format TAF response for frontend
   * @private
   */
  static _formatTafResponse(taf) {
    return {
      icao: taf.icaoId,
      timestamp: taf.issueTime?.dt || null,
      validPeriod: {
        start: taf.validTimeFrom?.dt || null,
        end: taf.validTimeTo?.dt || null
      },
      rawText: taf.rawText || '',
      // Forecast groups
      forecastGroups: taf.fcstLines ? taf.fcstLines.map(line => ({
        timeRange: {
          start: line.timeRange?.from?.dt || null,
          end: line.timeRange?.to?.dt || null
        },
        wind: {
          direction: line.wdir?.value || null,
          speed: line.wspd?.value || null,
          gust: line.wgst?.value || null,
          unit: 'knots'
        },
        visibility: {
          miles: line.visibility?.value || null
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
      const altitude = cloud.base?.value || 0;

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
