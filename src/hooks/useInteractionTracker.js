import { useEffect, useRef } from 'react';
import { useFederatedLearning } from '../contexts/FederatedLearningContext';

/**
 * Hook to automatically track page interactions
 */
export const useInteractionTracker = (pageName, options = {}) => {
  const { trackInteraction, startSession, endSession } = useFederatedLearning();
  const sessionStartTime = useRef(null);
  const interactionCount = useRef(0);

  useEffect(() => {
    // Start session when component mounts
    const sessionId = startSession();
    sessionStartTime.current = Date.now();

    // Track page view
    trackInteraction({
      interactionType: 'page_view',
      topic: pageName,
      difficulty: options.difficulty || 'intermediate',
      metadata: {
        page: pageName,
        ...options.metadata
      }
    });

    // Cleanup on unmount
    return () => {
      const timeSpent = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      
      // Track page exit with time spent
      trackInteraction({
        interactionType: 'page_exit',
        topic: pageName,
        timeSpent,
        completed: interactionCount.current > 0,
        metadata: {
          page: pageName,
          interactions: interactionCount.current,
          ...options.metadata
        }
      });

      endSession();
    };
  }, [pageName]);

  /**
   * Track a specific interaction on the page
   */
  const track = (interactionType, details = {}) => {
    interactionCount.current += 1;

    trackInteraction({
      interactionType,
      topic: details.topic || pageName,
      subtopic: details.subtopic,
      difficulty: details.difficulty || options.difficulty || 'intermediate',
      timeSpent: details.timeSpent,
      completed: details.completed,
      score: details.score,
      feedback: details.feedback,
      metadata: {
        page: pageName,
        ...details.metadata
      }
    });
  };

  return { track };
};

/**
 * Hook to track chatbot interactions
 */
export const useChatbotTracker = () => {
  const { track } = useInteractionTracker('chatbot');

  const trackMessage = (topic, messageLength, responseTime) => {
    track('chatbot', {
      topic,
      metadata: {
        messageLength,
        responseTime
      }
    });
  };

  const trackFeedback = (topic, helpful, rating) => {
    track('chatbot', {
      topic,
      feedback: { helpful, rating },
      completed: true
    });
  };

  return { trackMessage, trackFeedback };
};

/**
 * Hook to track roadmap interactions
 */
export const useRoadmapTracker = () => {
  const { track } = useInteractionTracker('roadmap');

  const trackRoadmapGeneration = (topic, duration, completed) => {
    track('roadmap', {
      topic,
      metadata: { duration },
      completed
    });
  };

  const trackRoadmapView = (topic, timeSpent) => {
    track('roadmap', {
      topic,
      timeSpent,
      completed: true
    });
  };

  return { trackRoadmapGeneration, trackRoadmapView };
};

/**
 * Hook to track checklist interactions
 */
export const useChecklistTracker = () => {
  const { track } = useInteractionTracker('checklist');

  const trackChecklistItem = (topic, completed, timeSpent) => {
    track('checklist', {
      topic,
      completed,
      timeSpent
    });
  };

  const trackChecklistProgress = (topic, completionRate) => {
    track('checklist', {
      topic,
      score: completionRate,
      completed: completionRate >= 100
    });
  };

  return { trackChecklistItem, trackChecklistProgress };
};

/**
 * Hook to track video/resource interactions
 */
export const useResourceTracker = () => {
  const { trackInteraction } = useFederatedLearning();

  const trackVideoWatch = (topic, duration, completed) => {
    trackInteraction({
      interactionType: 'video_watch',
      topic,
      timeSpent: duration,
      completed
    });
  };

  const trackResourceClick = (topic, resourceType) => {
    trackInteraction({
      interactionType: 'resource_click',
      topic,
      metadata: { resourceType }
    });
  };

  const trackArticleRead = (topic, readingTime, completed) => {
    trackInteraction({
      interactionType: 'article_read',
      topic,
      timeSpent: readingTime,
      completed
    });
  };

  return { trackVideoWatch, trackResourceClick, trackArticleRead };
};

/**
 * Hook to track quiz/assessment interactions
 */
export const useQuizTracker = () => {
  const { trackInteraction } = useFederatedLearning();

  const trackQuizAttempt = (topic, difficulty, score, timeSpent) => {
    trackInteraction({
      interactionType: 'quiz',
      topic,
      difficulty,
      score,
      timeSpent,
      completed: true
    });
  };

  const trackQuizQuestion = (topic, difficulty, correct) => {
    trackInteraction({
      interactionType: 'quiz',
      topic,
      difficulty,
      score: correct ? 100 : 0,
      completed: true,
      metadata: { correct }
    });
  };

  return { trackQuizAttempt, trackQuizQuestion };
};
