import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import federatedLearningClient from '../services/federatedLearningClient';
import websocketClient from '../services/websocketClient';

const FederatedLearningContext = createContext(null);

export const useFederatedLearning = () => {
  const context = useContext(FederatedLearningContext);
  if (!context) {
    throw new Error('useFederatedLearning must be used within FederatedLearningProvider');
  }
  return context;
};

export const FederatedLearningProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  // Initialize federated learning client
  useEffect(() => {
    const initializeFL = async () => {
      try {
        await federatedLearningClient.initialize();
        setIsInitialized(true);
        console.log('Federated learning initialized');
      } catch (error) {
        console.error('Failed to initialize federated learning:', error);
      }
    };

    initializeFL();
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && isInitialized) {
      websocketClient.connect();

      // Setup event listeners
      websocketClient.on('training_round_started', handleTrainingRoundStarted);
      websocketClient.on('training_round_completed', handleTrainingRoundCompleted);
      websocketClient.on('new_model_version', handleNewModelVersion);
      websocketClient.on('update_accepted', handleUpdateAccepted);
      websocketClient.on('update_rejected', handleUpdateRejected);
      websocketClient.on('notification', handleNotification);

      return () => {
        websocketClient.disconnect();
      };
    }
  }, [isInitialized]);

  // Event handlers
  const handleTrainingRoundStarted = (data) => {
    addNotification({
      type: 'info',
      title: 'New Training Round',
      message: `Training round ${data.roundNumber} started. Join to contribute!`,
      data
    });
  };

  const handleTrainingRoundCompleted = (data) => {
    addNotification({
      type: 'success',
      title: 'Training Complete',
      message: `Training round ${data.roundNumber} completed with ${data.participatingClients} participants.`,
      data
    });
  };

  const handleNewModelVersion = (data) => {
    setModelInfo(data);
    addNotification({
      type: 'info',
      title: 'Model Updated',
      message: `New model version ${data.version} available!`,
      data
    });
  };

  const handleUpdateAccepted = (data) => {
    addNotification({
      type: 'success',
      title: 'Update Accepted',
      message: `Your model update was accepted (Quality: ${(data.qualityScore * 100).toFixed(1)}%)`,
      data
    });

    setTrainingHistory(prev => [{
      timestamp: Date.now(),
      status: 'accepted',
      ...data
    }, ...prev].slice(0, 50));
  };

  const handleUpdateRejected = (data) => {
    addNotification({
      type: 'warning',
      title: 'Update Rejected',
      message: data.reason || 'Your model update did not meet quality standards',
      data
    });

    setTrainingHistory(prev => [{
      timestamp: Date.now(),
      status: 'rejected',
      ...data
    }, ...prev].slice(0, 50));
  };

  const handleNotification = (notification) => {
    addNotification(notification);
  };

  const addNotification = (notification) => {
    setNotifications(prev => [{
      id: Date.now(),
      timestamp: new Date(),
      ...notification
    }, ...prev].slice(0, 20));
  };

  // Track user interaction
  const trackInteraction = useCallback(async (interactionData) => {
    if (!isInitialized) return;

    try {
      // Add session ID if current session exists
      const enrichedData = {
        ...interactionData,
        sessionId: currentSession || `session_${Date.now()}`,
        timestamp: Date.now()
      };

      await federatedLearningClient.addTrainingData(enrichedData);
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [isInitialized, currentSession]);

  // Start a new session
  const startSession = useCallback(() => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSession(sessionId);
    return sessionId;
  }, []);

  // End current session
  const endSession = useCallback(() => {
    setCurrentSession(null);
  }, []);

  // Participate in federated training
  const participateInTraining = useCallback(async (options = {}) => {
    if (isTraining) {
      console.log('Training already in progress');
      return null;
    }

    setIsTraining(true);
    setTrainingProgress({ status: 'starting', progress: 0 });

    try {
      const result = await federatedLearningClient.participateInTraining({
        ...options,
        onProgress: (progress) => {
          setTrainingProgress({
            status: 'training',
            progress: (progress.epoch / progress.totalEpochs) * 100,
            ...progress
          });

          // Send progress to server
          if (modelInfo?.modelId) {
            websocketClient.sendTrainingProgress(
              modelInfo.modelId,
              progress.epoch / progress.totalEpochs,
              'training'
            );
          }
        }
      });

      if (result.success) {
        setTrainingProgress({ status: 'completed', progress: 100 });
        addNotification({
          type: 'success',
          title: 'Training Completed',
          message: 'Your model update has been submitted successfully!'
        });
      } else {
        setTrainingProgress({ status: 'failed', progress: 0, error: result.error });
        addNotification({
          type: 'error',
          title: 'Training Failed',
          message: result.error || 'Failed to complete training'
        });
      }

      setIsTraining(false);
      return result;
    } catch (error) {
      console.error('Error participating in training:', error);
      setTrainingProgress({ status: 'error', progress: 0, error: error.message });
      setIsTraining(false);
      
      addNotification({
        type: 'error',
        title: 'Training Error',
        message: error.message
      });
      
      return null;
    }
  }, [isTraining, modelInfo]);

  // Download latest model
  const downloadLatestModel = useCallback(async () => {
    try {
      const metadata = await federatedLearningClient.downloadGlobalModel();
      setModelInfo(metadata);
      return metadata;
    } catch (error) {
      console.error('Error downloading model:', error);
      throw error;
    }
  }, []);

  // Get training data summary
  const getTrainingDataSummary = useCallback(() => {
    return federatedLearningClient.getTrainingDataSummary();
  }, []);

  // Clear local data
  const clearLocalData = useCallback(async () => {
    await federatedLearningClient.clearLocalData();
    addNotification({
      type: 'info',
      title: 'Data Cleared',
      message: 'Local training data has been cleared'
    });
  }, []);

  // Join training session
  const joinTrainingSession = useCallback((modelId) => {
    websocketClient.joinTraining(modelId);
  }, []);

  // Leave training session
  const leaveTrainingSession = useCallback((modelId) => {
    websocketClient.leaveTraining(modelId);
  }, []);

  // Dismiss notification
  const dismissNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    // State
    isInitialized,
    isTraining,
    trainingProgress,
    modelInfo,
    notifications,
    trainingHistory,
    currentSession,

    // Methods
    trackInteraction,
    startSession,
    endSession,
    participateInTraining,
    downloadLatestModel,
    getTrainingDataSummary,
    clearLocalData,
    joinTrainingSession,
    leaveTrainingSession,
    dismissNotification,
    clearNotifications
  };

  return (
    <FederatedLearningContext.Provider value={value}>
      {children}
    </FederatedLearningContext.Provider>
  );
};
