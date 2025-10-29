import React, { useState, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  type: 'image' | 'video';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

interface StoryViewerProps {
  stories: Story[];
  onClose: () => void;
  userName: string;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  stories, 
  onClose, 
  userName 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentStory = stories[currentIndex];
  const storyDuration = 5000; // 5 segundos por story

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + (100 / (storyDuration / 100));
        
        if (newProgress >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return 100;
          }
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, stories.length, onClose, isPaused]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const formatTimeAgo = (timestamp: Timestamp) => {
    const now = new Date();
    const storyTime = timestamp.toDate();
    const diffInHours = (now.getTime() - storyTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}d`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onKeyDown={handleKeyPress}
      tabIndex={0}
    >
      {/* Barras de progreso */}
      <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
        {stories.map((_, index) => (
          <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-100"
              style={{ 
                width: index < currentIndex ? '100%' : 
                       index === currentIndex ? `${progress}%` : '0%' 
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 border-2 border-white">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userName}`} />
            <AvatarFallback>{userName.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-medium">{userName}</p>
            <p className="text-white/80 text-sm">
              {formatTimeAgo(currentStory.createdAt)}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <FiX className="w-6 h-6" />
        </Button>
      </div>

      {/* Contenido del story */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onClick={() => setIsPaused(!isPaused)}
      >
        {currentStory.type === 'image' ? (
          <img 
            src={currentStory.mediaUrl} 
            alt="Story" 
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <video 
            src={currentStory.mediaUrl} 
            autoPlay 
            muted 
            className="max-w-full max-h-full object-contain"
            onPause={() => setIsPaused(true)}
            onPlay={() => setIsPaused(false)}
          />
        )}
      </div>

      {/* Controles de navegación */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        disabled={currentIndex === 0}
      >
        <FiChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
      >
        <FiChevronRight className="w-8 h-8" />
      </button>

      {/* Indicador de pausa */}
      {isPaused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 rounded-full p-4">
          <div className="w-0 h-0 border-l-8 border-l-white border-t-4 border-t-transparent border-b-4 border-b-transparent ml-1"></div>
        </div>
      )}
    </div>
  );
};