import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { StoryViewer } from './StoryViewer';
import { StoryUpload } from './StoryUpload';
import { FiPlus } from 'react-icons/fi';

interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  createdAt: Timestamp;
  expiresAt: Timestamp;
  userName?: string;
}

export const StoriesCarousel: React.FC = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [userStories, setUserStories] = useState<{ [userId: string]: Story[] }>({});
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Escuchar stories activos (no expirados)
    const now = Timestamp.now();
    const storiesRef = collection(db, 'user_stories');
    const q = query(
      storiesRef,
      where('expiresAt', '>', now),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const storiesList: Story[] = [];
      snapshot.forEach((doc) => {
        storiesList.push({ id: doc.id, ...doc.data() } as Story);
      });
      
      // Agrupar stories por usuario
      const grouped = storiesList.reduce((acc, story) => {
        if (!acc[story.userId]) {
          acc[story.userId] = [];
        }
        acc[story.userId].push(story);
        return acc;
      }, {} as { [userId: string]: Story[] });

      setStories(storiesList);
      setUserStories(grouped);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserName = (userId: string) => {
    // Aquí podrías obtener el nombre real del usuario desde Firestore
    return userId.substring(0, 8); // Placeholder
  };

  const hasUserStories = (userId: string) => {
    return userStories[userId] && userStories[userId].length > 0;
  };

  const getLatestStory = (userId: string) => {
    const stories = userStories[userId];
    return stories ? stories[0] : null;
  };

  const uniqueUsers = Object.keys(userStories);

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex-shrink-0 animate-pulse">
            <div className="w-16 h-16 bg-gray-300 rounded-full mb-2"></div>
            <div className="w-12 h-3 bg-gray-300 rounded mx-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border-b">
        <div className="flex space-x-4 p-4 overflow-x-auto scrollbar-hide">
          {/* Botón para agregar story */}
          <div className="flex-shrink-0 text-center">
            <button
              onClick={() => setShowUpload(true)}
              className="relative w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors group"
            >
              <FiPlus className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
            </button>
            <p className="text-xs text-gray-600 mt-2 truncate w-16">Tu historia</p>
          </div>

          {/* Stories de otros usuarios */}
          {uniqueUsers.map((userId) => {
            const latestStory = getLatestStory(userId);
            if (!latestStory) return null;

            return (
              <div key={userId} className="flex-shrink-0 text-center">
                <button
                  onClick={() => setSelectedUserId(userId)}
                  className="relative"
                >
                  <div className="w-16 h-16 p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-full">
                    <Avatar className="w-full h-full border-2 border-white">
                      <AvatarImage 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${userId}`} 
                      />
                      <AvatarFallback>
                        {getUserName(userId).substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {userStories[userId].length > 1 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 w-5 h-5 p-0 text-xs"
                    >
                      {userStories[userId].length}
                    </Badge>
                  )}
                </button>
                <p className="text-xs text-gray-600 mt-2 truncate w-16">
                  {getUserName(userId)}
                </p>
              </div>
            );
          })}

          {uniqueUsers.length === 0 && (
            <div className="flex-1 text-center py-8 text-gray-500">
              <p className="text-sm">No hay historias disponibles</p>
              <p className="text-xs">¡Sé el primero en compartir un momento!</p>
            </div>
          )}
        </div>
      </div>

      {/* Visor de stories */}
      {selectedUserId && (
        <StoryViewer
          stories={userStories[selectedUserId] || []}
          onClose={() => setSelectedUserId(null)}
          userName={getUserName(selectedUserId)}
        />
      )}

      {/* Modal de subida de story */}
      {showUpload && (
        <StoryUpload onClose={() => setShowUpload(false)} />
      )}
    </>
  );
};