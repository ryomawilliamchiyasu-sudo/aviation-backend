const express = require('express');
const WeatherController = require('../controllers/weatherController');

const router = express.Router();

/**
 * @route   GET /api/weather/metar/:icao
 * @purpose Get METAR (Meteorological Aerodrome Report) for an airport
 * @param   icao (string) - 4-letter ICAO code (e.g., CYYZ)
 * @returns {Object} { status, type: 'METAR', data }
 * @example GET /api/weather/metar/CYYZ
 * @source  aviationweather.gov (real-time FAA/NavCanada data)
 */
router.get('/metar/:icao', WeatherController.getMetar);

/**
 * @route   GET /api/weather/taf/:icao
 * @purpose Get TAF (Terminal Aerodrome Forecast) for an airport
 * @param   icao (string) - 4-letter ICAO code (e.g., CYYZ)
 * @returns {Object} { status, type: 'TAF', data }
 * @example GET /api/weather/taf/CYYZ
 * @source  aviationweather.gov (real-time forecast data)
 */
router.get('/taf/:icao', WeatherController.getTaf);

/**
 * @route   GET /api/weather/:icao
 * @purpose Get combined METAR + TAF for comprehensive weather briefing
 * @param   icao (string) - 4-letter ICAO code (e.g., CYYZ)
 * @returns {Object} { status, data: { icao, metar, taf, errors } }
 * @example GET /api/weather/CYYZ
 * @note    Returns null for either if unavailable, with error details
 */
router.get('/:icao', WeatherController.getCombined);

module.exports = router;
