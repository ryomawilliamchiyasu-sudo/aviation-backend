/**
 * Audio Transcription Service
 * Converts audio to text with aviation-specific keyword extraction
 */

/**
 * Transcribe audio buffer to text
 * @param {Uint8Array} audioBuffer - Audio data
 * @param {string} format - Format: 'wav', 'mp3', 'webm'
 * @returns {Object} { text, highlights, confidence }
 */
async function transcribeAudio(audioBuffer, format = 'wav') {
  try {
    // For MVP: Mock transcription
    // TODO: Integrate Whisper API or similar
    
    const mockTranscripts = [
      {
        text: "Altimeter two niner niner two cleared to land runway two six",
        highlights: {
          altimeter: "2992",
          clearance: "cleared to land",
          runway: "26"
        },
        confidence: 0.95
      },
      {
        text: "Descend and maintain flight level two seven zero",
        highlights: {
          instruction: "descend and maintain",
          flightLevel: "270"
        },
        confidence: 0.92
      },
      {
        text: "Turn left heading zero nine zero wind one eight zero at fifteen",
        highlights: {
          instruction: "turn left",
          heading: "090",
          wind: "180 at 15"
        },
        confidence: 0.88
      }
    ];

    // Randomly select a mock result for demo
    const result = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
    
    console.log(`📝 Transcription: ${result.text}`);
    
    return {
      text: result.text,
      highlights: result.highlights,
      confidence: result.confidence,
      format: format,
      duration: Math.floor(audioBuffer.length / 16000) // Rough estimate
    };
  } catch (error) {
    console.error('Transcription error:', error);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

/**
 * Extract aviation-specific keywords from transcribed text
 * @param {string} text - Transcribed text
 * @returns {Object} Extracted keywords and values
 */
function extractHighlights(text) {
  const highlights = {};

  // Altimeter (29.92, 30.02, etc.)
  const altimeterMatch = text.match(/altimeter\s+(\d+\s*\d{2})/i);
  if (altimeterMatch) {
    highlights.altimeter = altimeterMatch[1].replace(/\s+/g, '');
  }

  // Runway numbers (runway 26, rwy 08L, etc.)
  const runwayMatch = text.match(/runw?ay\s+(\d{2}[LRC]?)/i);
  if (runwayMatch) {
    highlights.runway = runwayMatch[1];
  }

  // Flight level (FL250, flight level 270, etc.)
  const flMatch = text.match(/(?:FL|flight level)\s*(\d+)/i);
  if (flMatch) {
    highlights.flightLevel = flMatch[1];
  }

  // Heading (heading 090, turn left heading 045, etc.)
  const headingMatch = text.match(/heading\s*(\d{3})/i);
  if (headingMatch) {
    highlights.heading = headingMatch[1];
  }

  // Wind (wind 180 at 15, wind 090 at 8 knots, etc.)
  const windMatch = text.match(/wind\s+(\d{3})\s+at\s+(\d{1,2})/i);
  if (windMatch) {
    highlights.wind = `${windMatch[1]} at ${windMatch[2]}`;
  }

  // Clearances (cleared to land, cleared for takeoff, cleared to cruise, etc.)
  const clearanceMatch = text.match(/cleared\s+(to\s+\w+(?:\s+\w+)?)/i);
  if (clearanceMatch) {
    highlights.clearance = `cleared ${clearanceMatch[1]}`;
  }

  return highlights;
}

/**
 * Format transcription result for frontend
 * @param {string} rawText - Raw transcribed text
 * @param {number} confidence - Confidence score (0-1)
 * @returns {Object} Formatted result
 */
function formatResult(rawText, confidence = 0.9) {
  return {
    text: rawText,
    highlights: extractHighlights(rawText),
    confidence: confidence,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  transcribeAudio,
  extractHighlights,
  formatResult
};
