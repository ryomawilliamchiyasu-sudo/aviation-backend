/**
 * METAR Normalizer - Converts raw METAR string to structured JSON
 * Handles standard METAR format with consistent data structure
 */
function normalizeMetar(rawMetar) {
  if (!rawMetar) {
    return { error: 'No METAR data provided' };
  }

  const parts = rawMetar.trim().split(/\s+/);
  const normalized = {
    icao: null,
    timestamp: new Date().toISOString(),
    wind: { direction: null, speed: null, gust: null, unit: 'knots' },
    visibility: { value: null, unit: 'statute miles' },
    ceiling: { altitude: null, coverage: null },
    temperature: { celsius: null, fahrenheit: null },
    dewpoint: { celsius: null, fahrenheit: null },
    altimeter: { inchesHg: null, hectopascals: null },
    flightCategory: null,
    clouds: [],
    remarks: null,
    rawText: rawMetar,
    normalizedAt: new Date().toISOString(),
  };

  let i = 0;

  // ICAO
  if (i < parts.length && /^[A-Z]{4}$/.test(parts[i])) {
    normalized.icao = parts[i];
    i++;
  }

  // Date/Time (skip)
  if (i < parts.length && /^\d{6}Z$/.test(parts[i])) {
    i++;
  }

  // Wind - Check for variable wind indicator (VRBxxKT) or standard (DDDSSKt or DDDSSGGKt)
  // Also skip wind direction if it's a letter code (like "CCA")
  if (i < parts.length && /^[A-Z]{3}$/.test(parts[i]) && (i + 1) < parts.length && /^(VRB|\d{3})\d{2}(G\d{2})?KT$/.test(parts[i + 1])) {
    // Skip variable wind indicator like "CCA" and get the next part
    i++;
  }
  
  if (i < parts.length && /^(VRB|\d{3})\d{2}(G\d{2})?KT$/.test(parts[i])) {
    const windMatch = parts[i].match(/^(VRB|\d{3})(\d{2})(?:G(\d{2}))?KT$/);
    if (windMatch) {
      if (windMatch[1] === 'VRB') {
        normalized.wind.direction = null; // Variable
      } else {
        normalized.wind.direction = parseInt(windMatch[1]);
      }
      normalized.wind.speed = parseInt(windMatch[2]);
      if (windMatch[3]) normalized.wind.gust = parseInt(windMatch[3]);
    }
    i++;
  }

  // Visibility
  if (i < parts.length && /^\d+SM$/.test(parts[i])) {
    normalized.visibility.value = parseInt(parts[i]);
    i++;
  }

  // Clouds/Ceiling
  while (i < parts.length && /^(FEW|SCT|BKN|OVC|VV)\d{3}$/.test(parts[i])) {
    const cloudMatch = parts[i].match(/^(FEW|SCT|BKN|OVC|VV)(\d{3})$/);
    if (cloudMatch) {
      const coverage = cloudMatch[1];
      const altitude = parseInt(cloudMatch[2]) * 100; // Convert to feet
      
      normalized.clouds.push({ cover: coverage, base: altitude });
      
      // Set ceiling (first BKN or OVC)
      if ((coverage === 'BKN' || coverage === 'OVC') && !normalized.ceiling.altitude) {
        normalized.ceiling.coverage = coverage;
        normalized.ceiling.altitude = altitude;
      }
    }
    i++;
  }

  // Temperature/Dewpoint
  if (i < parts.length && /^M?\d{2}\/M?\d{2}$/.test(parts[i])) {
    const tempMatch = parts[i].split('/');
    const temp = parseInt(tempMatch[0]);
    const dew = parseInt(tempMatch[1]);
    
    normalized.temperature.celsius = temp;
    normalized.temperature.fahrenheit = (temp * 9/5) + 32;
    normalized.dewpoint.celsius = dew;
    normalized.dewpoint.fahrenheit = (dew * 9/5) + 32;
    i++;
  }

  // Altimeter
  if (i < parts.length && /^A\d{4}$/.test(parts[i])) {
    const altimeter = parseInt(parts[i].slice(1));
    normalized.altimeter.inchesHg = altimeter / 100;
    i++;
  }

  // Flight Category (VFR, MVFR, IFR, LIFR)
  if (normalized.ceiling.altitude && normalized.visibility.value) {
    if (normalized.ceiling.altitude >= 3000 && normalized.visibility.value >= 5) {
      normalized.flightCategory = 'VFR';
    } else if (normalized.ceiling.altitude >= 1000 && normalized.visibility.value >= 3) {
      normalized.flightCategory = 'MVFR';
    } else if (normalized.ceiling.altitude >= 500 && normalized.visibility.value >= 1) {
      normalized.flightCategory = 'IFR';
    } else {
      normalized.flightCategory = 'LIFR';
    }
  }

  return normalized;
}

