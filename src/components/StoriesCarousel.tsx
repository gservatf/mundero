import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/useAuth';
import { mockApi } from '../lib/mockApi';
import { StoryViewer } from './StoryViewer';
import StoryUpload from './StoryUpload';
import { FiPlus, FiPlay } from 'react-icons/fi';
import { Story } from '../lib/types';

export const StoriesCarousel: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      setLoading(true);
      const allStories = await mockApi.getStories();
      setStories(allStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (index: number) => {
    setSelectedStoryIndex(index);
  };

  const handleCloseViewer = () => {
    setSelectedStoryIndex(null);
  };

  const handleNextStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex < stories.length - 1) {
      setSelectedStoryIndex(selectedStoryIndex + 1);
    } else {
      setSelectedStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (selectedStoryIndex !== null && selectedStoryIndex > 0) {
      setSelectedStoryIndex(selectedStoryIndex - 1);
    }
  };

  const handleStoryCreated = () => {
    loadStories();
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInHours = (now - timestamp) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Ahora';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}d`;
    }
  };

  // Agrupar historias por usuario
  const groupedStories = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    return acc;
  }, {} as Record<string, Story[]>);

  // Verificar si el usuario actual tiene historias
  const userStories = user ? groupedStories[user.id] || [] : [];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4 overflow-x-auto">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-2"></div>
                <div className="w-12 h-3 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {/* Add Story Button - Solo si el usuario está autenticado */}
            {user && (
              <div className="flex-shrink-0 text-center">
                <div
                  onClick={() => setShowUpload(true)}
                  className="relative w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <FiPlus className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-xs text-gray-600 mt-2 truncate w-16">Tu historia</p>
              </div>
            )}

            {/* User Stories */}
            {Object.entries(groupedStories).map(([userId, userStories], groupIndex) => {
              const latestStory = userStories[userStories.length - 1];
              const storyIndex = stories.findIndex(s => s.id === latestStory.id);
              
              return (
                <div key={userId} className="flex-shrink-0 text-center">
                  <div
                    onClick={() => handleStoryClick(storyIndex)}
                    className="relative cursor-pointer group"
                  >
                    <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 to-pink-600">
                      <Avatar className="w-full h-full border-2 border-white">
                        <AvatarImage 
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(latestStory.userId)}&background=3b82f6&color=fff`}
                        />
                        <AvatarFallback>
                          {latestStory.userId.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Play icon overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <FiPlay className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    
                    {/* Story count badge */}
                    {userStories.length > 1 && (
                      <Badge 
                        variant="secondary" 
                        className="absolute -top-1 -right-1 text-xs px-1.5 py-0.5 min-w-0 h-5"
                      >
                        {userStories.length}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-2 truncate w-16">
                    Usuario {userId.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimeAgo(latestStory.timestamp)}
                  </p>
                </div>
              );
            })}

            {/* Empty state */}
            {Object.keys(groupedStories).length === 0 && (
              <div className="flex-1 text-center py-8">
                <p className="text-gray-500">No hay historias disponibles</p>
                <p className="text-sm text-gray-400 mt-1">
                  {user ? 'Sé el primero en compartir una historia' : 'Inicia sesión para ver historias'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Story Viewer */}
      {selectedStoryIndex !== null && (
        <StoryViewer
          stories={stories}
          currentIndex={selectedStoryIndex}
          onClose={handleCloseViewer}
          onNext={handleNextStory}
          onPrev={handlePrevStory}
        />
      )}

      {/* Story Upload Modal */}
      {showUpload && (
        <StoryUpload
          onClose={() => setShowUpload(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}
    </>
  );
};