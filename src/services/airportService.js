const fs = require('fs');
const path = require('path');

// Load airports data
const airportsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/airports.json'), 'utf-8')
);

class AirportService {
  /**
   * Search airports by name, city, ICAO, or IATA code
   * @param {string} query - Search query
   * @returns {Array} Matching airports
   */
  static search(query) {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const lowerQuery = query.toLowerCase().trim();

    return airportsData.airports.filter(airport => {
      return (
        airport.icao.toLowerCase().includes(lowerQuery) ||
        airport.iata.toLowerCase().includes(lowerQuery) ||
        airport.name.toLowerCase().includes(lowerQuery) ||
        airport.city.toLowerCase().includes(lowerQuery)
      );
    });
  }

  /**
   * Get airport details by ICAO code
   * @param {string} icao - ICAO code (e.g., CYYZ)
   * @returns {Object|null} Airport object or null if not found
   */
  static getByIcao(icao) {
    if (!icao || icao.trim().length === 0) {
      return null;
    }

    return airportsData.airports.find(
      airport => airport.icao.toUpperCase() === icao.toUpperCase()
    ) || null;
  }

  /**
   * Get airport details by IATA code
   * @param {string} iata - IATA code (e.g., YYZ)
   * @returns {Object|null} Airport object or null if not found
   */
  static getByIata(iata) {
    if (!iata || iata.trim().length === 0) {
      return null;
    }

    return airportsData.airports.find(
      airport => airport.iata.toUpperCase() === iata.toUpperCase()
    ) || null;
  }

  /**
   * Get all airports
   * @returns {Array} All airports
   */
  static getAll() {
    return airportsData.airports;
  }

  /**
   * Get airports by province
   * @param {string} province - Province code (e.g., ON, BC, AB)
   * @returns {Array} Airports in that province
   */
  static getByProvince(province) {
    if (!province) return [];

    return airportsData.airports.filter(
      airport => airport.province.toUpperCase() === province.toUpperCase()
    );
  }
}

module.exports = AirportService;
