const { Server } = require('socket.io');
const { handleAudioChunk } = require('./services/streamingTranscription');

/**
 * Setup WebSocket with Socket.io for real-time audio transcription using Whisper API
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
    },
    maxHttpBufferSize: 10 * 1024 * 1024 // Allow 10MB audio chunks
  });

  // Track active sessions
  const sessions = new Map();

  io.on('connection', (socket) => {
    console.log(`🎤 Pilot connected: ${socket.id}`);
    sessions.set(socket.id, {
      startTime: new Date(),
      chunks: 0,
      callsign: null
    });

    /**
     * Receive audio chunk and transcribe with Whisper API
     * Event: 'audio-chunk'
     * Data: { buffer: Uint8Array|string, format: 'wav'|'mp3'|'webm' }
     */
    socket.on('audio-chunk', async (data) => {
      try {
        const session = sessions.get(socket.id);
        if (session) {
          session.chunks++;
        }

        const { buffer, format = 'wav' } = data;
        
        if (!buffer) {
          socket.emit('transcript-error', { message: 'No audio buffer provided' });
          return;
        }

        console.log(`📨 Received audio chunk from ${socket.id} - chunk #${session.chunks} (${format})`);

        // Send to Whisper API for real transcription
        await handleAudioChunk(buffer, socket, format);
        
      } catch (error) {
        console.error('Audio transcription error:', error.message);
        socket.emit('transcript-error', { 
          message: 'Transcription failed',
          error: error.message 
        });
      }
    });

    /**
     * Start continuous transcription session
     * Event: 'start-session'
     */
    socket.on('start-session', (data = {}) => {
      const { callsign } = data;
      const session = sessions.get(socket.id);
      if (session) {
        session.startTime = new Date();
        session.chunks = 0;
        session.callsign = callsign || null;
      }
      console.log(`🔴 Recording started - Callsign: ${callsign || 'unknown'}`);
      socket.emit('session-started', { 
        sessionId: socket.id,
        callsign: callsign || null,
        timestamp: new Date().toISOString()
      });
    });

    /**
     * End transcription session
     * Event: 'end-session'
     */
    socket.on('end-session', () => {
      const session = sessions.get(socket.id);
      console.log(`⏹️  Recording ended for ${socket.id} - Chunks: ${session?.chunks || 0}`);
      socket.emit('session-ended', {
        sessionId: socket.id,
        chunksProcessed: session?.chunks || 0,
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
      const session = sessions.get(socket.id);
      console.log(`👋 Pilot disconnected: ${socket.id} - Session: ${session?.chunks || 0} chunks`);
      sessions.delete(socket.id);
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
