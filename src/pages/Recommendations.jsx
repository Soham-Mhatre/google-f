import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  BookOpen,
  TrendingUp,
  Target,
  Clock,
  Star,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Award
} from 'lucide-react';
import { useInteractionTracker } from '../hooks/useInteractionTracker';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://google-b-1-y2sb.onrender.com/api';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const { track } = useInteractionTracker('recommendations', { difficulty: 'intermediate' });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_BASE_URL}/federated/recommendations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setRecommendations(response.data.recommendations);
      setLearningPath(response.data.learningPath);
      setInsights(response.data.insights);

      track('recommendation_view', {
        topic: 'personalized_recommendations',
        completed: true
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateRecommendations = async () => {
    try {
      setRegenerating(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_BASE_URL}/federated/recommendations/regenerate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRecommendations(response.data.recommendations);
      setLearningPath(response.data.learningPath);
      setInsights(response.data.insights);

      track('recommendation_regenerate', {
        topic: 'personalized_recommendations',
        completed: true
      });
    } catch (error) {
      console.error('Error regenerating recommendations:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const handleRecommendationClick = (recommendation) => {
    track('recommendation_click', {
      topic: recommendation.item.title,
      metadata: {
        score: recommendation.score,
        difficulty: recommendation.difficulty
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-12 h-12 text-indigo-600" />
        </motion.div>
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Personalized Recommendations
            </h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={regenerateRecommendations}
              disabled={regenerating}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Regenerating...' : 'Refresh'}
            </motion.button>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered recommendations based on your learning patterns and federated learning insights
          </p>
        </motion.div>

        {/* Insights Section */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <InsightCard
              icon={<Star className="w-6 h-6 text-yellow-500" />}
              title="Strong Areas"
              items={insights.strongAreas}
              color="yellow"
            />
            <InsightCard
              icon={<TrendingUp className="w-6 h-6 text-green-500" />}
              title="Improvement Areas"
              items={insights.improvementAreas}
              color="green"
            />
            <InsightCard
              icon={<Lightbulb className="w-6 h-6 text-blue-500" />}
              title="Learning Style"
              value={insights.learningStyle}
              color="blue"
            />
            <InsightCard
              icon={<Award className="w-6 h-6 text-purple-500" />}
              title="Progress Prediction"
              value={`${insights.progressPrediction}%`}
              color="purple"
            />
          </motion.div>
        )}

        {/* Suggested Focus */}
        {insights?.suggestedFocus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl mb-8 shadow-lg"
          >
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-bold">Suggested Focus</h3>
                <p className="text-indigo-100">{insights.suggestedFocus}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recommendations List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              Recommended Topics
            </h2>
            
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <RecommendationCard
                  key={index}
                  recommendation={rec}
                  onClick={() => handleRecommendationClick(rec)}
                />
              ))}
            </div>
          </div>

          {/* Learning Path */}
          <div>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-600" />
              Your Learning Path
            </h2>
            
            <div className="space-y-4">
              {learningPath.map((step, index) => (
                <LearningPathCard key={index} step={step} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Insight Card Component
const InsightCard = ({ icon, title, items, value, color }) => {
  const colorClasses = {
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl border ${colorClasses[color]} shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
      </div>
      {items ? (
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          {items.slice(0, 3).map((item, i) => (
            <li key={i} className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
      )}
    </motion.div>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ recommendation, onClick }) => {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {recommendation.item.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {recommendation.item.description}
          </p>
        </div>
        <div className="ml-4 flex flex-col items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[recommendation.difficulty]}`}>
            {recommendation.difficulty}
          </span>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>{(recommendation.score * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {recommendation.reasoning}
      </p>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {recommendation.estimatedTime} min
          </span>
          {recommendation.prerequisites.length > 0 && (
            <span className="text-xs">
              Prerequisites: {recommendation.prerequisites.length}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
        >
          Start Learning
        </motion.button>
      </div>
    </motion.div>
  );
};

// Learning Path Card Component
const LearningPathCard = ({ step, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
          {step.sequence}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
            {step.topic}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {step.subtopics.join(', ')}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{step.estimatedDuration} hours</span>
            {step.resources.length > 0 && (
              <span className="ml-2">{step.resources.length} resources</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Recommendations;
