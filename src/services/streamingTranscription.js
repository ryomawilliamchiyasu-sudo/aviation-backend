const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create tmp directory if it doesn't exist
const tmpDir = path.join(__dirname, '../../tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true });
}

/**
 * Handle incoming audio chunk and transcribe it
 * @param {string} base64Audio - Base64 encoded audio data
 * @param {Object} socket - Socket.io socket object
 * @param {string} format - Audio format (wav, mp3, webm)
 * @returns {Promise<void>}
 */
async function handleAudioChunk(base64Audio, socket, format = 'wav') {
  try {
    // Validate input
    if (!base64Audio) {
      socket.emit('transcript-error', 'No audio data provided');
      return;
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    const timestamp = Date.now();
    const rawPath = path.join(tmpDir, `raw-${timestamp}.${format}`);
    
    // Write raw audio to file
    fs.writeFileSync(rawPath, audioBuffer);

    // Convert to WAV with 16kHz mono for Whisper API
    const wavPath = path.join(tmpDir, `converted-${timestamp}.wav`);
    
    await new Promise((resolve, reject) => {
      ffmpeg(rawPath)
        .audioFrequency(16000)
        .audioChannels(1)
        .format('wav')
        .save(wavPath)
        .on('end', resolve)
        .on('error', (err) => {
          console.error('FFmpeg conversion error:', err);
          reject(err);
        });
    });

    // Send to Whisper API for transcription
    const fileStream = fs.createReadStream(wavPath);
    
    const transcript = await openai.audio.transcriptions.create({
      file: fileStream,
      model: 'whisper-1',
      language: 'en',
    });

    // Extract aviation data from transcript
    const aviationData = extractAviationData(transcript.text);

    // Emit results back to client
    socket.emit('transcript-partial', {
      text: transcript.text,
      extracted: aviationData,
      timestamp: new Date().toISOString(),
      confidence: transcript.language ? 0.95 : 0.8, // Approximate confidence
    });

    console.log('Transcribed:', transcript.text);

    // Cleanup temporary files
    setTimeout(() => {
      try {
        if (fs.existsSync(rawPath)) fs.unlinkSync(rawPath);
        if (fs.existsSync(wavPath)) fs.unlinkSync(wavPath);
      } catch (err) {
        console.warn('Cleanup error:', err);
      }
    }, 1000);

  } catch (error) {
    console.error('Audio transcription error:', error.message);
    socket.emit('transcript-error', {
      error: 'Transcription failed',
      message: error.message,
    });
  }
}

/**
 * Extract aviation-specific data from transcribed text
 * @param {string} text - Transcribed text
 * @returns {Object} Extracted aviation data
 */
function extractAviationData(text) {
  const extracted = {};

  if (!text) return extracted;

  const lowerText = text.toLowerCase();

  // Altimeter setting (e.g., "29.92" or "2992")
  const altimeterMatch = text.match(/(?:altimeter\s+)?(\d{2}\.\d{2}|\d{4})/i);
  if (altimeterMatch) {
    let value = altimeterMatch[1];
    // Normalize to standard format (XX.XX)
    if (value.length === 4) {
      value = value.slice(0, 2) + '.' + value.slice(2);
    }
    extracted.altimeter = value;
  }

  // Runway (e.g., "26", "08L", "33R")
  const runwayMatch = text.match(/(?:runway\s+)?(\d{1,2}[LRC]?)/i);
  if (runwayMatch) {
    extracted.runway = runwayMatch[1].padStart(2, '0');
  }

  // Radio frequency (e.g., "123.45")
  const freqMatch = text.match(/\b(\d{3}\.\d{2,3})\b/);
  if (freqMatch) {
    extracted.frequency = freqMatch[1];
  }

  // Altitude/Flight level (e.g., "5000 feet", "FL250")
  let altMatch = text.match(/FL\s*(\d{3,4})/i);
  if (altMatch) {
    extracted.flightLevel = altMatch[1];
  } else {
    altMatch = text.match(/(\d{3,5})\s*(?:feet|ft|feet?)/i);
    if (altMatch) {
      extracted.altitude = altMatch[1];
    }
  }

  // Heading (e.g., "heading 180", "090 degrees")
  const headingMatch = text.match(/(?:heading\s+)?(\d{3})(?:\s*degrees?)?/i);
  if (headingMatch) {
    extracted.heading = headingMatch[1];
  }

  // Wind (e.g., "wind 180 at 15", "winds from 270 at 10 knots")
  const windMatch = text.match(/wind(?:s)?(?:\s+from)?\s+(\d{3})\s+at\s+(\d{1,3})/i);
  if (windMatch) {
    extracted.wind = {
      direction: windMatch[1],
      speed: windMatch[2],
      unit: 'knots',
    };
  }

  // Clearance keywords
  if (/cleared to land|clear to land|clear land/i.test(text)) {
    extracted.clearance = 'cleared to land';
  } else if (/cleared for takeoff|clear for takeoff|cleared takeoff/i.test(text)) {
    extracted.clearance = 'cleared for takeoff';
  } else if (/cleared to climb|clear to climb/i.test(text)) {
    extracted.clearance = 'cleared to climb';
  } else if (/cleared to descend|clear to descend/i.test(text)) {
    extracted.clearance = 'cleared to descend';
  }

  // ATIS letter
  const atisMatch = text.match(/ATIS\s+([A-Z])/i);
  if (atisMatch) {
    extracted.atis = atisMatch[1];
  }

  // Squawk code
  const squawkMatch = text.match(/squawk\s+(\d{4})/i);
  if (squawkMatch) {
    extracted.squawk = squawkMatch[1];
  }

  return extracted;
}

module.exports = {
  handleAudioChunk,
  extractAviationData,
};
