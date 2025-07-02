import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Shield, Search, ArrowRight, Zap, LayoutTemplate, Code, GitBranch, Lock, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
      title: "Rich Document Editor",
      description: "Create beautiful documents with our WYSIWYG editor. Support for formatting, images, and collaborative editing.",
      bgColor: "bg-indigo-100"
    },
    {
      icon: <Users className="h-6 w-6 text-green-600" />,
      title: "Team Collaboration",
      description: "Mention team members, share documents, and collaborate in real-time. Track changes and maintain version history.",
      bgColor: "bg-green-100"
    },
    {
      icon: <Search className="h-6 w-6 text-purple-600" />,
      title: "Powerful Search",
      description: "Find information quickly with our global search. Search across titles, content, and tags to locate exactly what you need.",
      bgColor: "bg-purple-100"
    },
    {
      icon: <Shield className="h-6 w-6 text-red-600" />,
      title: "Privacy Controls",
      description: "Control who can access your documents. Set public or private visibility and manage sharing permissions with granular control.",
      bgColor: "bg-red-100"
    },
    {
      icon: <GitBranch className="h-6 w-6 text-yellow-600" />,
      title: "Version Control",
      description: "Track all changes with automatic versioning. View history, compare versions, and restore previous iterations when needed.",
      bgColor: "bg-yellow-100"
    },
    {
      icon: <LayoutTemplate className="h-6 w-6 text-blue-600" />,
      title: "Templates Library",
      description: "Jumpstart your documentation with our collection of professional templates for various use cases.",
      bgColor: "bg-blue-100"
    }
  ];

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const gradientText = "text-transparent bg-clip-text bg-gradient-to-r";
  const primaryGradient = `${gradientText} from-indigo-500 to-purple-600`;
  const secondaryGradient = `${gradientText} from-blue-500 to-cyan-400`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center cursor-pointer"
            >
              <BookOpen className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Frigga KB</span>
            </motion.div>
            <div className="flex items-center space-x-4">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center"
        >
          <motion.h1 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Your Team's <br />
            <span className={primaryGradient}>Knowledge Hub</span>
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Create, collaborate, and organize your team's knowledge with our powerful 
            Confluence-like platform. Build a comprehensive knowledge base that grows with your organization.
          </motion.p>
          
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/register"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                Start Building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/login"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Everything you need to build <span className={secondaryGradient}>your knowledge base</span>
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Powerful features designed for modern teams to create, share, and manage knowledge effectively
          </motion.p>
        </motion.div>

        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-200 transition-all duration-300"
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to build your knowledge base?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-3xl mx-auto">
              Join thousands of teams who trust Frigga KB for their documentation needs.
            </p>
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <Link
                to="/register"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div>
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="flex items-center mb-4 cursor-pointer"
              >
                <BookOpen className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-xl font-bold">Frigga KB</span>
              </motion.div>
              <p className="text-gray-400 text-sm">
                The modern knowledge base platform for teams that want to document, share, and grow together.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                <motion.li whileHover={{ x: 5 }}>
                  <Link to="/features" className="text-gray-400 hover:text-white transition-colors duration-200">Features</Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }}>
                  <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">Contact</Link>
                </motion.li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <motion.li whileHover={{ x: 5 }}>
                  <Link to="/about" className="text-gray-400 hover:text-white transition-colors duration-200">About Us</Link>
                </motion.li>
                <motion.li whileHover={{ x: 5 }}>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</Link>
                </motion.li>
              </ul>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-12 pt-8 border-t border-gray-800"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2024 Frigga Knowledge Base. All rights reserved.
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;