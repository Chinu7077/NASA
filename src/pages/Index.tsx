'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Starfield } from '@/components/Starfield';
import { FloatingPlanet } from '@/components/FloatingPlanet';
import { useAPOD, useMarsRoverPhotos, useNearEarthObjects } from '@/hooks/useNASAData';
import { useRef, useState } from 'react';
import { Rocket, Telescope, Globe, Zap, Users, Star, AlertTriangle, Building, Bot } from 'lucide-react';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [videoLoading, setVideoLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { data: apod, loading: apodLoading } = useAPOD(selectedDate);
  const { photos, loading: photosLoading } = useMarsRoverPhotos();
  const { objects, loading: objectsLoading } = useNearEarthObjects();

  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  // Date navigation functions
  const navigateToDate = (direction: 'prev' | 'next') => {
    if (!apod) return;
    
    const currentDate = new Date(apod.date);
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setDate(currentDate.getDate() - 1);
    } else {
      newDate.setDate(currentDate.getDate() + 1);
    }
    
    // Format date as YYYY-MM-DD
    const formattedDate = newDate.toISOString().split('T')[0];
    setSelectedDate(formattedDate);
  };

  const resetToToday = () => {
    setSelectedDate('');
  };

  // Download functions
  const downloadImage = async (url: string, filename: string) => {
    try {
      setDownloading(true);
      
      // Method 1: Try direct download first
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // If we get here, the download started
        console.log(`Download started: ${filename}`);
        return;
      } catch (directError) {
        console.log('Direct download failed, trying alternative method...');
      }
      
      // Method 2: Try opening in new tab for user to save manually
      try {
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
          console.log('Opened in new tab for manual download');
          // Show user instructions
          setTimeout(() => {
            alert('Image opened in new tab. Right-click and select "Save Image As..." to download.');
          }, 1000);
        } else {
          throw new Error('Popup blocked');
        }
      } catch (windowError) {
        console.log('Window open failed, trying fetch method...');
        
        // Method 3: Try fetch with CORS proxy (fallback)
        try {
          const response = await fetch(url, {
            mode: 'cors',
            headers: {
              'Accept': 'image/*,video/*'
            }
          });
          
          if (!response.ok) throw new Error('Failed to fetch image');
          
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(downloadUrl);
          
          console.log(`Successfully downloaded: ${filename}`);
        } catch (fetchError) {
          // Final fallback: show user the direct URL
          console.error('All download methods failed:', fetchError);
          alert(`Download failed due to browser restrictions.\n\nYou can manually download by:\n1. Right-clicking the image above\n2. Selecting "Save Image As..."\n3. Or copying this URL: ${url}`);
        }
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadHD = () => {
    if (apod) {
      if (apod.media_type === 'video') {
        // For videos, open in new tab for user to download manually
        window.open(apod.url, '_blank');
        alert('Video opened in new tab. Right-click and select "Save Video As..." to download.');
      } else {
        // For images, try to download directly
        const filename = `nasa-apod-${apod.date}-${apod.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
        downloadImage(apod.url, filename);
      }
    }
  };

  const downloadMobile = () => {
    if (apod) {
      if (apod.media_type === 'video') {
        // For videos, open in new tab
        window.open(apod.url, '_blank');
        alert('Video opened in new tab. Right-click and select "Save Video As..." to download.');
      } else {
        // For images, try to download with mobile filename
        const filename = `nasa-apod-mobile-${apod.date}-${apod.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.jpg`;
        downloadImage(apod.url, filename);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Starfield />
      
      {/* Floating Planets */}
      <FloatingPlanet size={100} color="#64B5F6" duration={15} delay={0} x={10} y={20} />
      <FloatingPlanet size={80} color="#BA68C8" duration={20} delay={2} x={85} y={15} />
      <FloatingPlanet size={60} color="#F48FB1" duration={18} delay={4} x={20} y={70} />
      <FloatingPlanet size={120} color="#4FC3F7" duration={25} delay={1} x={90} y={80} />

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center px-4 md:px-6"
        style={{ opacity, scale }}
      >
        <motion.div
          className="text-center z-10 max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-6 text-gradient-aurora leading-tight px-4"
            variants={itemVariants}
          >
            Explore The Universe
          </motion.h1>
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-6 md:mb-8 text-gradient-primary px-4"
            variants={itemVariants}
          >
            with NASA API
          </motion.h2>
          <motion.p
            className="text-lg sm:text-xl md:text-2xl mb-8 md:mb-12 text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4"
            variants={itemVariants}
          >
            Journey through space and time with real NASA data, breathtaking imagery, 
            and the latest discoveries from across the cosmos.
          </motion.p>
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8 px-4">
            <motion.div
              className="glass-card p-4 md:p-6 text-center hover:neon-glow-blue transition-all duration-300 touch-manipulation"
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Telescope className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-neon-blue" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gradient-primary">Daily Space Images</h3>
              <p className="text-muted-foreground text-xs md:text-sm">Discover stunning cosmic photography from NASA's archives</p>
            </motion.div>
            
            <motion.div
              className="glass-card p-4 md:p-6 text-center hover:neon-glow-purple transition-all duration-300 touch-manipulation"
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-neon-purple" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gradient-secondary">Mars Rover Photos</h3>
              <p className="text-muted-foreground text-xs md:text-sm">Explore the Red Planet through rover eyes</p>
            </motion.div>
            
            <motion.div
              className="glass-card p-4 md:p-6 text-center hover:neon-glow-pink transition-all duration-300 touch-manipulation"
              whileHover={{ y: -5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-neon-pink" />
              <h3 className="text-lg md:text-xl font-semibold mb-2 text-gradient-aurora">Space Weather</h3>
              <p className="text-muted-foreground text-xs md:text-sm">Track near-Earth objects and cosmic events</p>
            </motion.div>
          </motion.div>
        </motion.div>
        
        {/* Mobile Floating Action Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50 md:hidden"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <button
            onClick={() => document.getElementById('apod-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-14 h-14 bg-gradient-primary rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white"
            aria-label="Go to APOD section"
          >
            <Telescope className="w-6 h-6" />
          </button>
        </motion.div>
      </motion.section>

      {/* NASA APOD Section */}
      <section id="apod-section" className="py-16 md:py-24 px-4 md:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-gradient-primary">
              Astronomy Picture of the Day
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Discover the cosmos through NASA's daily featured image with enhanced details and interactive features
            </p>
          </motion.div>

          {apodLoading ? (
            <div className="glass-card p-12 max-w-4xl mx-auto animate-pulse">
              <div className="aspect-video bg-muted rounded-lg mb-6"></div>
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ) : apod ? (
            <motion.div
              className="glass-card p-4 md:p-6 lg:p-8 max-w-6xl mx-auto neon-glow-blue"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Main Image/Video Display */}
              <div className="relative mb-8">
              {apod.media_type === 'image' ? (
                <motion.img
                  src={apod.url}
                  alt={apod.title}
                    className="w-full aspect-video object-cover rounded-lg"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                  <div className="relative">
                    {/* Enhanced Video Player with Fallback */}
                    <motion.div
                      className="w-full aspect-video rounded-lg overflow-hidden"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                    >
                      {/* Try HTML5 video first */}
                      <video
                        key={apod.url} // Force re-render when URL changes
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                        poster={apod.thumbnail_url || undefined}
                        onLoadStart={() => setVideoLoading(true)}
                        onCanPlay={() => setVideoLoading(false)}
                        onError={(e) => {
                          setVideoLoading(false);
                          // If video fails, fall back to iframe
                          const videoElement = e.target as HTMLVideoElement;
                          const parent = videoElement.parentElement;
                          if (parent) {
                            const iframe = document.createElement('iframe');
                            iframe.src = apod.url;
                            iframe.title = apod.title;
                            iframe.className = 'w-full h-full';
                            iframe.frameBorder = '0';
                            iframe.allowFullScreen = true;
                            
                            // Replace video with iframe
                            parent.innerHTML = '';
                            parent.appendChild(iframe);
                          }
                        }}
                      >
                        <source src={apod.url} type="video/mp4" />
                        <source src={apod.url} type="video/webm" />
                        <source src={apod.url} type="video/ogg" />
                        Your browser does not support the video tag.
                      </video>
                    </motion.div>
                    
                    {/* Video Controls Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <div className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                        🎥 {apod.media_type === 'video' ? 'Video Player' : 'Media Player'}
                      </div>
                      <div className="bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
                        📺 Fullscreen Available
                      </div>
                    </div>
                    
                    {/* Video Loading Indicator */}
                    {videoLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                        <div className="bg-black/70 text-white px-6 py-3 rounded-lg flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neon-blue"></div>
                          <span>Loading video...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Media Type Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    apod.media_type === 'image' 
                      ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30' 
                      : 'bg-neon-purple/20 text-neon-purple border border-neon-purple/30'
                  }`}>
                    {apod.media_type === 'image' ? '📷 Image' : '🎥 Video'}
                  </span>
                </div>
              </div>

                            {/* Enhanced Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <div className="px-2 md:px-0">
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-gradient-secondary leading-tight">
                      {apod.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                      {apod.explanation}
                    </p>
                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-neon-blue">📅</span>
                        <div>
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="font-semibold">{apod.date}</p>
                        </div>
                      </div>
                      
                      {apod.copyright && (
                        <div className="flex items-center space-x-3">
                          <span className="text-neon-purple">👨‍🎨</span>
                          <div>
                            <p className="text-sm text-muted-foreground">Copyright</p>
                            <p className="font-semibold">{apod.copyright}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-neon-pink">🔍</span>
                        <div>
                          <p className="text-sm text-muted-foreground">Service Version</p>
                          <p className="font-semibold">v1</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className="text-neon-green">📊</span>
                        <div>
                          <p className="text-sm text-muted-foreground">HD Available</p>
                          <p className="font-semibold text-neon-green">Yes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar with Additional Info */}
                <div className="space-y-4 md:space-y-6 mt-6 lg:mt-0">
                  {/* Quick Facts */}
                  <div className="glass-card p-4 md:p-6 bg-white/5">
                    <h4 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gradient-primary">Quick Facts</h4>
                    <div className="space-y-2 md:space-y-3">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-muted-foreground">Media Type:</span>
                        <span className="font-semibold capitalize">{apod.media_type}</span>
                      </div>
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-muted-foreground">Format:</span>
                        <span className="font-semibold">HD</span>
                      </div>
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-muted-foreground">Source:</span>
                        <span className="font-semibold">NASA APOD</span>
                      </div>
                    </div>
                  </div>

                  {/* Related Topics */}
                  <div className="glass-card p-4 md:p-6 bg-white/5">
                    <h4 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gradient-secondary">Related Topics</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Astronomy', 'Space', 'Cosmos', 'NASA', 'Science'].map((topic, index) => (
                        <span
                          key={index}
                          className="px-2 md:px-3 py-1 bg-neon-blue/20 text-neon-blue rounded-full text-xs md:text-sm border border-neon-blue/30 hover:bg-neon-blue/30 active:bg-neon-blue/40 transition-colors cursor-pointer touch-manipulation"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Download Options */}
                  <div className="glass-card p-4 md:p-6 bg-white/5">
                    <h4 className="text-lg md:text-xl font-semibold mb-3 md:mb-4 text-gradient-aurora">Download Options</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={downloadHD}
                        disabled={!apod || apodLoading || downloading}
                        className="w-full px-4 py-2 bg-neon-blue/20 text-neon-blue rounded-lg border border-neon-blue/30 hover:bg-neon-blue/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {downloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-blue"></div>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <span>📥</span>
                            <span>Download HD</span>
                          </>
                        )}
                      </button>
                      <button 
                        onClick={downloadMobile}
                        disabled={!apod || apodLoading || downloading}
                        className="w-full px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-lg border border-neon-purple/30 hover:bg-neon-purple/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {downloading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neon-purple"></div>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <span>📱</span>
                            <span>Mobile Version</span>
                          </>
                        )}
                      </button>
                    </div>
                    {apod && (
                      <div className="mt-3 text-xs text-muted-foreground text-center">
                        Downloads {apod.media_type === 'image' ? 'image' : 'video'} in original quality
                      </div>
                    )}
                    

                  </div>
                </div>
              </div>

              {/* Current Date Display */}
              {selectedDate && (
                <div className="text-center mb-4 px-4">
                  <div className="inline-flex items-center space-x-2 px-3 md:px-4 py-2 bg-white/10 rounded-lg text-sm md:text-base">
                    <span className="text-neon-blue">📅</span>
                    <span className="text-muted-foreground">
                      Currently viewing: <span className="text-white font-semibold">{selectedDate}</span>
                    </span>
                  </div>
                </div>
              )}
              
              {/* Navigation Controls */}
              <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-white/10 px-4">
                <button 
                  onClick={() => navigateToDate('prev')}
                  disabled={apodLoading}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-neon-blue/20 text-neon-blue rounded-lg border border-neon-blue/30 hover:bg-neon-blue/30 active:bg-neon-blue/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base touch-manipulation"
                >
                  ← Previous Day
                </button>
                
                {/* Go to Today Button - Only show when viewing a different date */}
                {selectedDate && (
                  <button 
                    onClick={resetToToday}
                    className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:bg-gradient-primary/90 active:bg-gradient-primary/80 transition-all duration-300 transform hover:scale-105 touch-manipulation text-sm md:text-base"
                  >
                    🚀 Go to Today
                  </button>
                )}
                
                <button 
                  onClick={() => navigateToDate('next')}
                  disabled={apodLoading || (apod && apod.date === new Date().toISOString().split('T')[0])}
                  className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-3 bg-neon-purple/20 text-neon-purple rounded-lg border border-neon-purple/30 hover:bg-neon-purple/30 active:bg-neon-purple/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base touch-manipulation"
                >
                  Next Day →
                </button>
              </div>
            </motion.div>
          ) : null}
        </div>
      </section>

      {/* Mars Rover Photos Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-secondary">
              Mars Rover Gallery
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Journey to the Red Planet through the eyes of NASA's rovers
            </p>
          </motion.div>

          {photosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4"></div>
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {photos.slice(0, 8).map((photo, index) => (
                <motion.div
                  key={photo.id}
                  className="glass-card p-6 group hover:neon-glow-purple transition-all duration-500"
                  variants={itemVariants}
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <motion.img
                    src={photo.img_src}
                    alt={`Mars photo from ${photo.camera.name}`}
                    className="w-full aspect-square object-cover rounded-lg mb-4 group-hover:brightness-110 transition-all duration-300"
                    loading="lazy"
                  />
                  <h3 className="font-semibold mb-2 text-gradient-primary">
                    {photo.camera.full_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Date: {photo.earth_date}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rover: {photo.rover.name}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Near Earth Objects Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-aurora">
              Space Weather Today
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track near-Earth objects and cosmic visitors in real-time
            </p>
          </motion.div>

          {objectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-6 bg-muted rounded w-2/3"></div>
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {objects.map((obj, index) => (
                <motion.div
                  key={obj.name}
                  className={`glass-card p-6 ${
                    obj.is_potentially_hazardous_asteroid ? 'neon-glow-pink' : 'neon-glow-blue'
                  } transition-all duration-500`}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-gradient-primary flex-1">
                      {obj.name}
                    </h3>
                    {obj.is_potentially_hazardous_asteroid && (
                      <AlertTriangle className="text-neon-pink ml-2 animate-pulse" size={24} />
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Diameter:</span>
                      <span className="text-foreground">
                        {obj.estimated_diameter.kilometers.estimated_diameter_min.toFixed(2)} - 
                        {obj.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km
                      </span>
                    </div>
                    
                    {obj.close_approach_data[0] && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Approach Date:</span>
                          <span className="text-foreground">
                            {obj.close_approach_data[0].close_approach_date}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Miss Distance:</span>
                          <span className="text-foreground">
                            {Number(obj.close_approach_data[0].miss_distance.kilometers).toLocaleString()} km
                          </span>
                        </div>
                      </>
                    )}
                    
                    <div className="pt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        obj.is_potentially_hazardous_asteroid 
                          ? 'bg-neon-pink/20 text-neon-pink' 
                          : 'bg-neon-blue/20 text-neon-blue'
                      }`}>
                        {obj.is_potentially_hazardous_asteroid ? 'Potentially Hazardous' : 'Safe Passage'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Space Facts & Statistics Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-primary">
              Cosmic Statistics & Facts
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Fascinating numbers and facts about our universe
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div
              className="glass-card p-6 text-center hover:neon-glow-blue transition-all duration-300"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <div className="text-4xl font-bold text-gradient-primary mb-2">13.8B</div>
              <p className="text-muted-foreground">Years Old</p>
              <p className="text-sm text-muted-foreground mt-2">Age of the Universe</p>
            </motion.div>

            <motion.div
              className="glass-card p-6 text-center hover:neon-glow-purple transition-all duration-300"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <div className="text-4xl font-bold text-gradient-secondary mb-2">2T+</div>
              <p className="text-muted-foreground">Galaxies</p>
              <p className="text-sm text-muted-foreground mt-2">Estimated in Observable Universe</p>
            </motion.div>

            <motion.div
              className="glass-card p-6 text-center hover:neon-glow-pink transition-all duration-300"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <div className="text-4xl font-bold text-gradient-aurora mb-2">150M</div>
              <p className="text-muted-foreground">Light Years</p>
              <p className="text-sm text-muted-foreground mt-2">Distance to Andromeda Galaxy</p>
            </motion.div>

            <motion.div
              className="glass-card p-6 text-center hover:neon-glow-green transition-all duration-300"
              variants={itemVariants}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <div className="text-4xl font-bold text-gradient-primary mb-2">8.3</div>
              <p className="text-muted-foreground">Light Minutes</p>
              <p className="text-sm text-muted-foreground mt-2">Distance to the Sun</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Space Quiz Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gradient-secondary">
              Test Your Space Knowledge
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Challenge yourself with cosmic trivia and facts
            </p>
          </motion.div>

          <motion.div
            className="glass-card p-8 neon-glow-purple"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-4 text-gradient-primary">Quick Space Facts</h3>
                <p className="text-muted-foreground">Hover over each fact to reveal more details</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-semibold text-neon-blue mb-2">Black Holes</h4>
                  <p className="text-sm text-muted-foreground">The largest known black hole is TON 618, with a mass of 66 billion solar masses</p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-semibold text-neon-purple mb-2">Exoplanets</h4>
                  <p className="text-sm text-muted-foreground">Over 5,000 exoplanets have been discovered, with thousands more candidates</p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-semibold text-neon-pink mb-2">Dark Matter</h4>
                  <p className="text-sm text-muted-foreground">Dark matter makes up about 27% of the universe's mass-energy content</p>
                </motion.div>

                <motion.div
                  className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                >
                  <h4 className="font-semibold text-neon-green mb-2">Space Debris</h4>
                  <p className="text-sm text-muted-foreground">There are over 500,000 pieces of space debris larger than 1cm orbiting Earth</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Space Exploration Timeline Section */}
      <section className="py-16 md:py-24 px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-12 md:mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-gradient-aurora">
              Space Exploration Timeline
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
              Key milestones in humanity's journey to the stars
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-neon-blue via-neon-purple to-neon-pink"></div>
            
            <div className="space-y-8 md:space-y-12">
              {[
                { 
                  year: "1957", 
                  title: "Sputnik 1", 
                  description: "First artificial satellite launched by the Soviet Union", 
                  icon: "Satellite",
                  image: "/images/timeline/sputnik.jpg"
                },
                { 
                  year: "1961", 
                  title: "Yuri Gagarin", 
                  description: "First human in space aboard Vostok 1", 
                  icon: "User",
                  image: "/images/timeline/gagarin.jpg"
                },
                { 
                  year: "1969", 
                  title: "Apollo 11", 
                  description: "First humans walk on the Moon", 
                  icon: "Moon",
                  image: "/images/timeline/apollo11.jpg"
                },
                { 
                  year: "1977", 
                  title: "Voyager Probes", 
                  description: "Launched to explore the outer solar system", 
                  icon: "Rocket",
                  image: "/images/timeline/voyager.jpg"
                },
                { 
                  year: "1990", 
                  title: "Hubble Telescope", 
                  description: "Space telescope launched into low Earth orbit", 
                  icon: "Telescope",
                  image: "/images/timeline/hubble.jpg"
                },
                { 
                  year: "2000", 
                  title: "ISS Assembly", 
                  description: "International Space Station becomes operational", 
                  icon: "Building",
                  image: "/images/timeline/iss.jpg"
                },
                { 
                  year: "2012", 
                  title: "Curiosity Rover", 
                  description: "Lands on Mars to search for signs of life", 
                  icon: "Bot",
                  image: "/images/timeline/curiosity.jpg"
                },
                { 
                  year: "2022", 
                  title: "James Webb", 
                  description: "Most powerful space telescope ever launched", 
                  icon: "Star",
                  image: "/images/timeline/jameswebb.jpg"
                }
              ].map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gradient-primary rounded-full border-4 border-background z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-5/12 ${index % 2 === 0 ? 'pr-4 md:pr-8 text-right' : 'pl-4 md:pl-8 text-left'}`}>
                    <motion.div
                      className="relative overflow-hidden rounded-lg hover:neon-glow-blue transition-all duration-300 touch-manipulation"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {/* Background Image */}
                      <img
                        src={milestone.image}
                        alt={milestone.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to a gradient background if image fails
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                          }
                        }}
                      />
                      
                      {/* Dark Overlay for Text Readability */}
                      <div className="absolute inset-0 bg-black/60" />
                      
                      {/* Content */}
                      <div className="relative z-10 p-4 md:p-6 text-white">
                        <div className="flex items-center justify-center mb-2 md:mb-3">
                          {milestone.icon === 'Satellite' && <Rocket className="w-6 h-6 md:w-8 md:h-8 text-neon-blue" />}
                          {milestone.icon === 'User' && <Users className="w-6 h-6 md:w-8 md:h-8 text-neon-purple" />}
                          {milestone.icon === 'Moon' && <Globe className="w-6 h-6 md:w-8 md:h-8 text-neon-pink" />}
                          {milestone.icon === 'Rocket' && <Rocket className="w-6 h-6 md:w-8 md:h-8 text-neon-green" />}
                          {milestone.icon === 'Telescope' && <Telescope className="w-6 h-6 md:w-8 md:h-8 text-neon-blue" />}
                          {milestone.icon === 'Building' && <Building className="w-6 h-6 md:w-8 md:h-8 text-neon-purple" />}
                          {milestone.icon === 'Bot' && <Bot className="w-6 h-6 md:w-8 md:h-8 text-neon-blue" />}
                          {milestone.icon === 'Star' && <Star className="w-6 h-6 md:w-8 md:h-8 text-neon-blue" />}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-white mb-2 text-center">{milestone.title}</h3>
                        <p className="text-white/90 text-center text-xs md:text-sm mb-2 md:mb-3">{milestone.description}</p>
                        <div className="text-xl md:text-2xl font-bold text-neon-blue text-center">{milestone.year}</div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 relative z-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* Floating Orbs */}
            <div className="flex justify-center space-x-12 mb-12">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full bg-gradient-primary animate-pulse-glow"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-center space-x-8 text-sm">
                <motion.a
                  href="#"
                  className="text-muted-foreground hover:text-neon-blue transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  About NASA
                </motion.a>
                <motion.a
                  href="#"
                  className="text-muted-foreground hover:text-neon-purple transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  API Documentation
                </motion.a>
                <motion.a
                  href="#"
                  className="text-muted-foreground hover:text-neon-pink transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                >
                  Space News
                </motion.a>
              </div>
              
              <motion.p
                className="text-gradient-aurora font-semibold text-lg"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
              >
                Created by Chinu 🚀
              </motion.p>
              
              <p className="text-muted-foreground text-sm">
                Powered by NASA Open Data Portal
              </p>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Index;