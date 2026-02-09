import * as tf from '@tensorflow/tfjs';
import localforage from 'localforage';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://google-b-1-y2sb.onrender.com/api';

class FederatedLearningClient {
  constructor() {
    this.localModel = null;
    this.modelMetadata = null;
    this.trainingData = [];
    this.isTraining = false;
    
    // Initialize local storage
    this.storage = localforage.createInstance({
      name: 'federatedLearning',
      storeName: 'models'
    });
  }

  /**
   * Initialize the client and check for existing local model
   */
  async initialize() {
    try {
      // Load cached model metadata
      this.modelMetadata = await this.storage.getItem('modelMetadata');
      
      // Load training data from local storage
      const cachedData = await this.storage.getItem('trainingData');
      if (cachedData) {
        this.trainingData = cachedData;
      }

      console.log('Federated learning client initialized');
      return true;
    } catch (error) {
      console.error('Error initializing federated learning client:', error);
      return false;
    }
  }

  /**
   * Download the latest global model from server
   */
  async downloadGlobalModel(modelType = 'recommendation') {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      // Get model metadata
      const metadataResponse = await axios.get(
        `${API_BASE_URL}/federated/model/${modelType}/latest`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      this.modelMetadata = metadataResponse.data;

      // Download model weights
      const weightsResponse = await axios.get(
        `${API_BASE_URL}/federated/model/${this.modelMetadata.modelId}/weights`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer'
        }
      );

      // Deserialize and load model
      await this.loadModelFromWeights(weightsResponse.data);

      // Cache model metadata
      await this.storage.setItem('modelMetadata', this.modelMetadata);

      console.log(`Downloaded model ${this.modelMetadata.modelId} version ${this.modelMetadata.version}`);
      return this.modelMetadata;
    } catch (error) {
      console.error('Error downloading global model:', error);
      
      // If download fails, try to create a default model
      if (!this.localModel) {
        await this.createDefaultModel();
      }
      
      throw error;
    }
  }

  /**
   * Load model from serialized weights
   */
  async loadModelFromWeights(weightsBuffer) {
    try {
      const weightsData = JSON.parse(new TextDecoder().decode(weightsBuffer));
      
      // Reconstruct model architecture
      this.localModel = tf.sequential();
      
      for (let i = 0; i < this.modelMetadata.architecture.layers.length; i++) {
        const layerConfig = this.modelMetadata.architecture.layers[i];
        
        if (i === 0) {
          this.localModel.add(tf.layers[layerConfig.type]({
            units: layerConfig.units,
            activation: layerConfig.activation,
            inputShape: this.modelMetadata.architecture.inputShape,
            ...layerConfig.config
          }));
        } else {
          this.localModel.add(tf.layers[layerConfig.type]({
            units: layerConfig.units,
            activation: layerConfig.activation,
            ...layerConfig.config
          }));
        }
      }

      // Compile model
      this.localModel.compile({
        optimizer: tf.train[this.modelMetadata.hyperparameters.optimizer || 'adam'](
          this.modelMetadata.hyperparameters.learningRate || 0.001
        ),
        loss: this.modelMetadata.hyperparameters.loss || 'meanSquaredError',
        metrics: this.modelMetadata.hyperparameters.metrics || ['accuracy']
      });

      // Set weights
      const weights = weightsData.map(w => tf.tensor(w.data, w.shape, w.dtype));
      this.localModel.setWeights(weights);

      // Cleanup
      weights.forEach(w => w.dispose());

      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model from weights:', error);
      throw error;
    }
  }

  /**
   * Create a default model if download fails
   */
  async createDefaultModel() {
    console.log('Creating default local model');
    
    this.localModel = tf.sequential({
      layers: [
        tf.layers.dense({ units: 32, activation: 'relu', inputShape: [10] }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 16, activation: 'relu' }),
        tf.layers.dense({ units: 8, activation: 'sigmoid' })
      ]
    });

    this.localModel.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy']
    });

    this.modelMetadata = {
      modelId: 'local_default',
      version: 0,
      modelType: 'recommendation',
      architecture: {
        inputShape: [10],
        outputShape: [8]
      }
    };
  }

  /**
   * Add training data point (user interaction)
   */
  async addTrainingData(interactionData) {
    try {
      // Store interaction data locally
      this.trainingData.push({
        ...interactionData,
        timestamp: Date.now()
      });

      // Keep only recent data (last 500 interactions)
      if (this.trainingData.length > 500) {
        this.trainingData = this.trainingData.slice(-500);
      }

      // Cache to local storage
      await this.storage.setItem('trainingData', this.trainingData);

      // Also send to server for central tracking
      const token = localStorage.getItem('token');
      if (token) {
        await axios.post(
          `${API_BASE_URL}/federated/interaction/record`,
          interactionData,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      console.log('Training data point added');
    } catch (error) {
      console.error('Error adding training data:', error);
    }
  }

  /**
   * Prepare training dataset from local interactions
   */
  prepareTrainingDataset() {
    if (this.trainingData.length < 10) {
      throw new Error('Insufficient training data');
    }

    const features = [];
    const labels = [];

    this.trainingData.forEach(interaction => {
      // Extract features
      const feature = this.extractFeatures(interaction);
      features.push(feature);

      // Create label (simple binary: completed or not)
      const label = Array(8).fill(0);
      if (interaction.completed) {
        label[0] = 1; // Success indicator
      }
      labels.push(label);
    });

    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    return { xs, ys };
  }

  /**
   * Extract numerical features from interaction data
   */
  extractFeatures(interaction) {
    const features = [
      // Interaction type (one-hot encoded)
      interaction.interactionType === 'chatbot' ? 1 : 0,
      interaction.interactionType === 'roadmap' ? 1 : 0,
      interaction.interactionType === 'checklist' ? 1 : 0,
      
      // Difficulty (one-hot encoded)
      interaction.difficulty === 'beginner' ? 1 : 0,
      interaction.difficulty === 'intermediate' ? 1 : 0,
      interaction.difficulty === 'advanced' ? 1 : 0,
      
      // Normalized time spent (0-1 scale, max 1 hour)
      Math.min((interaction.timeSpent || 0) / 3600, 1),
      
      // Completion status
      interaction.completed ? 1 : 0,
      
      // Normalized score (0-1 scale)
      (interaction.score || 0) / 100,
      
      // Time of day (0-1, normalized)
      new Date(interaction.timestamp).getHours() / 24
    ];

    return features;
  }

  /**
   * Train the local model on user's data
   */
  async trainLocalModel(options = {}) {
    if (this.isTraining) {
      console.log('Training already in progress');
      return null;
    }

    if (!this.localModel) {
      await this.downloadGlobalModel();
    }

    try {
      this.isTraining = true;
      console.log('Starting local training...');

      // Prepare dataset
      const { xs, ys } = this.prepareTrainingDataset();

      // Training configuration
      const epochs = options.epochs || 5;
      const batchSize = options.batchSize || 32;
      const validationSplit = options.validationSplit || 0.2;

      // Train model
      const history = await this.localModel.fit(xs, ys, {
        epochs,
        batchSize,
        validationSplit,
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch + 1}/${epochs}: loss=${logs.loss.toFixed(4)}, accuracy=${logs.acc.toFixed(4)}`);
            
            // Emit progress event
            if (options.onProgress) {
              options.onProgress({
                epoch: epoch + 1,
                totalEpochs: epochs,
                loss: logs.loss,
                accuracy: logs.acc
              });
            }
          }
        }
      });

      // Cleanup tensors
      xs.dispose();
      ys.dispose();

      this.isTraining = false;

      const trainingMetrics = {
        localEpochs: epochs,
        samplesUsed: this.trainingData.length,
        trainingLoss: history.history.loss[history.history.loss.length - 1],
        trainingAccuracy: history.history.acc[history.history.acc.length - 1],
        validationLoss: history.history.val_loss ? history.history.val_loss[history.history.val_loss.length - 1] : null,
        validationAccuracy: history.history.val_acc ? history.history.val_acc[history.history.val_acc.length - 1] : null
      };

      console.log('Local training completed:', trainingMetrics);
      return trainingMetrics;
    } catch (error) {
      console.error('Error during local training:', error);
      this.isTraining = false;
      throw error;
    }
  }

  /**
   * Submit model update to server
   */
  async submitModelUpdate(trainingMetrics) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      if (!this.localModel) {
        throw new Error('No local model available');
      }

      console.log('Preparing model update for submission...');

      // Get model weights
      const weights = this.localModel.getWeights();

      // Serialize weights
      const weightsData = await this.serializeWeights(weights);

      // Convert to base64 for transmission
      const weightsBase64 = Buffer.from(JSON.stringify(weightsData)).toString('base64');

      // Prepare update payload
      const updatePayload = {
        modelId: this.modelMetadata.modelId,
        weights: weightsBase64,
        metadata: {
          format: 'tensorflowjs',
          compression: 'none',
          updateType: 'weights'
        },
        metrics: trainingMetrics,
        deviceInfo: {
          userAgent: navigator.userAgent,
          memory: navigator.deviceMemory || 'unknown',
          cores: navigator.hardwareConcurrency || 'unknown'
        },
        dataDistribution: this.getDataDistribution()
      };

      // Submit to server
      const response = await axios.post(
        `${API_BASE_URL}/federated/update/submit`,
        updatePayload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Model update submitted successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting model update:', error);
      throw error;
    }
  }

  /**
   * Serialize TensorFlow weights
   */
  async serializeWeights(weights) {
    const weightsData = [];
    
    for (const weight of weights) {
      const data = await weight.data();
      const shape = weight.shape;
      weightsData.push({
        data: Array.from(data),
        shape: shape,
        dtype: weight.dtype
      });
    }

    return weightsData;
  }

  /**
   * Get data distribution statistics
   */
  getDataDistribution() {
    const distribution = {
      topicCounts: {},
      interactionTypes: {},
      totalSamples: this.trainingData.length
    };

    this.trainingData.forEach(interaction => {
      // Count topics
      if (interaction.topic) {
        distribution.topicCounts[interaction.topic] = 
          (distribution.topicCounts[interaction.topic] || 0) + 1;
      }

      // Count interaction types
      distribution.interactionTypes[interaction.interactionType] = 
        (distribution.interactionTypes[interaction.interactionType] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Full federated learning workflow: train locally and submit update
   */
  async participateInTraining(options = {}) {
    try {
      // Ensure we have the latest model
      if (!this.localModel || options.downloadLatest) {
        await this.downloadGlobalModel();
      }

      // Train locally
      const trainingMetrics = await this.trainLocalModel(options);

      if (!trainingMetrics) {
        throw new Error('Local training failed');
      }

      // Submit update
      const submitResult = await this.submitModelUpdate(trainingMetrics);

      return {
        success: true,
        trainingMetrics,
        submitResult
      };
    } catch (error) {
      console.error('Error participating in training:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Make predictions using the local model
   */
  async predict(inputFeatures) {
    if (!this.localModel) {
      await this.downloadGlobalModel();
    }

    try {
      const inputTensor = tf.tensor2d([inputFeatures]);
      const prediction = this.localModel.predict(inputTensor);
      const predictionData = await prediction.array();

      // Cleanup
      inputTensor.dispose();
      prediction.dispose();

      return predictionData[0];
    } catch (error) {
      console.error('Error making prediction:', error);
      throw error;
    }
  }

  /**
   * Clear local training data
   */
  async clearLocalData() {
    this.trainingData = [];
    await this.storage.removeItem('trainingData');
    console.log('Local training data cleared');
  }

  /**
   * Get training data summary
   */
  getTrainingDataSummary() {
    return {
      totalSamples: this.trainingData.length,
      distribution: this.getDataDistribution(),
      oldestSample: this.trainingData.length > 0 ? this.trainingData[0].timestamp : null,
      newestSample: this.trainingData.length > 0 ? this.trainingData[this.trainingData.length - 1].timestamp : null
    };
  }
}

// Export singleton instance
export default new FederatedLearningClient();