/**
 * TAF Normalizer - Converts raw TAF to structured JSON
 */
function normalizeTaf(rawTaf) {
  if (!rawTaf) {
    return { error: 'No TAF data provided' };
  }

  const normalized = {
    icao: null,
    issuedAt: new Date().toISOString(),
    validPeriod: { start: null, end: null },
    forecastGroups: [],
    remarks: null,
    rawText: rawTaf,
    normalizedAt: new Date().toISOString(),
  };

  const parts = rawTaf.trim().split(/\s+/);
  let i = 0;

  // ICAO
  if (i < parts.length && /^[A-Z]{4}$/.test(parts[i])) {
    normalized.icao = parts[i];
    i++;
  }

  // Valid period (simplified)
  if (i < parts.length && /^\d{8}\/\d{8}$/.test(parts[i])) {
    const period = parts[i].split('/');
    normalized.validPeriod.start = period[0];
    normalized.validPeriod.end = period[1];
    i++;
  }

  // Note: Full TAF parsing is complex. This provides the basic structure.
  // In production, use a library like 'avwx-api' or implement full parser

  return normalized;
}

/**
 * NOTAM Normalizer - Converts raw NOTAM to structured JSON
 */
function normalizeNotam(rawNotam) {
  if (!rawNotam) {
    return { error: 'No NOTAM data provided' };
  }

  const normalized = {
    notamId: null,
    icao: null,
    type: null, // AIRPORT, RUNWAY, NAVAID, etc.
    effectiveAt: null,
    expiresAt: null,
    description: null,
    severity: 'medium', // low, medium, high, critical
    affectsFlightPlanning: false,
    rawText: rawNotam,
    normalizedAt: new Date().toISOString(),
  };

  // Extract ICAO (usually first element)
  const icaoMatch = rawNotam.match(/^([A-Z]{4})/);
  if (icaoMatch) {
    normalized.icao = icaoMatch[1];
  }

  // Detect NOTAM type
  if (/RWY|runway/i.test(rawNotam)) {
    normalized.type = 'RUNWAY';
    normalized.severity = 'high';
    normalized.affectsFlightPlanning = true;
  } else if (/NAVAID|nav|beacon/i.test(rawNotam)) {
    normalized.type = 'NAVAID';
    normalized.severity = 'high';
  } else if (/closed|closure|temporary closure/i.test(rawNotam)) {
    normalized.type = 'AIRPORT';
    normalized.severity = 'critical';
    normalized.affectsFlightPlanning = true;
  } else {
    normalized.type = 'AIRPORT';
  }

  // Extract dates (simplified)
  const dateMatch = rawNotam.match(/(\d{4})/g);
  if (dateMatch && dateMatch.length >= 2) {
    normalized.effectiveAt = dateMatch[0];
    normalized.expiresAt = dateMatch[dateMatch.length - 1];
  }

  normalized.description = rawNotam;

  return normalized;
}

module.exports = {
  normalizeMetar,
  normalizeTaf,
  normalizeNotam,
};
