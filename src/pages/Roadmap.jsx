import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Loader, BookOpen, Plus } from 'lucide-react'
import MarkdownRenderer from '../components/MarkdownRenderer'
import '../components/ChatbotStyles.css'
import dotenv from 'dotenv';
const apiUrl = 'https://google-b-1-y2sb.onrender.com';

const Roadmap = () => {
  const [topic, setTopic] = useState('')
  const [weeks, setWeeks] = useState('')
  const [roadmap, setRoadmap] = useState(null)
  const [roadmapData, setRoadmapData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateRoadmap = async () => {
    if (!topic.trim() || !weeks.trim()) {
      setError('Please enter both topic and number of weeks')
      return
    }

    setIsLoading(true)
    setError(null)
    setRoadmap(null)

    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
      }
      
      // Add authorization header only if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${apiUrl}/api/roadmap/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ topic: topic.trim(), weeks: parseInt(weeks) }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate roadmap')
      }

      const data = await response.json()
      setRoadmap(data.roadmap)
      setRoadmapData({ topic: data.topic, weeks: data.weeks })
    } catch (error) {
      console.error('Error generating roadmap:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addToChecklist = async (content) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to add items to checklist')
        return
      }

      const response = await fetch(`${apiUrl}/api/checklist/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, type: 'roadmap' }),
      })

      if (!response.ok) {
        throw new Error('Failed to add to checklist')
      }

      // Show success message (you can implement a toast notification here)
      console.log('Added to checklist successfully')
    } catch (error) {
      console.error('Error adding to checklist:', error)
      setError(error.message)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 p-8 relative flex flex-col"
    >
      <Link to="/" className="absolute top-4 left-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </Link>
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Which Roadmap Should I Create For You?</h1>

      <div className="flex-grow overflow-auto mb-4">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center"
                role="alert"
              >
                <span className="font-medium">Error:</span>
                <span className="ml-2">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md text-center">
                <Loader className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  Generating Your Roadmap
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Creating a comprehensive {weeks}-week learning plan for {topic}...
                </p>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {roadmap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-8 h-8" />
                      <div>
                        <h2 className="text-2xl font-bold">
                          {roadmapData?.topic} Learning Roadmap
                        </h2>
                        <p className="opacity-90">
                          {roadmapData?.weeks} Week Comprehensive Guide
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => addToChecklist(`${roadmapData?.topic} - ${roadmapData?.weeks} Week Roadmap`)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Checklist</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 chatbot-message">
                  <MarkdownRenderer content={roadmap} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!roadmap && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                Ready to Start Learning?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Enter a topic and duration below to generate a comprehensive, 
                personalized learning roadmap with detailed resources and milestones.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl mx-auto w-full"
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 text-center">
            Create Your Personalized Learning Roadmap
          </h3>
          <div className="flex flex-col sm:flex-row items-end space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Learning Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., React.js, Machine Learning, Digital Marketing..."
                className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration
              </label>
              <input
                type="number"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                placeholder="Weeks"
                className="w-full p-4 border-0 bg-gray-50 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="52"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={generateRoadmap}
              disabled={isLoading || !topic.trim() || !weeks.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg font-semibold"
            >
              {isLoading ? 'Generating...' : 'Generate Roadmap'}
            </button>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Get a comprehensive learning plan with resources, milestones, and practical exercises
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default Roadmap