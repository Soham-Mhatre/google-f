import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://google-b-1-y2sb.onrender.com';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.eventHandlers = new Map();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.warn('No authentication token found');
      return false;
    }

    if (this.socket && this.isConnected) {
      console.log('Already connected');
      return true;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.setupEventListeners();
    return true;
  }

  /**
   * Setup default event listeners
   */
  setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.emit('connection_error', { error: error.message });
    });

    this.socket.on('connection:success', (data) => {
      console.log('Connection success:', data);
      this.emit('connection_success', data);
    });

    // Training round events
    this.socket.on('training:round_started', (data) => {
      console.log('Training round started:', data);
      this.emit('training_round_started', data);
    });

    this.socket.on('training:round_completed', (data) => {
      console.log('Training round completed:', data);
      this.emit('training_round_completed', data);
    });

    this.socket.on('training:joined', (data) => {
      console.log('Joined training session:', data);
      this.emit('training_joined', data);
    });

    this.socket.on('training:left', (data) => {
      console.log('Left training session:', data);
      this.emit('training_left', data);
    });

    this.socket.on('training:participant_joined', (data) => {
      console.log('Participant joined:', data);
      this.emit('participant_joined', data);
    });

    this.socket.on('training:participant_left', (data) => {
      console.log('Participant left:', data);
      this.emit('participant_left', data);
    });

    // Model update events
    this.socket.on('update:accepted', (data) => {
      console.log('Model update accepted:', data);
      this.emit('update_accepted', data);
    });

    this.socket.on('update:rejected', (data) => {
      console.log('Model update rejected:', data);
      this.emit('update_rejected', data);
    });

    // Model events
    this.socket.on('model:new_version', (data) => {
      console.log('New model version available:', data);
      this.emit('new_model_version', data);
    });

    this.socket.on('model:ready', (data) => {
      console.log('Model ready for download:', data);
      this.emit('model_ready', data);
    });

    // System events
    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      this.emit('notification', data);
    });

    this.socket.on('system:message', (data) => {
      console.log('System message:', data);
      this.emit('system_message', data);
    });

    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('socket_error', data);
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Join a training session
   */
  joinTraining(modelId) {
    if (!this.isConnected) {
      console.error('Not connected to server');
      return false;
    }

    this.socket.emit('training:join', { modelId });
    return true;
  }

  /**
   * Leave a training session
   */
  leaveTraining(modelId) {
    if (!this.isConnected) {
      console.error('Not connected to server');
      return false;
    }

    this.socket.emit('training:leave', { modelId });
    return true;
  }

  /**
   * Send training progress update
   */
  sendTrainingProgress(modelId, progress, status) {
    if (!this.isConnected) {
      console.error('Not connected to server');
      return false;
    }

    this.socket.emit('training:progress', { modelId, progress, status });
    return true;
  }

  /**
   * Request model download
   */
  requestModel(modelId) {
    if (!this.isConnected) {
      console.error('Not connected to server');
      return false;
    }

    this.socket.emit('model:request', { modelId });
    return true;
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  /**
   * Unregister event handler
   */
  off(event, handler) {
    if (!this.eventHandlers.has(event)) {
      return;
    }

    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  /**
   * Emit event to registered handlers
   */
  emit(event, data) {
    if (!this.eventHandlers.has(event)) {
      return;
    }

    const handlers = this.eventHandlers.get(event);
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Get connection status
   */
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null
    };
  }
}

// Export singleton instance
export default new WebSocketClient();
