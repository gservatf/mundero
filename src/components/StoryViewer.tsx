import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Story } from '../lib/types';

interface StoryViewerProps {
  stories: Story[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({ 
  stories, 
  currentIndex,
  onClose, 
  onNext,
  onPrev
}) => {
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
          onNext();
          return 0;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, onNext, isPaused]);

  useEffect(() => {
    setProgress(0);
  }, [currentIndex]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffInHours = (now - timestamp) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}d`;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === 'Escape') onClose();
  };

  if (!currentStory) return null;

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
            <AvatarImage src={`https://ui-avatars.com/api/?name=Usuario${currentStory.userId}&background=3b82f6&color=fff`} />
            <AvatarFallback>{currentStory.userId.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-white font-medium">Usuario {currentStory.userId}</p>
            <p className="text-white/80 text-sm">
              {formatTimeAgo(currentStory.timestamp)}
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
        className="relative w-full h-full flex items-center justify-center p-16"
        onClick={() => setIsPaused(!isPaused)}
      >
        {currentStory.mediaUrl ? (
          <img 
            src={currentStory.mediaUrl} 
            alt="Story" 
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        ) : (
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-lg max-w-md">
            <p className="text-white text-lg text-center font-medium">
              {currentStory.content}
            </p>
          </div>
        )}
      </div>

      {/* Controles de navegación */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
        disabled={currentIndex === 0}
      >
        <FiChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={onNext}
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