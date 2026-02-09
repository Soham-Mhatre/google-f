import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlayCircle, Youtube, TrendingUp } from 'lucide-react';
import { getPersonalizedVideoTopics } from '../services/recommendationService';

const YouTubeRecommendations = () => {
  const [videos, setVideos] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      loadRecommendedVideos();
    } else {
      setLoading(false);
    }
  }, []);

  const loadRecommendedVideos = async () => {
    try {
      // Get personalized topics based on user interactions
      const recommendedTopics = await getPersonalizedVideoTopics();
      setVideos(getYouTubeVideos(recommendedTopics));
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeVideos = (topics) => {
    // Curated educational YouTube videos for different topics (COMPLETELY UNIQUE - NO OVERLAP WITH COURSES)
    const videoDatabase = {
      'Web Development': [
        {
          id: 'EerdGm-ehJQ',
          title: 'HTML & CSS Full Course - Beginner to Pro',
          channel: 'SuperSimpleDev',
          views: '2.8M',
          duration: '6:31:24'
        },
        {
          id: 'hdI2bqOjy3c',
          title: 'JavaScript Crash Course For Beginners',
          channel: 'Traversy Media',
          views: '4.1M',
          duration: '1:40:17'
        },
        {
          id: 'SqcY0GlETPk',
          title: 'React Tutorial for Beginners',
          channel: 'Programming with Mosh',
          views: '5.6M',
          duration: '1:18:39'
        }
      ],
      'Frontend': [
        {
          id: 'EerdGm-ehJQ',
          title: 'HTML & CSS Full Course - Beginner to Pro',
          channel: 'SuperSimpleDev',
          views: '2.8M',
          duration: '6:31:24'
        },
        {
          id: 'UB1O30fR-EE',
          title: 'HTML Crash Course For Absolute Beginners',
          channel: 'Traversy Media',
          views: '3.9M',
          duration: '1:00:41'
        }
      ],
      'Backend': [
        {
          id: 'fBNz5xF-Kx4',
          title: 'Node.js Tutorial for Beginners',
          channel: 'Programming with Mosh',
          views: '3.2M',
          duration: '1:06:28'
        },
        {
          id: 'ENrzD9HAZK4',
          title: 'Node.js & Express From Scratch',
          channel: 'Traversy Media',
          views: '1.8M',
          duration: '1:13:30'
        }
      ],
      'Python': [
        {
          id: '_uQrJ0TkZlc',
          title: 'Python Tutorial - Python Full Course for Beginners',
          channel: 'Programming with Mosh',
          views: '23M',
          duration: '6:14:07'
        },
        {
          id: 'kqtD5dpn9C8',
          title: 'Python for Beginners - Learn Python in 1 Hour',
          channel: 'Programming with Mosh',
          views: '8.5M',
          duration: '1:00:05'
        },
        {
          id: '8DvywoWv6fI',
          title: 'Python Tutorial for Beginners',
          channel: 'Telusko',
          views: '12M',
          duration: '11:51:50'
        }
      ],
      'Programming': [
        {
          id: '_uQrJ0TkZlc',
          title: 'Python Tutorial - Python Full Course for Beginners',
          channel: 'Programming with Mosh',
          views: '23M',
          duration: '6:14:07'
        },
        {
          id: 'RBSGKlAvoiM',
          title: 'Data Structures and Algorithms',
          channel: 'freeCodeCamp.org',
          views: '7.8M',
          duration: '5:17:20'
        }
      ],
      'AI': [
        {
          id: 'VyWAvY2CF9c',
          title: 'AI For Everyone - Complete Course',
          channel: 'freeCodeCamp.org',
          views: '1.5M',
          duration: '1:15:32'
        },
        {
          id: 'JMUxmLyrhSk',
          title: 'Build 5 AI Projects with Python',
          channel: 'freeCodeCamp.org',
          views: '890K',
          duration: '1:43:12'
        },
        {
          id: 'tPYj3fFJGjk',
          title: 'ChatGPT Tutorial - A Crash Course',
          channel: 'freeCodeCamp.org',
          views: '1.2M',
          duration: '1:26:54'
        }
      ],
      'Artificial Intelligence': [
        {
          id: 'VyWAvY2CF9c',
          title: 'AI For Everyone - Complete Course',
          channel: 'freeCodeCamp.org',
          views: '1.5M',
          duration: '1:15:32'
        },
        {
          id: 'JMUxmLyrhSk',
          title: 'Build 5 AI Projects with Python',
          channel: 'freeCodeCamp.org',
          views: '890K',
          duration: '1:43:12'
        }
      ],
      'Machine Learning': [
        {
          id: 'i_LwzRVP7bg',
          title: 'Machine Learning for Everybody',
          channel: 'Kylie Ying',
          views: '1.9M',
          duration: '3:50:17'
        },
        {
          id: '7eh4d6sabA0',
          title: 'PyTorch for Deep Learning & Machine Learning',
          channel: 'freeCodeCamp.org',
          views: '1.3M',
          duration: '25:41:12'
        },
        {
          id: 'tZeLHU1Ne8w',
          title: 'Scikit Learn Tutorial - Machine Learning',
          channel: 'codebasics',
          views: '670K',
          duration: '1:43:23'
        }
      ],
      'Data Science': [
        {
          id: 'ua-CiDNNj30',
          title: 'Data Science Tutorial For Beginners',
          channel: 'Simplilearn',
          views: '2.1M',
          duration: '4:28:32'
        },
        {
          id: 'r-uOLxNrNk8',
          title: 'Data Analyst Bootcamp',
          channel: 'Alex The Analyst',
          views: '3.4M',
          duration: '4:13:03'
        },
        {
          id: 'CmorAWRsCAw',
          title: 'Pandas Full Course',
          channel: 'codebasics',
          views: '890K',
          duration: '4:07:22'
        }
      ],
      'React': [
        {
          id: 'SqcY0GlETPk',
          title: 'React Tutorial for Beginners',
          channel: 'Programming with Mosh',
          views: '5.6M',
          duration: '1:18:39'
        },
        {
          id: 'w7ejDZ8SWv8',
          title: 'React JS Crash Course',
          channel: 'Traversy Media',
          views: '2.8M',
          duration: '1:48:48'
        },
        {
          id: 'j942wKiXFu8',
          title: 'React Project Tutorial - Build a Portfolio',
          channel: 'JavaScript Mastery',
          views: '1.4M',
          duration: '2:31:17'
        }
      ],
      'JavaScript': [
        {
          id: 'hdI2bqOjy3c',
          title: 'JavaScript Crash Course For Beginners',
          channel: 'Traversy Media',
          views: '4.1M',
          duration: '1:40:17'
        },
        {
          id: 'W6NZfCO5SIk',
          title: 'JavaScript Tutorial for Beginners',
          channel: 'Programming with Mosh',
          views: '12M',
          duration: '1:05:44'
        },
        {
          id: 'lI1ae4REbFM',
          title: 'JavaScript ES6, ES7, ES8',
          channel: 'Traversy Media',
          views: '1.2M',
          duration: '44:40'
        }
      ],
      'Mobile Development': [
        {
          id: 'VnzJsG0WPHA',
          title: 'React Native Tutorial for Beginners',
          channel: 'Programming with Mosh',
          views: '1.6M',
          duration: '2:59:55'
        },
        {
          id: 'fgdpvwEWJ9M',
          title: 'Flutter Course - Full Tutorial for Beginners',
          channel: 'freeCodeCamp.org',
          views: '2.3M',
          duration: '5:16:27'
        }
      ],
      'Game Development': [
        {
          id: 'whzomFgjT50',
          title: 'Unity Tutorial for Complete Beginners',
          channel: 'Brackeys',
          views: '4.2M',
          duration: '2:02:03'
        },
        {
          id: 'XtQMytORBmM',
          title: 'Create a 2D Game with Unity',
          channel: 'Brackeys',
          views: '2.1M',
          duration: '1:18:15'
        }
      ],
      'Cloud Computing': [
        {
          id: 'SOTamWNgDKc',
          title: 'AWS Certified Cloud Practitioner Training',
          channel: 'freeCodeCamp.org',
          views: '3.2M',
          duration: '13:59:45'
        },
        {
          id: 'NKEFWyqJ5XA',
          title: 'Azure Full Course - Learn Microsoft Azure',
          channel: 'Edureka',
          views: '1.8M',
          duration: '4:12:56'
        }
      ],
      'AWS': [
        {
          id: 'SOTamWNgDKc',
          title: 'AWS Certified Cloud Practitioner Training',
          channel: 'freeCodeCamp.org',
          views: '3.2M',
          duration: '13:59:45'
        },
        {
          id: 'ulprqHHWlng',
          title: 'AWS Tutorial For Beginners',
          channel: 'Simplilearn',
          views: '2.4M',
          duration: '5:38:27'
        }
      ],
      'Cybersecurity': [
        {
          id: 'U_P23SqJaDc',
          title: 'Ethical Hacking Full Course',
          channel: 'freeCodeCamp.org',
          views: '4.7M',
          duration: '15:00:32'
        },
        {
          id: 'lpaEmS9yZSo',
          title: 'CompTIA Security+ Full Course',
          channel: 'Professor Messer',
          views: '1.9M',
          duration: '11:23:45'
        }
      ],
      'DevOps': [
        {
          id: 'hQcFE0RD0cQ',
          title: 'Docker Tutorial for Beginners',
          channel: 'Programming with Mosh',
          views: '2.7M',
          duration: '1:11:18'
        },
        {
          id: 'X48VuDVv0do',
          title: 'Kubernetes Tutorial for Beginners',
          channel: 'TechWorld with Nana',
          views: '3.8M',
          duration: '3:53:18'
        }
      ],
      'Database': [
        {
          id: 'HXV3zeQKqGY',
          title: 'SQL Tutorial - Full Database Course',
          channel: 'freeCodeCamp.org',
          views: '9.8M',
          duration: '4:20:07'
        },
        {
          id: 'qw--VYLpxG4',
          title: 'PostgreSQL Tutorial Full Course',
          channel: 'Amigoscode',
          views: '1.2M',
          duration: '4:18:21'
        }
      ],
      'SQL': [
        {
          id: 'HXV3zeQKqGY',
          title: 'SQL Tutorial - Full Database Course',
          channel: 'freeCodeCamp.org',
          views: '9.8M',
          duration: '4:20:07'
        },
        {
          id: '7S_tz1z_5bA',
          title: 'MySQL Tutorial for Beginners',
          channel: 'Programming with Mosh',
          views: '8.3M',
          duration: '3:10:14'
        }
      ],
      'UI/UX': [
        {
          id: 'c9Wg6Cb_YlU',
          title: 'UI Design for Beginners',
          channel: 'DesignCourse',
          views: '1.4M',
          duration: '1:45:32'
        },
        {
          id: '_P7wHN_kOv4',
          title: 'Figma Tutorial - UI Design',
          channel: 'DesignCourse',
          views: '980K',
          duration: '1:23:12'
        }
      ],
      'Interview Prep': [
        {
          id: 'fvZdb_uTdqo',
          title: 'How to: Work at Google — Example Coding/Engineering Interview',
          channel: 'Life at Google',
          views: '7.8M',
          duration: '27:26'
        },
        {
          id: 'RBSGKlAvoiM',
          title: 'Data Structures and Algorithms',
          channel: 'freeCodeCamp.org',
          views: '7.8M',
          duration: '5:17:20'
        }
      ],
      'Career Paths': [
        {
          id: '2oLhxbhMzCA',
          title: 'How I Would Learn To Code (If I Could Start Over)',
          channel: 'ThePrimeTime',
          views: '1.2M',
          duration: '14:32'
        },
        {
          id: 'oC483DTjRXU',
          title: 'Software Engineer Career Path',
          channel: 'freeCodeCamp.org',
          views: '890K',
          duration: '53:18'
        }
      ]
    };

    const selectedVideos = [];
    const usedIds = new Set();

    // Get videos for each topic, avoiding duplicates
    topics.forEach(topic => {
      const topicVideos = videoDatabase[topic] || [];
      topicVideos.forEach(video => {
        if (!usedIds.has(video.id) && selectedVideos.length < 6) {
          selectedVideos.push(video);
          usedIds.add(video.id);
        }
      });
    });

    // If we don't have enough videos, add some popular ones
    if (selectedVideos.length < 6) {
      const fallbackVideos = [
        {
          id: '_uQrJ0TkZlc',
          title: 'Python Tutorial - Python Full Course for Beginners',
          channel: 'Programming with Mosh',
          views: '23M',
          duration: '6:14:07'
        },
        {
          id: 'hdI2bqOjy3c',
          title: 'JavaScript Crash Course For Beginners',
          channel: 'Traversy Media',
          views: '4.1M',
          duration: '1:40:17'
        },
        {
          id: 'SqcY0GlETPk',
          title: 'React Tutorial for Beginners',
          channel: 'Programming with Mosh',
          views: '5.6M',
          duration: '1:18:39'
        }
      ];

      fallbackVideos.forEach(video => {
        if (!usedIds.has(video.id) && selectedVideos.length < 6) {
          selectedVideos.push(video);
          usedIds.add(video.id);
        }
      });
    }

    return selectedVideos.slice(0, 6);
  };

  const getYouTubeEmbedUrl = (videoId) => {
    return `https://www.youtube.com/embed/${videoId}`;
  };

  const getThumbnailUrl = (videoId) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  // Don't show anything if user is not logged in
  if (!isLoggedIn) {
    return null;
  }

  if (loading) {
    return (
      <div className="py-16 bg-white">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Youtube className="w-10 h-10 text-red-600" />
            <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Recommended Learning Videos
            </h2>
          </div>
          <p className="text-gray-600 text-lg">
            Hand-picked educational content to accelerate your learning
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <a
                href={`https://www.youtube.com/watch?v=${video.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={getThumbnailUrl(video.id)}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-8 h-8 text-white fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold">
                    {video.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-red-600 transition-colors line-clamp-2 mb-3">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="font-medium">{video.channel}</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{video.views} views</span>
                    </div>
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 text-sm">
            Videos open in a new tab • Content curated from educational YouTube channels
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default YouTubeRecommendations;
