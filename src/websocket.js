const { Server } = require('socket.io');
const { transcribeAudio } = require('./services/transcriptionService');

/**
 * Setup WebSocket with Socket.io for real-time audio transcription
 * @param {http.Server} server - HTTP server instance
 */
function setupWebSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:8082',
        'http://localhost:8081',
        'http://localhost:3000',
        'http://localhost:3001',
        /^https:\/\/.*\.vercel\.app$/,
        /^https:\/\/.*\.netlify\.app$/,
        /^https:\/\/.*\.onrender\.com$/
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🎤 Pilot connected: ${socket.id}`);

    /**
     * Receive audio chunk and transcribe
     * Event: 'audio-chunk'
     * Data: { buffer: Uint8Array, format: 'wav'|'mp3'|'webm' }
     */
    socket.on('audio-chunk', async (data) => {
      try {
        const { buffer, format } = data;
        
        if (!buffer) {
          socket.emit('error', { message: 'No audio buffer provided' });
          return;
        }

        console.log(`📨 Received audio chunk from ${socket.id} (${format})`);

        // Transcribe audio
        const result = await transcribeAudio(buffer, format);

        // Emit results back to pilot
        socket.emit('transcript', {
          rawText: result.text,
          highlights: result.highlights,
          confidence: result.confidence,
          timestamp: new Date().toISOString()
        });

        console.log(`✓ Transcribed: "${result.text}"`);
      } catch (error) {
        console.error('Transcription error:', error.message);
        socket.emit('error', { 
          message: 'Transcription failed',
          error: error.message 
        });
      }
    });

    /**
     * Start continuous transcription session
     * Event: 'start-session'
     */
    socket.on('start-session', (data) => {
      const { callsign } = data || {};
      console.log(`🔴 Recording started - Callsign: ${callsign || 'unknown'}`);
      socket.emit('session-started', { 
        sessionId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    /**
     * End transcription session
     * Event: 'end-session'
     */
    socket.on('end-session', () => {
      console.log(`⏹️  Recording ended for ${socket.id}`);
      socket.emit('session-ended', {
        timestamp: new Date().toISOString()
      });
    });

    /**
     * Heartbeat for connection monitoring
     * Event: 'ping'
     */
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });

    /**
     * Handle disconnect
     */
    socket.on('disconnect', () => {
      console.log(`👋 Pilot disconnected: ${socket.id}`);
    });

    /**
     * Error handling
     */
    socket.on('error', (error) => {
      console.error(`❌ Socket error from ${socket.id}:`, error);
    });
  });

  return io;
}

module.exports = { setupWebSocket };
