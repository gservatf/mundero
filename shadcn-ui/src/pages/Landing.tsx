import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  AppWindow, 
  ShieldCheck, 
  ArrowRight, 
  Globe, 
  Sparkles,
  Network,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  const features = [
    {
      icon: Users,
      title: "Conecta con Profesionales",
      description: "Amplía tu red con personas que comparten tus intereses y ambiciones.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: AppWindow,
      title: "Accede a Herramientas Digitales",
      description: "Explora un ecosistema de aplicaciones y recursos para tu desarrollo profesional.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: ShieldCheck,
      title: "Avanza Seguro",
      description: "Protege tus datos con autenticación Google y controles de privacidad avanzados.",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Network className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MUNDERO
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" className="text-slate-300 hover:text-white transition-colors duration-300">Inicio</a>
              <a href="#descubre" className="text-slate-300 hover:text-white transition-colors duration-300">Descubre</a>
              <a href="#conecta" className="text-slate-300 hover:text-white transition-colors duration-300">Conecta</a>
              <a href="#soporte" className="text-slate-300 hover:text-white transition-colors duration-300">Soporte</a>
            </div>

            <Link to="/login">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25 border border-blue-400/20">
                <Sparkles className="w-4 h-4 mr-2" />
                Acceder
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-6">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-4 py-2">
                  <Globe className="w-4 h-4 mr-2" />
                  Red Profesional Global
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                    MUNDERO
                  </span>
                </h1>
                
                <h2 className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed">
                  Tu red profesional para crecer, conectar y acceder al futuro.
                </h2>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-6">
                <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
                  Descubre oportunidades, comparte tu perfil y accede a aplicaciones que impulsan tu desarrollo profesional.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/register">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl shadow-blue-500/25 text-lg px-8 py-4 group"
                    >
                      Únete Gratis
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4"
                  >
                    Explorar Perfiles
                  </Button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center space-x-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-slate-900 flex items-center justify-center text-white font-semibold text-sm">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-400">
                  <span className="text-white font-semibold">+10,000</span> profesionales conectados
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  y: [-10, 10, -10]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="relative z-10"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
                  <img 
                    src="/mundero.png" 
                    alt="MUNDERO Professional Network" 
                    className="relative z-10 w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
                  />
                </div>
              </motion.div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ 
                  y: [-20, 20, -20], 
                  rotate: [0, 5, 0] 
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="absolute top-10 -left-10 w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25"
              >
                <TrendingUp className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.div 
                animate={{ 
                  y: [20, -20, 20], 
                  rotate: [0, -5, 0] 
                }}
                transition={{ 
                  duration: 10, 
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                className="absolute bottom-10 -right-10 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Conecta. Crece. Triunfa.
              </span>
            </h3>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              MUNDERO te ofrece las herramientas y conexiones que necesitas para llevar tu carrera al siguiente nivel.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group"
              >
                <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/70 transition-all duration-300 h-full">
                  <CardContent className="p-8 text-center space-y-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h4 className="text-xl font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {feature.title}
                    </h4>
                    
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 relative">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-3xl p-12 border border-slate-600/30">
              <h3 className="text-3xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  "El futuro del trabajo comienza con conexiones reales."
                </span>
              </h3>
              
              <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
                Únete a la comunidad de profesionales que están construyendo el futuro del trabajo colaborativo.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl shadow-blue-500/25 text-lg px-8 py-4"
                  >
                    Comenzar Ahora
                  </Button>
                </Link>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-slate-500 text-slate-300 hover:bg-slate-700 hover:text-white px-8 py-4"
                >
                  Explorar Perfiles
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Network className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                MUNDERO
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Soporte</a>
              <a href="#" className="hover:text-white transition-colors">Idioma</a>
            </div>
            
            <p className="text-sm text-slate-500 text-center md:text-right">
              © 2025 MUNDERO — La red donde tu talento se conecta con el mundo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;