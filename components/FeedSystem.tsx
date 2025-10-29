import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiImage, FiFileText, FiHeart, FiMessageCircle, FiShare, FiMoreHorizontal, FiSend, FiX } from 'react-icons/fi';
import { useMockAuth, useMockData } from '../hooks/useMockData';
import toast from 'react-hot-toast';

interface Post {
  id: string;
  author: {
    name: string;
    title: string;
    company: string;
    avatar: string;
  };
  content: string;
  type: 'text' | 'image' | 'document';
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  image?: string;
  document?: {
    name: string;
    type: string;
  };
}

const FeedSystem = () => {
  const { user } = useMockAuth();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'text' as 'text' | 'image' | 'document',
    image: null as File | null
  });

  const [posts] = useState<Post[]>([
    {
      id: '1',
      author: {
        name: 'María González',
        title: 'Directora de Operaciones',
        company: 'Consulting Pro EIRL',
        avatar: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=10b981&color=fff'
      },
      content: '🎉 Excelentes noticias! Hemos cerrado un nuevo acuerdo estratégico con una empresa del sector minero. Este partnership nos permitirá expandir nuestros servicios de consultoría a nivel nacional. Agradecido por el equipo increíble que hace esto posible. #Crecimiento #Consultoría #Minería',
      type: 'text',
      timestamp: 'Hace 2 horas',
      likes: 24,
      comments: 8,
      shares: 3,
      isLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Carlos Mendoza',
        title: 'CEO',
        company: 'Constructora Lima SAC',
        avatar: 'https://ui-avatars.com/api/?name=Carlos+Mendoza&background=f59e0b&color=fff'
      },
      content: 'Compartiendo algunos insights del último proyecto de construcción sostenible que completamos. La implementación de tecnologías verdes no solo reduce el impacto ambiental, sino que también genera ahorros significativos a largo plazo.',
      type: 'image',
      timestamp: 'Hace 4 horas',
      likes: 31,
      comments: 12,
      shares: 7,
      isLiked: true,
      image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&h=300&fit=crop'
    },
    {
      id: '3',
      author: {
        name: 'Ana Rodriguez',
        title: 'Fundadora',
        company: 'StartupTech',
        avatar: 'https://ui-avatars.com/api/?name=Ana+Rodriguez&background=8b5cf6&color=fff'
      },
      content: '📊 Nuevo whitepaper disponible: "Transformación Digital en PYMEs Peruanas". Analizamos 50+ casos de éxito y compartimos las mejores prácticas para la digitalización efectiva. ¡Descarga gratuita en nuestro sitio web!',
      type: 'document',
      timestamp: 'Hace 1 día',
      likes: 18,
      comments: 5,
      shares: 15,
      isLiked: false,
      document: {
        name: 'Transformacion-Digital-PYMEs-2024.pdf',
        type: 'PDF'
      }
    },
    {
      id: '4',
      author: {
        name: user?.displayName || 'Usuario Demo',
        title: 'Consultor Senior de Negocios',
        company: user?.empresa?.nombre || 'Empresa Demo',
        avatar: user?.photoURL || 'https://ui-avatars.com/api/?name=Usuario+Demo&background=6366f1&color=fff'
      },
      content: 'Reflexionando sobre las tendencias del mercado en 2024. La inteligencia artificial y la automatización están transformando la manera en que trabajamos. ¿Cómo están adaptando sus organizaciones a estos cambios? Me encantaría conocer sus experiencias.',
      type: 'text',
      timestamp: 'Hace 3 días',
      likes: 12,
      comments: 6,
      shares: 2,
      isLiked: false
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
      type: 'text',
      image: null
    });
  };

  const handleLike = (postId: string) => {
    toast.success('Post marcado como favorito');
  };

  const handleComment = (postId: string) => {
    toast.info('Función de comentarios próximamente');
  };

  const handleShare = (postId: string) => {
    toast.success('Post compartido');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Feed Profesional</h3>
          <p className="text-sm text-gray-600">Comparte actualizaciones y conecta con la comunidad</p>
        </div>
        <button
          onClick={() => setShowCreatePost(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Crear Post</span>
        </button>
      </div>

      {/* Create Post Quick Access */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex items-center space-x-3">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Usuario')}&background=6366f1&color=fff`}
            alt={user?.displayName}
            className="w-10 h-10 rounded-full"
          />
          <button
            onClick={() => setShowCreatePost(true)}
            className="flex-1 text-left px-4 py-2 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
          >
            ¿Qué quieres compartir hoy?
          </button>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex space-x-4">
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiImage className="w-4 h-4" />
              <span className="text-sm">Foto</span>
            </button>
            <button
              onClick={() => setShowCreatePost(true)}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiFileText className="w-4 h-4" />
              <span className="text-sm">Documento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border"
          >
            {/* Post Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                    <p className="text-sm text-gray-600">{post.author.title}</p>
                    <p className="text-xs text-gray-500">{post.author.company} • {post.timestamp}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                  <FiMoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
              <p className="text-gray-900 leading-relaxed">{post.content}</p>
              
              {/* Post Media */}
              {post.type === 'image' && post.image && (
                <div className="mt-3">
                  <img
                    src={post.image}
                    alt="Post content"
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                </div>
              )}

              {post.type === 'document' && post.document && (
                <div className="mt-3 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <FiFileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{post.document.name}</p>
                      <p className="text-sm text-gray-500">{post.document.type}</p>
                    </div>
                    <button className="ml-auto px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                      Descargar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="px-4 py-3 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      post.isLiked 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <FiHeart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => handleComment(post.id)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiShare className="w-4 h-4" />
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Crear nueva publicación</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <img
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'Usuario')}&background=6366f1&color=fff`}
                alt={user?.displayName}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h4 className="font-semibold text-gray-900">{user?.displayName}</h4>
                <p className="text-sm text-gray-600">Consultor Senior de Negocios</p>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="¿Qué quieres compartir con tu red profesional?"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />

              {/* Post Type Selector */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Agregar a tu publicación:</span>
                <button
                  onClick={() => setNewPost({ ...newPost, type: 'image' })}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    newPost.type === 'image' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FiImage className="w-4 h-4" />
                  <span className="text-sm">Imagen</span>
                </button>
                <button
                  onClick={() => setNewPost({ ...newPost, type: 'document' })}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    newPost.type === 'document' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FiFileText className="w-4 h-4" />
                  <span className="text-sm">Documento</span>
                </button>
              </div>

              {/* File Upload Area */}
              {(newPost.type === 'image' || newPost.type === 'document') && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {newPost.type === 'image' ? (
                        <FiImage className="w-6 h-6 text-gray-400" />
                      ) : (
                        <FiFileText className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Arrastra y suelta tu {newPost.type === 'image' ? 'imagen' : 'documento'} aquí
                      </p>
                      <p className="text-xs text-gray-500">
                        o <button className="text-blue-600 hover:text-blue-700">selecciona un archivo</button>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.content.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend className="w-4 h-4" />
                <span>Publicar</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default FeedSystem;