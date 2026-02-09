// Service to get personalized video recommendations based on user interactions
export const getPersonalizedVideoTopics = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return [];
    }

    // Fetch user's recent interactions to determine interests
    const response = await fetch('http://localhost:5000/api/federated/interactions/me?limit=100', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return getDefaultTopics();
    }

    const data = await response.json();
    const interactions = data.interactions || [];

    console.log(`[Video Recommendations] Found ${interactions.length} interactions`);

    if (interactions.length === 0) {
      return getDefaultTopics();
    }

    // Analyze interactions with recency weighting
    const topicFrequency = {};
    interactions.forEach((interaction, index) => {
      const topic = interaction.topic;
      if (topic) {
        // More recent interactions get higher weight
        const recencyWeight = 1 + (index / interactions.length);
        topicFrequency[topic] = (topicFrequency[topic] || 0) + recencyWeight;
      }
    });

    console.log('[Video Recommendations] Topic frequency with recency:', topicFrequency);

    // Get top 4 most frequent topics
    const sortedTopics = Object.entries(topicFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([topic]) => topic);

    console.log('[Video Recommendations] Top topics:', sortedTopics);

    // Map internal topics to video categories
    const videoTopics = mapToVideoCategories(sortedTopics);

    console.log('[Video Recommendations] Mapped video topics:', videoTopics);

    return videoTopics.length > 0 ? videoTopics : getDefaultTopics();
  } catch (error) {
    console.error('Error fetching personalized topics:', error);
    return getDefaultTopics();
  }
};

// Map user interaction topics to video categories
const mapToVideoCategories = (topics) => {
  const categoryMap = {
    'ai': 'AI',
    'artificial intelligence': 'AI',
    'ml': 'Machine Learning',
    'machine learning': 'Machine Learning',
    'data': 'Data Science',
    'data science': 'Data Science',
    'python': 'Python',
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'react': 'React',
    'web': 'Web Development',
    'web development': 'Web Development',
    'frontend': 'Web Development',
    'backend': 'Web Development',
    'full stack': 'Web Development',
    'node': 'Web Development',
    'game': 'Game Development',
    'unity': 'Game Development',
    'mobile': 'Mobile Development',
    'android': 'Mobile Development',
    'ios': 'Mobile Development',
    'cloud': 'Cloud Computing',
    'aws': 'AWS',
    'azure': 'Cloud Computing',
    'security': 'Cybersecurity',
    'cyber': 'Cybersecurity',
    'blockchain': 'Blockchain',
    'database': 'Database',
    'sql': 'SQL',
    'devops': 'DevOps',
    'docker': 'DevOps',
    'design': 'UI/UX',
    'ui': 'UI/UX',
    'ux': 'UI/UX',
    'roadmap': 'Career Paths',
    'placement': 'Interview Prep',
    'interview': 'Interview Prep'
  };

  const categoryScores = {};
  
  topics.forEach(topic => {
    const topicLower = topic.toLowerCase();
    let matched = false;
    
    for (const [key, category] of Object.entries(categoryMap)) {
      if (topicLower.includes(key) || key.includes(topicLower)) {
        categoryScores[category] = (categoryScores[category] || 0) + 1;
        matched = true;
      }
    }
    
    // If no match, use original topic (capitalized)
    if (!matched && topic.length > 3) {
      const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);
      categoryScores[capitalizedTopic] = 1;
    }
  });

  // Return top 4 categories sorted by score
  return Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category]) => category);
};

// Default topics if no interactions are found
const getDefaultTopics = () => {
  return ['Web Development', 'Python', 'AI', 'React'];
};

export default {
  getPersonalizedVideoTopics
};
