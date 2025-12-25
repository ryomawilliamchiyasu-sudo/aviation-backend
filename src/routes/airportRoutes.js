const express = require('express');
const AirportController = require('../controllers/airportController');

const router = express.Router();

/**
 * @route   GET /api/airports/search?q=query
 * @purpose Search airports by name, city, ICAO, or IATA
 * @query   q (string) - Search query (min 2 characters)
 * @returns {Object} { query, count, results[] }
 */
router.get('/search', AirportController.search);

/**
 * @route   GET /api/airports/province/:province
 * @purpose Get airports by province code
 * @param   province (string) - 2-letter province code (ON, BC, AB, etc.)
 * @returns {Object} { province, count, airports[] }
 */
router.get('/province/:province', AirportController.getByProvince);

/**
 * @route   GET /api/airports/:icao
 * @purpose Get complete airport details by ICAO code
 * @param   icao (string) - ICAO code (e.g., CYYZ)
 * @returns {Object} { status, data: Airport }
 */
router.get('/:icao', AirportController.getByIcao);

/**
 * @route   GET /api/airports
 * @purpose Get all airports (summary)
 * @returns {Object} { count, airports[] }
 */
router.get('/', AirportController.getAll);

module.exports = router;
