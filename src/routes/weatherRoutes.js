const express = require('express');
const WeatherController = require('../controllers/weatherController');

const router = express.Router();

/**
 * IMPORTANT: Specific routes MUST come before catch-all routes!
 * Order: /metar/:icao → /taf/:icao → /:icao (catch-all)
 * Otherwise Express will match /:icao for all requests
 */

/**
 * @route   GET /api/weather/metar/:icao
 * @purpose Get METAR (Meteorological Aerodrome Report) for an airport
 * @param   icao (string) - 4-letter ICAO code (e.g., CYYZ)
 * @returns {Object} { status, type: 'METAR', data }
 * @example GET /api/weather/metar/KSFO
 * @source  aviationweather.gov (real-time FAA/NavCanada data)
 */
router.get('/metar/:icao', WeatherController.getMetar);

/**
 * @route   GET /api/weather/taf/:icao
 * @purpose Get TAF (Terminal Aerodrome Forecast) for an airport
 * @param   icao (string) - 4-letter ICAO code (e.g., CYYZ)
 * @returns {Object} { status, type: 'TAF', data }
 * @example GET /api/weather/taf/KSFO
 * @source  aviationweather.gov (real-time forecast data)
 */
router.get('/taf/:icao', WeatherController.getTaf);

/**
 * @route   GET /api/weather/:icao
 * @purpose Get combined METAR + TAF for comprehensive weather briefing
 * @param   icao (string) - 4-letter ICAO code (e.g., CYYZ)
 * @returns {Object} { status, data: { icao, metar, taf, errors } }
 * @example GET /api/weather/KSFO
 * @note    Returns null for either if unavailable, with error details
 * @note    MUST come LAST because it's a catch-all pattern
 */
router.get('/:icao', WeatherController.getCombined);

module.exports = router;
