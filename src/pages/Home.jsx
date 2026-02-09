import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, MessageCircle, CheckSquare, GraduationCap } from 'lucide-react'
import RecommendedCourses from '../components/RecommendedCourses'
import YouTubeRecommendations from '../components/YouTubeRecommendations'

const apiUrl = 'https://google-b-1-y2sb.onrender.com';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-gray-900 dark:text-gray-100 p-4 py-20">
        <motion.h1 
          className="text-5xl md:text-6xl font-bold mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to Learning Companion
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl mb-12 text-center max-w-3xl text-gray-700 dark:text-gray-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Your personal AI-powered guide to effective learning and skill development
        </motion.p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/courses" className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border-2 border-transparent hover:border-purple-500">
              <GraduationCap className="w-12 h-12 text-purple-500 mb-4" />
              <span className="text-lg font-semibold">Browse Courses</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Explore 27+ courses</span>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/roadmap" className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border-2 border-transparent hover:border-blue-500">
              <BookOpen className="w-12 h-12 text-blue-500 mb-4" />
              <span className="text-lg font-semibold">Create Roadmap</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Plan your learning path</span>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Link to="/chatbot" className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border-2 border-transparent hover:border-green-500">
              <MessageCircle className="w-12 h-12 text-green-500 mb-4" />
              <span className="text-lg font-semibold">AI Chatbot</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Get instant answers</span>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link to="/checklist" className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border-2 border-transparent hover:border-pink-500">
              <CheckSquare className="w-12 h-12 text-pink-500 mb-4" />
              <span className="text-lg font-semibold">Checklist</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">Track your progress</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Recommended Courses Section */}
      <RecommendedCourses />

      {/* YouTube Recommendations Section */}
      <YouTubeRecommendations />
    </div>
  )
}

export default Home