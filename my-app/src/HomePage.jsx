import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './App.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

function HomePage() {
  return (
    <div className="home-container">
      <motion.header 
        className="header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="header-content home-header">
          <div className="logo-container">
            <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            <h1 className="logo-text">CoverCraft</h1>
          </div>
          <nav>
            <a href="#features" className="nav-link">Features</a>
            <a href="#about" className="nav-link">About</a>
          </nav>
        </div>
      </motion.header>
      
      <motion.main 
        className="hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 className="hero-motto" variants={itemVariants}>
          Craft the Perfect Cover Letter, Instantly.
        </motion.h1>
        <motion.p className="hero-subtitle" variants={itemVariants}>
          Let AI be your career co-pilot. Turn your resume into a compelling story that lands you the interview.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link to="/generator" className="cta-button">
            Upload Resume & Get Started
          </Link>
        </motion.div>
      </motion.main>

      <motion.section 
        id="features" 
        className="features-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        <h2>Why Choose CoverCraft?</h2>
        <div className="features-grid">
          <motion.div className="feature-card" whileHover={{ y: -10 }}>
            <h3>AI-Powered Precision</h3>
            <p>Our smart AI analyzes your resume and the job description to highlight your most relevant skills.</p>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ y: -10 }}>
            <h3>Professional Templates</h3>
            <p>Choose from a variety of professionally designed templates to match your style and industry.</p>
          </motion.div>
          <motion.div className="feature-card" whileHover={{ y: -10 }}>
            <h3>Edit & Download</h3>
            <p>Fine-tune your letter with our built-in editor and download a print-ready PDF in seconds.</p>
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        id="about" 
        className="about-section"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.8 }}
      >
        <h2>About Us</h2>
        <p>CoverCraft was built to empower job seekers by removing the guesswork from writing compelling cover letters. We believe that everyone deserves a chance to make a great first impression.</p>
      </motion.section>
    </div>
  );
}

export default HomePage;