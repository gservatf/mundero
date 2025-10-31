import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Share2,
    Copy,
    MessageCircle,
    Linkedin,
    Facebook,
    Twitter,
    ExternalLink,
    Check,
    X
} from 'lucide-react';
import { FeedPost } from '../../services/feedService';
import { Button } from '../../../../../components/ui/button';

interface ShareMenuProps {
    post: FeedPost;
    variant?: 'icon' | 'button';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

interface ShareOption {
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    color: string;
    hoverColor: string;
    action: 'copy-link' | 'copy-content' | 'external';
    url?: string;
}

export const ShareMenu: React.FC<ShareMenuProps> = ({
    post,
    variant = 'icon',
    size = 'md',
    className = ''
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const getPostUrl = (post: FeedPost): string => {
        return `${window.location.origin}/post/${post.id}`;
    };

    const shareOptions: ShareOption[] = [
        {
            id: 'copy-link',
            name: 'Copiar enlace',
            icon: Copy,
            color: 'text-blue-600',
            hoverColor: 'hover:text-blue-700',
            action: 'copy-link'
        },
        {
            id: 'copy-content',
            name: 'Copiar contenido',
            icon: MessageCircle,
            color: 'text-gray-600',
            hoverColor: 'hover:text-gray-700',
            action: 'copy-content'
        },
        {
            id: 'twitter',
            name: 'Compartir en X',
            icon: Twitter,
            color: 'text-black',
            hoverColor: 'hover:text-gray-700',
            action: 'external',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.content.text || '')}&url=${encodeURIComponent(getPostUrl(post))}`
        },
        {
            id: 'facebook',
            name: 'Compartir en Facebook',
            icon: Facebook,
            color: 'text-blue-600',
            hoverColor: 'hover:text-blue-700',
            action: 'external',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getPostUrl(post))}`
        },
        {
            id: 'linkedin',
            name: 'Compartir en LinkedIn',
            icon: Linkedin,
            color: 'text-blue-700',
            hoverColor: 'hover:text-blue-800',
            action: 'external',
            url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getPostUrl(post))}`
        }
    ];

    const handleShare = async (option: ShareOption) => {
        try {
            if (option.action === 'copy-link') {
                await navigator.clipboard.writeText(getPostUrl(post));
                setCopiedId(option.id);
                setTimeout(() => setCopiedId(null), 2000);
            } else if (option.action === 'copy-content') {
                const textContent = post.content.text || '';
                await navigator.clipboard.writeText(textContent);
                setCopiedId(option.id);
                setTimeout(() => setCopiedId(null), 2000);
            } else if (option.action === 'external' && option.url) {
                window.open(option.url, '_blank', 'width=600,height=400');
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Error al compartir:', error);
        }
    };

    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    const buttonSizeClasses = {
        sm: 'h-6 w-6 p-0',
        md: 'h-8 w-8 p-0',
        lg: 'h-10 w-10 p-0'
    };

    return (
        <div className="relative">
            {/* Trigger Button */}
            {variant === 'button' ? (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className={className}
                >
                    <Share2 className={sizeClasses[size]} />
                    <span className="ml-2">Compartir</span>
                </Button>
            ) : (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`${buttonSizeClasses[size]} text-gray-500 hover:text-blue-600 transition-colors ${className}`}
                    title="Compartir post"
                >
                    <Share2 className={sizeClasses[size]} />
                </Button>
            )}

            {/* Share Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 bottom-full mb-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-100">
                                <h3 className="font-semibold text-gray-900">Compartir post</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Share Options */}
                            <div className="p-2">
                                {shareOptions.map((option) => {
                                    const IconComponent = option.icon;
                                    const isCopied = copiedId === option.id;

                                    return (
                                        <motion.button
                                            key={option.id}
                                            onClick={() => handleShare(option)}
                                            className={`
                                                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg
                                                transition-all duration-200 text-left
                                                hover:bg-gray-50 hover:scale-[1.02]
                                                ${isCopied ? 'bg-green-50' : ''}
                                            `}
                                            whileHover={{ x: 2 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className={`
                                                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                                                ${isCopied
                                                    ? 'bg-green-100'
                                                    : 'bg-gray-100'
                                                }
                                            `}>
                                                <AnimatePresence mode="wait">
                                                    {isCopied ? (
                                                        <motion.div
                                                            key="check"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            exit={{ scale: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <Check className="h-5 w-5 text-green-600" />
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="icon"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            exit={{ scale: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <IconComponent
                                                                className={`h-5 w-5 ${option.color} ${option.hoverColor}`}
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <div className="flex-1">
                                                <div className={`
                                                    font-medium transition-colors
                                                    ${isCopied
                                                        ? 'text-green-700'
                                                        : 'text-gray-900'
                                                    }
                                                `}>
                                                    {isCopied ? '¡Copiado!' : option.name}
                                                </div>
                                                {option.id === 'copy-link' && (
                                                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                                                        {getPostUrl(post)}
                                                    </div>
                                                )}
                                                {option.id === 'copy-content' && (
                                                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                                        {(post.content.text || '').substring(0, 50)}...
                                                    </div>
                                                )}
                                            </div>

                                            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 bg-gray-50 rounded-b-lg">
                                <p className="text-xs text-gray-500 text-center">
                                    Compartir te ayuda a amplificar el alcance de tu contenido
                                </p>
                            </div>
                        </motion.div>

                        {/* Background Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black bg-opacity-10 z-40"
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};