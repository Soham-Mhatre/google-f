'use client'

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader, Plus, Trash2, Check } from 'lucide-react';
const apiUrl = process.env.REACT_APP_API_URL;

export default function Checklist() {
  const [checklistItems, setChecklistItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [newItemType, setNewItemType] = useState('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchChecklist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/checklist`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setChecklistItems(data.checklist);
    } catch (e) {
      console.error('Fetch error:', e);
      setError('An error occurred while fetching the checklist. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async () => {
    if (!newItem.trim()) return;
    try {
      const response = await fetch(`${apiUrl}/api/checklist/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: newItem, type: newItemType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setNewItem('');
      setChecklistItems((prev) => [...prev, data.item]);
    } catch (e) {
      console.error('Add item error:', e);
      setError('Failed to add item. Please try again.');
    }
  };

  const toggleItemCompletion = async (id, completed) => {
    try {
      const response = await fetch(`${apiUrl}/api/checklist/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: !completed }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setChecklistItems(checklistItems.map(item => 
        item._id === id ? { ...item, completed: !completed } : item
      ));
    } catch (e) {
      console.error('Toggle completion error:', e);
      setError('Failed to update item. Please try again.');
    }
  };

  const removeItem = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/api/checklist/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setChecklistItems(checklistItems.filter(item => item._id !== id));
    } catch (e) {
      console.error('Remove item error:', e);
      setError('Failed to remove item. Please try again.');
    }
  };

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
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">Checklist</h1>

      <div className="flex-grow overflow-auto">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-red-500 mb-4 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="text-center text-gray-600 dark:text-gray-300 flex items-center justify-center">
              <Loader className="w-6 h-6 animate-spin mr-2" />
              Loading...
            </div>
          ) : (
            <>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                className="mb-4 flex"
              >
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="flex-grow mr-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Add new item"
                />
                <select
                  value={newItemType}
                  onChange={(e) => setNewItemType(e.target.value)}
                  className="mr-2 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="chat">Chat</option>
                  <option value="roadmap">Roadmap</option>
                </select>
                <button 
                  onClick={addItem} 
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </motion.div>

              <AnimatePresence>
                {checklistItems.length === 0 ? (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-600 dark:text-gray-300"
                  >
                    No items in the checklist.
                  </motion.p>
                ) : (
                  checklistItems.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center mb-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                    >
                      <button
                        onClick={() => toggleItemCompletion(item._id, item.completed)}
                        className={`mr-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                          item.completed 
                            ? 'bg-green-500 border-green-500' 
                            : 'border-gray-300 dark:border-gray-500'
                        }`}
                      >
                        {item.completed && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <span className={`flex-grow ${item.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`}>
                        {item.content} 
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({item.type})</span>
                      </span>
                      <button 
                        onClick={() => removeItem(item._id)} 
                        className="text-red-500 hover:text-red-700 transition duration-300 ease-in-out"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}