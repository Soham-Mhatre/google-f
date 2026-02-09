import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  Users,
  TrendingUp,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Award
} from 'lucide-react';
import { useFederatedLearning } from '../contexts/FederatedLearningContext';

const FederatedLearningDashboard = () => {
  const {
    isInitialized,
    isTraining,
    trainingProgress,
    modelInfo,
    notifications,
    trainingHistory,
    participateInTraining,
    downloadLatestModel,
    getTrainingDataSummary,
    clearLocalData,
    dismissNotification
  } = useFederatedLearning();

  const [dataSummary, setDataSummary] = useState(null);
  const [showNotifications, setShowNotifications] = useState(true);

  useEffect(() => {
    if (isInitialized) {
      const summary = getTrainingDataSummary();
      setDataSummary(summary);
    }
  }, [isInitialized]);

  const handleStartTraining = async () => {
    await participateInTraining({
      epochs: 5,
      batchSize: 32,
      downloadLatest: false
    });
    
    // Refresh data summary
    const summary = getTrainingDataSummary();
    setDataSummary(summary);
  };

  const handleDownloadModel = async () => {
    try {
      await downloadLatestModel();
      alert('Model downloaded successfully!');
    } catch (error) {
      alert('Failed to download model: ' + error.message);
    }
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all local training data?')) {
      await clearLocalData();
      const summary = getTrainingDataSummary();
      setDataSummary(summary);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Initializing Federated Learning...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Federated Learning Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Contribute to AI training while keeping your data private
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Database className="w-6 h-6" />}
            title="Training Samples"
            value={dataSummary?.totalSamples || 0}
            color="blue"
          />
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Model Version"
            value={modelInfo?.version || 'N/A'}
            color="green"
          />
          <StatCard
            icon={<Award className="w-6 h-6" />}
            title="Contributions"
            value={trainingHistory.filter(h => h.status === 'accepted').length}
            color="yellow"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Success Rate"
            value={
              trainingHistory.length > 0
                ? `${((trainingHistory.filter(h => h.status === 'accepted').length / trainingHistory.length) * 100).toFixed(0)}%`
                : '0%'
            }
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Training & Model Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Training Control */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-indigo-600" />
                Training Control
              </h2>

              {isTraining ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {trainingProgress?.status || 'Training...'}
                      </span>
                      <span className="text-sm font-medium">
                        {trainingProgress?.progress?.toFixed(0) || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${trainingProgress?.progress || 0}%` }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full"
                      />
                    </div>
                  </div>

                  {trainingProgress?.epoch && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Epoch:</span>
                        <span className="ml-2 font-semibold">
                          {trainingProgress.epoch}/{trainingProgress.totalEpochs}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Loss:</span>
                        <span className="ml-2 font-semibold">
                          {trainingProgress.loss?.toFixed(4) || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-400">
                    Start training to contribute to the global model. Your data stays on your device.
                  </p>
                  
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleStartTraining}
                      disabled={!dataSummary || dataSummary.totalSamples < 10}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Zap className="w-5 h-5 inline mr-2" />
                      Start Training
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDownloadModel}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold"
                    >
                      <RefreshCw className="w-5 h-5 inline mr-2" />
                      Update Model
                    </motion.button>
                  </div>

                  {dataSummary && dataSummary.totalSamples < 10 && (
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      ⚠️ Need at least 10 training samples to participate. Keep using the app!
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Model Information */}
            {modelInfo && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold mb-4">Model Information</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Model Type</p>
                    <p className="font-semibold">{modelInfo.modelType}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Version</p>
                    <p className="font-semibold">v{modelInfo.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Training Round</p>
                    <p className="font-semibold">{modelInfo.trainingRound}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Participants</p>
                    <p className="font-semibold">{modelInfo.participatingClients}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Training History */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold mb-4">Training History</h2>
              <div className="space-y-3">
                {trainingHistory.slice(0, 5).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {entry.status === 'accepted' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <p className="font-semibold text-sm">
                          Round {entry.trainingRound}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {entry.qualityScore && (
                      <span className="text-sm font-semibold">
                        {(entry.qualityScore * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Notifications & Data */}
          <div className="space-y-6">
            {/* Notifications */}
            {showNotifications && notifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Notifications</h2>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Hide
                  </button>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {notifications.slice(0, 10).map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onDismiss={() => dismissNotification(notification.id)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Local Data Summary */}
            {dataSummary && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-bold mb-4">Local Training Data</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Total Samples
                    </p>
                    <p className="text-3xl font-bold">{dataSummary.totalSamples}</p>
                  </div>

                  {dataSummary.distribution && (
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Topic Distribution
                      </p>
                      <div className="space-y-2">
                        {Object.entries(dataSummary.distribution.topicCounts || {})
                          .slice(0, 5)
                          .map(([topic, count]) => (
                            <div key={topic} className="flex justify-between text-sm">
                              <span className="truncate">{topic}</span>
                              <span className="font-semibold">{count}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleClearData}
                    className="w-full px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
                    Clear Local Data
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white mb-3`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold">{value}</p>
    </motion.div>
  );
};

// Notification Card Component
const NotificationCard = ({ notification, onDismiss }) => {
  const typeColors = {
    info: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800',
    success: 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800',
    warning: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800',
    error: 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-3 rounded-lg border ${typeColors[notification.type]} relative`}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        <XCircle className="w-4 h-4" />
      </button>
      <p className="font-semibold text-sm mb-1">{notification.title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400">{notification.message}</p>
      <p className="text-xs text-gray-400 mt-1">
        {new Date(notification.timestamp).toLocaleTimeString()}
      </p>
    </motion.div>
  );
};

export default FederatedLearningDashboard;
