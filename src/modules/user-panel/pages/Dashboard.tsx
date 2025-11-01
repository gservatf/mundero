import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAgreement } from "../hooks/useAgreement";
import AgreementModal from "../components/AgreementModal";
import { UserPanelLayout } from "../layout/UserPanelLayout";
import { Profile } from "./Profile";
import { Companies } from "./Companies";
import { Referrals } from "./Referrals";
import { Applications } from "./Applications";
import { LeadCenter } from "./LeadCenter";
import Messages from "./Messages";
import { Settings } from "./Settings";
import {
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiPlus,
  FiMessageSquare,
  FiHeart,
  FiShare,
  FiMoreHorizontal,
} from "react-icons/fi";
import { FaBuilding } from "react-icons/fa";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { requiresAgreement } = useAgreement();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newPost, setNewPost] = useState("");

  // Control de acceso - bloquear si requiere acuerdo
  if (requiresAgreement) {
    return <AgreementModal isOpen={true} onClose={() => {}} />;
  }

  // Mock data - replace with real data from Firebase
  const stats = {
    companies: 3,
    referrals: 12,
    commissions: 2450,
    leads: 8,
  };

  const recentPosts = [
    {
      id: 1,
      author: user?.display_name || "Usuario",
      avatar: user?.photo_url || "/default-avatar.png",
      content:
        "¡Excelente reunión con el equipo de LEGALTY! Nuevas oportunidades en el horizonte 🚀",
      timestamp: "2h",
      likes: 15,
      comments: 3,
      shares: 2,
    },
  ];

  const handleCreatePost = () => {
    if (newPost.trim()) {
      // TODO: Implement post creation with Firebase
      console.log("Creating post:", newPost);
      setNewPost("");
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile />;
      case "companies":
        return <Companies />;
      case "referrals":
        return <Referrals />;
      case "applications":
        return <Applications />;
      case "leads":
        return <LeadCenter />;
      case "messages":
        return <Messages />;
      case "settings":
        return <Settings />;
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-3xl font-bold mb-2">
                  ¡Bienvenido, {user?.display_name?.split(" ")[0]}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Tu centro de control profesional en el ecosistema Grupo Servat
                </p>
              </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Mis Empresas</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.companies}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FaBuilding className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Referidos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.referrals}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiUsers className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Comisiones</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.commissions}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Leads Activos</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.leads}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiTrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Professional Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start space-x-4">
                    <img
                      src={user?.photo_url || "/default-avatar.png"}
                      alt={user?.display_name || "Usuario"}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <textarea
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        placeholder="¿Qué está pasando en tu carrera profesional?"
                        className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        maxLength={2000}
                      />
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-4 text-gray-500">
                          <button className="hover:text-blue-600 transition-colors">
                            📎 Drive
                          </button>
                          <button className="hover:text-red-600 transition-colors">
                            🎥 YouTube
                          </button>
                        </div>
                        <button
                          onClick={handleCreatePost}
                          disabled={!newPost.trim()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-full font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Publicar
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Posts Feed */}
                {recentPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1, duration: 0.6 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={post.avatar}
                        alt={post.author}
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {post.author}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {post.timestamp}
                            </p>
                          </div>
                          <button className="text-gray-400 hover:text-gray-600">
                            <FiMoreHorizontal className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="mt-3 text-gray-800">{post.content}</p>

                        {/* Post Actions */}
                        <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-100">
                          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <FiHeart className="w-5 h-5" />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <FiMessageSquare className="w-5 h-5" />
                            <span>{post.comments}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 transition-colors">
                            <FiShare className="w-5 h-5" />
                            <span>{post.shares}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Acciones Rápidas
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab("companies")}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FiPlus className="w-5 h-5 text-blue-600" />
                      <span>Crear Empresa</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("referrals")}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FiUsers className="w-5 h-5 text-green-600" />
                      <span>Nuevo Referido</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("leads")}
                      className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FiTrendingUp className="w-5 h-5 text-purple-600" />
                      <span>Agregar Lead</span>
                    </button>
                  </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Actividad Reciente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">
                        Nuevo referido aprobado
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">Empresa validada</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">
                        Comisión pendiente
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <UserPanelLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </UserPanelLayout>
  );
};

export default Dashboard;
