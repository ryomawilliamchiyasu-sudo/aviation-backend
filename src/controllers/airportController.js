const AirportService = require('../services/airportService');

class AirportController {
  /**
   * Search airports
   * GET /api/airports/search?q=query
   */
  static search(req, res) {
    try {
      const { q } = req.query;

      // Validate query parameter
      if (!q) {
        return res.status(400).json({
          error: 'Missing search query parameter "q"',
          example: '/api/airports/search?q=toronto'
        });
      }

      if (q.length < 2) {
        return res.status(400).json({
          error: 'Search query must be at least 2 characters'
        });
      }

      const results = AirportService.search(q);

      // Return results with metadata
      return res.json({
        query: q,
        count: results.length,
        results: results.map(airport => ({
          icao: airport.icao,
          iata: airport.iata,
          name: airport.name,
          city: airport.city,
          province: airport.province,
          latitude: airport.latitude,
          longitude: airport.longitude
        }))
      });
    } catch (error) {
      console.error('Airport search error:', error);
      return res.status(500).json({
        error: 'Internal server error during airport search'
      });
    }
  }

  /**
   * Get airport details by ICAO code
   * GET /api/airports/:icao
   */
  static getByIcao(req, res) {
    try {
      const { icao } = req.params;

      // Validate ICAO parameter
      if (!icao || icao.length < 2) {
        return res.status(400).json({
          error: 'Invalid ICAO code',
          example: '/api/airports/CYYZ'
        });
      }

      const airport = AirportService.getByIcao(icao);

      if (!airport) {
        return res.status(404).json({
          error: `Airport with ICAO code "${icao.toUpperCase()}" not found`,
          suggestion: 'Try searching first: /api/airports/search?q=toronto'
        });
      }

      return res.json({
        status: 'ok',
        data: airport
      });
    } catch (error) {
      console.error('Airport details error:', error);
      return res.status(500).json({
        error: 'Internal server error retrieving airport details'
      });
    }
  }

  /**
   * Get all airports
   * GET /api/airports
   */
  static getAll(req, res) {
    try {
      const airports = AirportService.getAll();

      return res.json({
        count: airports.length,
        airports: airports.map(airport => ({
          icao: airport.icao,
          iata: airport.iata,
          name: airport.name,
          city: airport.city,
          province: airport.province,
          latitude: airport.latitude,
          longitude: airport.longitude,
          elevation: airport.elevationFeet
        }))
      });
    } catch (error) {
      console.error('Get all airports error:', error);
      return res.status(500).json({
        error: 'Internal server error retrieving airports'
      });
    }
  }

  /**
   * Get airports by province
   * GET /api/airports/province/:province
   */
  static getByProvince(req, res) {
    try {
      const { province } = req.params;

      if (!province || province.length !== 2) {
        return res.status(400).json({
          error: 'Invalid province code (must be 2 characters)',
          example: '/api/airports/province/ON'
        });
      }

      const airports = AirportService.getByProvince(province);

      if (airports.length === 0) {
        return res.status(404).json({
          error: `No airports found for province "${province.toUpperCase()}"`
        });
      }

      return res.json({
        province: province.toUpperCase(),
        count: airports.length,
        airports: airports.map(airport => ({
          icao: airport.icao,
          iata: airport.iata,
          name: airport.name,
          city: airport.city,
          latitude: airport.latitude,
          longitude: airport.longitude,
          elevation: airport.elevationFeet
        }))
      });
    } catch (error) {
      console.error('Get airports by province error:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  }
}

module.exports = AirportController;
