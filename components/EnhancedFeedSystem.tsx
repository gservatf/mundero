import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiImage, FiFileText, FiHeart, FiMessageCircle, FiShare, FiMoreHorizontal, 
  FiSend, FiX, FiLink, FiPlay, FiPause, FiVolume2, FiMaximize2, FiChevronLeft, 
  FiChevronRight, FiExternalLink, FiDownload, FiBookmark, FiFlag
} from 'react-icons/fi';
import { FaYoutube, FaGoogleDrive } from 'react-icons/fa';
import { useMockAuth } from '../hooks/useMockData';
import toast from 'react-hot-toast';

interface MediaItem {
  type: 'image' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  title?: string;
  duration?: string;
}

interface Post {
  id: string;
  author: {
    name: string;
    title: string;
    company: string;
    avatar: string;
    verified: boolean;
    followers: number;
  };
  content: string;
  media: MediaItem[];
  externalLink?: {
    url: string;
    title: string;
    description: string;
    thumbnail: string;
    domain: string;
  };
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
  engagement: {
    views: number;
    clickThrough: number;
  };
  tags: string[];
}

const EnhancedFeedSystem = () => {
  const { user } = useMockAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ post: string; index: number } | null>(null);
  const [newPost, setNewPost] = useState({
    content: '',
    links: [] as string[],
    currentLink: ''
  });

  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'María González',
        title: 'Directora de Operaciones',
        company: 'Consulting Pro EIRL',
        avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff',
        verified: true,
        followers: 2847
      },
      content: '🚀 Increíble presentación sobre transformación digital en el sector minero. Los resultados hablan por sí solos: 40% de reducción en costos operativos y 60% de mejora en eficiencia. Aquí les comparto el video completo de nuestra conferencia.',
      media: [
        {
          type: 'video',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
          title: 'Transformación Digital en Minería - Caso de Éxito',
          duration: '15:42'
        }
      ],
      externalLink: {
        url: 'https://drive.google.com/file/d/1234567890/view',
        title: 'Presentación Completa - Transformación Digital Minería 2024',
        description: 'Documento PDF con casos de estudio, métricas y estrategias implementadas.',
        thumbnail: 'https://drive-thirdparty.googleusercontent.com/16/type/application/pdf',
        domain: 'Google Drive'
      },
      timestamp: 'Hace 3 horas',
      likes: 127,
      comments: 23,
      shares: 18,
      bookmarks: 45,
      isLiked: false,
      isBookmarked: true,
      engagement: {
        views: 1847,
        clickThrough: 234
      },
      tags: ['#TransformaciónDigital', '#Minería', '#Innovación']
    },
    {
      id: '2',
      author: {
        name: 'Carlos Mendoza',
        title: 'CEO & Founder',
        company: 'Constructora Lima SAC',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=f59e0b&color=fff',
        verified: true,
        followers: 5234
      },
      content: '🏗️ Proyecto de construcción sostenible completado con éxito. Implementamos tecnologías verdes que no solo protegen el medio ambiente, sino que generan ahorros del 35% en costos energéticos. Miren estas imágenes del proceso y resultado final.',
      media: [
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop'
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop'
        },
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
          thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
        }
      ],
      timestamp: 'Hace 6 horas',
      likes: 89,
      comments: 15,
      shares: 12,
      bookmarks: 28,
      isLiked: true,
      isBookmarked: false,
      engagement: {
        views: 1234,
        clickThrough: 156
      },
      tags: ['#ConstrucciónSostenible', '#Arquitectura', '#Sostenibilidad']
    },
    {
      id: '3',
      author: {
        name: 'Ana Rodriguez',
        title: 'Tech Entrepreneur',
        company: 'StartupTech',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Rodriguez&background=8b5cf6&color=fff',
        verified: true,
        followers: 8756
      },
      content: '💡 ¿Sabían que el 78% de las PYMEs peruanas aún no han adoptado herramientas de IA? En mi último video analizo las barreras principales y comparto 5 estrategias prácticas para comenzar la transformación digital sin grandes inversiones.',
      media: [
        {
          type: 'video',
          url: 'https://www.youtube.com/embed/ScMzIvxBSi4',
          thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
          title: 'IA para PYMEs: 5 Estrategias Prácticas',
          duration: '12:35'
        }
      ],
      externalLink: {
        url: 'https://drive.google.com/drive/folders/1BxYz789',
        title: 'Recursos Gratuitos: Templates y Guías IA para PYMEs',
        description: 'Carpeta con plantillas, checklists y guías paso a paso para implementar IA en pequeñas empresas.',
        thumbnail: 'https://ssl.gstatic.com/docs/doclist/images/drive_2022q3_32dp.png',
        domain: 'Google Drive'
      },
      timestamp: 'Hace 1 día',
      likes: 156,
      comments: 34,
      shares: 67,
      bookmarks: 89,
      isLiked: false,
      isBookmarked: true,
      engagement: {
        views: 3421,
        clickThrough: 445
      },
      tags: ['#IA', '#PYMEs', '#Emprendimiento', '#Tecnología']
    }
  ]);

  const handleCreatePost = () => {
    if (!newPost.content.trim()) {
      toast.error('El contenido del post no puede estar vacío');
      return;
    }

    toast.success('Post publicado exitosamente');
    setShowCreatePost(false);
    setNewPost({
      content: '',
      links: [],
      currentLink: ''
    });
  };

  const handleAddLink = () => {
    if (newPost.currentLink.trim()) {
      setNewPost({
        ...newPost,
        links: [...newPost.links, newPost.currentLink.trim()],
        currentLink: ''
      });
    }
  };

  const handleLike = (postId: string) => {
    toast.success('Post marcado como favorito');
  };

  const handleBookmark = (postId: string) => {
    toast.success('Post guardado en favoritos');
  };

  const MediaCarousel = ({ media, postId }: { media: MediaItem[], postId: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextMedia = () => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    };

    const prevMedia = () => {
      setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
    };

    return (
      <div className="relative group">
        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
          {media[currentIndex].type === 'video' ? (
            <div className="relative w-full h-full">
              <iframe
                src={media[currentIndex].url}
                title={media[currentIndex].title}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm flex items-center space-x-1">
                <FiPlay className="w-3 h-3" />
                <span>{media[currentIndex].duration}</span>
              </div>
            </div>
          ) : (
            <img
              src={media[currentIndex].url}
              alt={`Media ${currentIndex + 1}`}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setSelectedMedia({ post: postId, index: currentIndex })}
            />
          )}
        </div>

        {media.length > 1 && (
          <>
            <button
              onClick={prevMedia}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMedia}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              {currentIndex + 1} / {media.length}
            </div>
          </>
        )}
      </div>
    );
  };

  const ExternalLinkPreview = ({ link }: { link: any }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex">
        <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
          <img
            src={link.thumbnail}
            alt={link.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                {link.title}
              </h4>
              <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                {link.description}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                {link.domain.includes('drive.google') && <FaGoogleDrive className="w-3 h-3" />}
                {link.domain.includes('youtube') && <FaYoutube className="w-3 h-3 text-red-500" />}
                <span>{link.domain}</span>
              </div>
            </div>
            <FiExternalLink className="w-4 h-4 text-gray-400 ml-2" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Feed Profesional</h3>
          <p className="text-gray-600">Descubre, comparte y conecta con contenido relevante</p>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <FiPlus className="w-5 h-5" />
          <span className="font-medium">Crear Post</span>
        </button>
      </div>

      {/* Enhanced Create Post Quick Access */}
      <div className="bg-white rounded-2xl shadow-sm border p-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Usuario')}&background=6366f1&color=fff`}
            alt={user?.displayName}
            className="w-12 h-12 rounded-full ring-2 ring-blue-100"
          />
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-2xl hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200"
          >
            ¿Qué insights quieres compartir hoy?
          </button>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex space-x-6">
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <FiImage className="w-5 h-5" />
              <span className="font-medium">Multimedia</span>
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 px-4 py-2 text-green-600 hover:bg-green-50 rounded-xl transition-colors"
            >
              <FiLink className="w-5 h-5" />
              <span className="font-medium">Enlace</span>
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
            >
              <FiFileText className="w-5 h-5" />
              <span className="font-medium">Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-all"
          >
            {/* Enhanced Post Header */}
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-14 h-14 rounded-full ring-2 ring-gray-100"
                    />
                    {post.author.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-gray-900">{post.author.name}</h4>
                      <span className="text-gray-400">•</span>
                      <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                        Seguir
                      </button>
                    </div>
                    <p className="text-gray-600 font-medium">{post.author.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{post.author.company}</span>
                      <span>•</span>
                      <span>{post.author.followers.toLocaleString()} seguidores</span>
                      <span>•</span>
                      <span>{post.timestamp}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <FiBookmark className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                    <FiMoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Post Content */}
            <div className="p-6">
              <div className="prose max-w-none mb-4">
                <p className="text-gray-900 leading-relaxed text-lg">{post.content}</p>
              </div>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full hover:bg-blue-100 cursor-pointer transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Media Carousel */}
              {post.media.length > 0 && (
                <div className="mb-4">
                  <MediaCarousel media={post.media} postId={post.id} />
                </div>
              )}

              {/* External Link Preview */}
              {post.externalLink && (
                <div className="mb-4">
                  <ExternalLinkPreview link={post.externalLink} />
                </div>
              )}

              {/* Engagement Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pt-4 border-t border-gray-50">
                <div className="flex items-center space-x-4">
                  <span>{post.engagement.views.toLocaleString()} visualizaciones</span>
                  <span>{post.engagement.clickThrough} clics</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span>{post.likes} reacciones</span>
                  <span>{post.comments} comentarios</span>
                  <span>{post.shares} compartidos</span>
                </div>
              </div>
            </div>

            {/* Enhanced Post Actions */}
            <div className="px-6 py-4 border-t border-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                      post.isLiked 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">Me gusta</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    <FiMessageCircle className="w-5 h-5" />
                    <span className="font-medium">Comentar</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                    <FiShare className="w-5 h-5" />
                    <span className="font-medium">Compartir</span>
                  </button>
                </div>

                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`p-2 rounded-xl transition-colors ${
                    post.isBookmarked
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiBookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Crear nueva publicación</h3>
                <button
                  onClick={() => setShowCreatePost(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Usuario')}&background=6366f1&color=fff`}
                  alt={user?.displayName}
                  className="w-14 h-14 rounded-full ring-2 ring-blue-100"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{user?.displayName}</h4>
                  <p className="text-gray-600">Consultor Senior de Negocios</p>
                </div>
              </div>

              <div className="space-y-6">
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="¿Qué insights profesionales quieres compartir hoy? Comparte tu experiencia, logros o reflexiones que puedan inspirar a tu red..."
                  rows={8}
                  className="w-full px-0 py-2 border-0 focus:ring-0 resize-none text-lg placeholder-gray-400"
                />

                {/* Link Input */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <FiLink className="w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={newPost.currentLink}
                      onChange={(e) => setNewPost({ ...newPost, currentLink: e.target.value })}
                      placeholder="Pega un enlace de YouTube, Google Drive, o cualquier URL..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleAddLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Agregar
                    </button>
                  </div>

                  {/* Added Links */}
                  {newPost.links.length > 0 && (
                    <div className="space-y-2">
                      {newPost.links.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FiLink className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700 truncate">{link}</span>
                          </div>
                          <button
                            onClick={() => setNewPost({
                              ...newPost,
                              links: newPost.links.filter((_, i) => i !== index)
                            })}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Enhanced Media Options */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <span className="font-medium text-gray-700">Agregar a tu publicación:</span>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-sm">
                      <FiImage className="w-4 h-4" />
                      <span className="text-sm font-medium">Imagen</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors shadow-sm">
                      <FaYoutube className="w-4 h-4" />
                      <span className="text-sm font-medium">YouTube</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-colors shadow-sm">
                      <FaGoogleDrive className="w-4 h-4" />
                      <span className="text-sm font-medium">Drive</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-8 pt-6 border-t">
                <div className="text-sm text-gray-500">
                  Tu publicación será visible para tu red profesional
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim()}
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    <FiSend className="w-4 h-4" />
                    <span className="font-medium">Publicar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Lightbox */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={posts.find(p => p.id === selectedMedia.post)?.media[selectedMedia.index]?.url}
                alt="Media preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EnhancedFeedSystem;