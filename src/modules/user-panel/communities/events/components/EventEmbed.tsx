// FASE 6.4 — EventEmbed Component
import React, { useEffect, useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Card } from '../../../../../components/ui/card';
import { X, ExternalLink, AlertTriangle } from 'lucide-react';

interface EventEmbedProps {
    url: string;
    title: string;
    onClose: () => void;
    maxWidth?: string;
    maxHeight?: string;
}

export function EventEmbed({
    url,
    title,
    onClose,
    maxWidth = '100%',
    maxHeight = '600px'
}: EventEmbedProps) {
    const [isValidEmbed, setIsValidEmbed] = useState(false);
    const [embedUrl, setEmbedUrl] = useState('');
    const [platform, setPlatform] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        validateAndTransformUrl(url);
    }, [url]);

    const validateAndTransformUrl = (inputUrl: string) => {
        try {
            const urlObj = new URL(inputUrl);
            const domain = urlObj.hostname.toLowerCase();

            // YouTube
            if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
                const videoId = extractYouTubeId(inputUrl);
                if (videoId) {
                    setEmbedUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`);
                    setPlatform('YouTube');
                    setIsValidEmbed(true);
                    return;
                }
            }

            // Google Meet
            if (domain.includes('meet.google.com')) {
                setEmbedUrl(inputUrl);
                setPlatform('Google Meet');
                setIsValidEmbed(true);
                return;
            }

            // Google Drive
            if (domain.includes('drive.google.com')) {
                const fileId = extractGoogleDriveId(inputUrl);
                if (fileId) {
                    setEmbedUrl(`https://drive.google.com/file/d/${fileId}/preview`);
                    setPlatform('Google Drive');
                    setIsValidEmbed(true);
                    return;
                }
            }

            // Zoom
            if (domain.includes('zoom.us') || domain.includes('zoom.com')) {
                setEmbedUrl(inputUrl);
                setPlatform('Zoom');
                setIsValidEmbed(true);
                return;
            }

            // Twitch
            if (domain.includes('twitch.tv')) {
                const channel = extractTwitchChannel(inputUrl);
                if (channel) {
                    setEmbedUrl(`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`);
                    setPlatform('Twitch');
                    setIsValidEmbed(true);
                    return;
                }
            }

            // Vimeo
            if (domain.includes('vimeo.com')) {
                const videoId = extractVimeoId(inputUrl);
                if (videoId) {
                    setEmbedUrl(`https://player.vimeo.com/video/${videoId}?autoplay=1`);
                    setPlatform('Vimeo');
                    setIsValidEmbed(true);
                    return;
                }
            }

            // Si no coincide con ninguna plataforma conocida, intentar embed directo
            if (isSecureUrl(inputUrl)) {
                setEmbedUrl(inputUrl);
                setPlatform('Contenido externo');
                setIsValidEmbed(true);
            } else {
                setError('URL no compatible o insegura para embed');
                setIsValidEmbed(false);
            }

        } catch (err) {
            setError('URL inválida');
            setIsValidEmbed(false);
        }
    };

    const extractYouTubeId = (url: string): string | null => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const extractGoogleDriveId = (url: string): string | null => {
        const match = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        return match ? match[1] : null;
    };

    const extractTwitchChannel = (url: string): string | null => {
        const match = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
        return match ? match[1] : null;
    };

    const extractVimeoId = (url: string): string | null => {
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    };

    const isSecureUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    const handleOpenExternal = () => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-6xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold truncate">{title}</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {platform}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={handleOpenExternal} variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir en nueva pestaña
                        </Button>
                        <Button onClick={onClose} variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                    {error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                            <h4 className="text-lg font-medium text-gray-900 mb-2">
                                No se puede mostrar el contenido
                            </h4>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Button onClick={handleOpenExternal} className="px-6">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Abrir enlace original
                            </Button>
                        </div>
                    ) : isValidEmbed ? (
                        <div className="relative w-full h-full min-h-[400px]">
                            <iframe
                                src={embedUrl}
                                title={title}
                                className="w-full h-full border-0 rounded-lg"
                                style={{ maxWidth, maxHeight }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                    <div className="text-sm text-gray-500">
                        🔒 Contenido mostrado de forma segura
                    </div>
                    <div className="flex items-center gap-2">
                        <Button onClick={onClose} variant="outline" size="sm">
                            Cerrar
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}