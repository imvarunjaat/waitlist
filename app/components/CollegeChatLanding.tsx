"use client";

import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { Users, MessageCircle, BookOpen, Coffee, Heart, Star, X, Mail, Send, CheckCircle, ArrowLeft } from 'lucide-react';
import EmailPopupSuccess from "./EmailPopupSuccess";
import dynamic from 'next/dynamic';

// Dynamically import the DecryptedText component to prevent SSR issues
const DecryptedText = dynamic(
  () => import('./TextAnimations/DecryptedText/DecryptedText'),
  { ssr: false }
);

// 3D Background Component
const FloatingOrbs = () => {
  const groupRef = useRef<THREE.Group>(null);
  const orbsRef = useRef<THREE.Mesh[]>([]);

  useEffect(() => {
    if (!groupRef.current) return;

    // Create floating orbs - reduced count for better performance
    const orbCount = 12;
    const orbs: THREE.Mesh[] = [];

    for (let i = 0; i < orbCount; i++) {
      const geometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 12, 12);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(
          0.5 + Math.random() * 0.3, // Soft blues and purples
          0.6,
          0.7
        ),
        transparent: true,
        opacity: 0.3 + Math.random() * 0.4
      });

      const orb = new THREE.Mesh(geometry, material);
      orb.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15
      );

      orb.userData = {
        originalY: orb.position.y,
        speed: 0.3 + Math.random() * 0.7,
        amplitude: 0.8 + Math.random() * 1.5
      };

      groupRef.current.add(orb);
      orbs.push(orb);
    }

    orbsRef.current = orbs;

    return () => {
      orbs.forEach(orb => {
        orb.geometry.dispose();
        (orb.material as THREE.Material).dispose();
      });
    };
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    orbsRef.current.forEach((orb, i) => {
      const { originalY, speed, amplitude } = orb.userData;
      orb.position.y = originalY + Math.sin(time * speed + i) * amplitude;
      orb.rotation.x = time * 0.2;
      orb.rotation.y = time * 0.15;
    });

    groupRef.current.rotation.y = time * 0.08;
  });

  return <group ref={groupRef} />;
};

// Animated Background Gradient
const AnimatedGradient = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [shaderMaterial, setShaderMaterial] = useState<THREE.ShaderMaterial | null>(null);

  useEffect(() => {
    // Create shader material inside useEffect to avoid window is not defined error
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(1920, 1080) } // Default resolution
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        varying vec2 vUv;
        
        void main() {
          vec2 uv = vUv;
          
          // Create flowing gradient with reduced complexity
          float wave1 = sin(uv.x * 2.0 + time * 0.3) * 0.5 + 0.5;
          float wave2 = sin(uv.y * 1.5 + time * 0.2) * 0.5 + 0.5;
          
          // Soft pastel colors for college theme
          vec3 color1 = vec3(0.8, 0.9, 1.0); // Light blue
          vec3 color2 = vec3(0.9, 0.8, 1.0); // Light purple
          vec3 color3 = vec3(0.8, 1.0, 0.9); // Light green
          
          vec3 finalColor = mix(color1, color2, wave1);
          finalColor = mix(finalColor, color3, wave2 * 0.5);
          
          gl_FragColor = vec4(finalColor, 0.3);
        }
      `,
      transparent: true
    });
    
    setShaderMaterial(material);

    // Update resolution when window resizes
    const handleResize = () => {
      if (material.uniforms) {
        material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      material.dispose();
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current || !shaderMaterial) return;
    
    if (shaderMaterial.uniforms) {
      shaderMaterial.uniforms.time.value = state.clock.elapsedTime;
    }
  });

  if (!shaderMaterial) return null;

  return (
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <planeGeometry args={[50, 30]} />
      <primitive object={shaderMaterial} attach="material" />
    </mesh>
  );
};

// Chat Preview Component
interface Message {
  username: string;
  content: string;
  color: string;
  avatar: string;
  timestamp: number;
}

const ChatPreview = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const collegeMessages = [
    {
      username: "Sarah_CS",
      content: "Anyone up for a study group tonight? 📚",
      color: "text-blue-400",
      avatar: "bg-blue-500/30"
    },
    {
      username: "Mike_Engineering",
      content: "Just finished my project! Coffee anyone? ☕",
      color: "text-green-400",
      avatar: "bg-green-500/30"
    },
    {
      username: "Emma_Art",
      content: "Check out my latest painting in the gallery! 🎨",
      color: "text-purple-400",
      avatar: "bg-purple-500/30"
    },
    {
      username: "Alex_Music",
      content: "Band practice at 7pm, see you there! 🎵",
      color: "text-yellow-400",
      avatar: "bg-yellow-500/30"
    },
    {
      username: "Lisa_Bio",
      content: "Lab results are in! Who wants to celebrate? 🧪",
      color: "text-pink-400",
      avatar: "bg-pink-500/30"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newMessage = {
        ...collegeMessages[currentIndex],
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev.slice(-2), newMessage]);
      setCurrentIndex(prev => (prev + 1) % collegeMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="relative max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-white/90">#general-chat</span>
            <span className="text-white/50">|</span>
            <span className="text-white/70 text-sm">Campus Community</span>
          </div>
        </div>

        <div className="p-4 h-48 flex flex-col justify-end">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.timestamp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-start gap-3 mb-3"
              >
                <div className={`w-8 h-8 rounded-full ${message.avatar} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-medium text-sm ${message.color}`}>
                      {message.username}
                    </span>
                    <span className="text-white/50 text-xs">just now</span>
                  </div>
                  <p className="text-white/90 text-sm">{message.content}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, delay }: {
  icon: any;
  title: string;
  description: string;
  delay: number;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isMobileDevice = useRef<boolean>(false);
  
  useEffect(() => {
    // Check if it's likely a touch device
    isMobileDevice.current = ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0);
  }, []);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobileDevice.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    
    // Calculate rotation based on mouse position
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateY = ((x - centerX) / centerX) * 12; // Reduced to 12 degrees for smoother effect
    const rotateX = -((y - centerY) / centerY) * 12; // Reduced to 12 degrees for smoother effect
    
    // Apply the rotation
    card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
    card.style.transition = 'none';
  };
  
  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    // Reset the card on mouse leave
    cardRef.current.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    cardRef.current.style.transition = 'all 0.5s ease';
  };

  const handleTouchStart = () => {
    if (!cardRef.current || !isMobileDevice.current) return;
    
    // Simple scale effect for touch devices
    cardRef.current.style.transform = 'scale3d(0.98, 0.98, 1)';
    cardRef.current.style.transition = 'transform 0.2s ease';
  };
  
  const handleTouchEnd = () => {
    if (!cardRef.current || !isMobileDevice.current) return;
    
    // Reset on touch end
    cardRef.current.style.transform = 'scale3d(1, 1, 1)';
    cardRef.current.style.transition = 'transform 0.3s ease';
  };

  return (
  <motion.div
    ref={cardRef}
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    onTouchStart={handleTouchStart}
    onTouchEnd={handleTouchEnd}
    transition={{ delay, duration: 0.6 }}
    style={{ 
      transformStyle: "preserve-3d",
      boxShadow: "0 8px 25px -12px rgba(0, 0, 0, 0.3)"
    }}
    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/10 hover:bg-white/10 transition-all duration-300"
  >
    <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-3 sm:mb-4" />
    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">{title}</h3>
    <p className="text-sm sm:text-base text-white/70">{description}</p>
  </motion.div>
  );
};

// Main Component
// Simple Email Popup Modal Component
// Create global access for emergency close function
declare global {
  interface Window {
    closeWaitlistModal?: () => void;
  }
}

const EmailPopup = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Create a global function that can be called from anywhere to close the modal
  useEffect(() => {
    if (isOpen) {
      window.closeWaitlistModal = () => {
        console.log('Emergency close function triggered');
        setIsOpen(false);
        setTimeout(() => {
          setIsSubmitted(false);
        }, 500);
      };
    }
    
    return () => {
      delete window.closeWaitlistModal;
    };
  }, [isOpen, setIsOpen]);
  
  // Close the modal - direct implementation
  const closeModal = () => {
    console.log('Closing modal');
    setIsOpen(false); // Set the parent component's state to false
  };
  
  // Direct close function for back button
  const handleBackClick = () => {
    // Directly set state in parent component
    setIsOpen(false);
    
    // Small timeout to ensure state updates before any other actions
    setTimeout(() => {
      console.log('Modal closed');
    }, 100);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission triggered');
    
    // Reset error state
    setEmailError('');
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setEmailError('Please enter your email');
      return;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    console.log('Submitting email to Google Sheets:', email);
    
    // Try multiple API formats to ensure one works
    const API_URLS = [
      'https://sheet.best/api/sheets/0678406a-c5ea-446a-bf4b-f1b4ed2109a8',
      'https://api.sheet.best/api/sheets/0678406a-c5ea-446a-bf4b-f1b4ed2109a8',
      'https://api.sheetbest.com/sheets/0678406a-c5ea-446a-bf4b-f1b4ed2109a8'
    ];
    
    let submissionSuccess = false;
    let lastError = null;
    
    // Try each API endpoint until one works
    for (const apiUrl of API_URLS) {
      if (submissionSuccess) break;
      
      try {
        console.log(`Trying API endpoint: ${apiUrl}`);
        
        // Send email to Google Sheet via API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          // Try both formats of data structure
          body: JSON.stringify({
            // Format 1: Capital letter column names
            Email: email,
            Date: new Date().toISOString(),
            // Format 2: lowercase column names
            email: email,
            date: new Date().toISOString(),
            // Additional fields for tracking
            source: window.location.hostname,
            timestamp: Date.now()
          }),
        });
        
        console.log(`API Response Status for ${apiUrl}:`, response.status);
        
        // Try to get response data
        let responseData;
        try {
          responseData = await response.text();
          console.log(`API raw response from ${apiUrl}:`, responseData);
          try {
            const jsonData = JSON.parse(responseData);
            console.log(`API JSON response from ${apiUrl}:`, jsonData);
          } catch (jsonError) {
            console.log('Response is not JSON format');
          }
        } catch (responseError) {
          console.log('Could not read response');
        }
        
        if (response.status < 400) {
          console.log(`Email submitted successfully to ${apiUrl}`);
          submissionSuccess = true;
          break;
        } else {
          console.log(`Failed with status ${response.status} for ${apiUrl}`);
          lastError = new Error(`Failed to submit email: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error(`Error with ${apiUrl}:`, error);
        lastError = error;
      }
    }
    
    if (submissionSuccess) {
      console.log('Email submission successful to at least one endpoint');
      setIsLoading(false);
      setIsSubmitted(true);
      // Clear the email field after successful submission
      setEmail('');
      
      // Store in sessionStorage as a backup in case state gets reset
      sessionStorage.setItem('emailSubmitted', 'true');
    } else {
      console.error('All API endpoints failed:', lastError);
      setIsLoading(false);
      // Show a more user-friendly error message
      setEmailError('Failed to join waitlist. Please try again.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Modal */}
            <motion.div 
              className="bg-gradient-to-br from-slate-800 via-slate-900 to-purple-900 rounded-2xl max-w-md w-full border border-white/10 overflow-hidden"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Content */}
              <div className="p-8">
                {!isSubmitted ? (
                  <>
                    {/* Back button */}
                    <div className="mb-4">
                      <motion.button
                        className="text-white/70 hover:text-white p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-1.5"
                        onClick={handleBackClick}
                        whileHover={{ x: -3 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowLeft size={16} />
                        <span className="text-sm">Back</span>
                      </motion.button>
                    </div>
                    
                    {/* Floating stars animation */}
                    <div className="relative h-20 mb-4">
                      {[...Array(10)].map((_, i) => (
                        <motion.div 
                          key={i}
                          className="absolute"
                          style={{ 
                            left: `${10 + (i * 8)}%`, 
                            top: `${Math.random() * 100}%`,
                            opacity: 0.6 + (Math.random() * 0.4)
                          }}
                          animate={{
                            y: [0, -10, 0],
                            opacity: [0.4, 0.8, 0.4],
                            scale: [0.8, 1, 0.8]
                          }}
                          transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        >
                          <Star size={i % 3 === 0 ? 16 : 12} className="text-yellow-400 fill-yellow-400" />
                        </motion.div>
                      ))}
                      
                      <motion.div 
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: [0, 5, 0, -5, 0] }}
                        transition={{ 
                          scale: { type: "spring", damping: 10, stiffness: 200 },
                          rotate: { duration: 4, repeat: Infinity }
                        }}
                      >
                        <Mail size={48} className="text-blue-400" />
                      </motion.div>
                    </div>
                  
                    <motion.h3 
                      className="text-2xl font-bold text-white mb-2 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Join Our Waitlist
                    </motion.h3>
                    
                    <motion.p 
                      className="text-white/70 mb-6 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Be the first to get access when we launch!
                    </motion.p>
                    
                    <motion.form 
                      className="flex flex-col gap-4 max-w-md mx-auto w-full"
                      onSubmit={handleSubmit}
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="mb-4">
                        <div className="relative">
                          <motion.div 
                            className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg opacity-50"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          />
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value);
                              if (emailError) setEmailError('');
                            }}
                            placeholder="Enter your email"
                            className={`w-full px-4 py-3 rounded-lg bg-white/5 backdrop-blur-sm text-white placeholder:text-white/50 outline-none relative z-10 focus:outline-none ${emailError ? 'ring-2 ring-pink-500' : 'focus:ring-2 focus:ring-blue-500'}`}
                            required
                          />
                        </div>
                        {emailError && (
                          <div className="text-pink-500 text-sm mt-1 ml-1">
                            {emailError}
                          </div>
                        )}
                      </div>
                      
                      <div className="relative">
                        {/* Button wrapper with fixed dimensions */}
                        <div className="w-full h-12 relative">
                          {/* Static gradient background - doesn't animate on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg"></div>
                          
                          {/* Hover effect overlay - separate from button content */}
                          <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 rounded-lg transition-opacity duration-200"></div>
                          
                          {/* Shimmer effect - contained within its own layer */}
                          <motion.div 
                            className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none"
                            style={{ willChange: 'transform', pointerEvents: 'none' }}
                          >
                            <motion.div
                              className="absolute w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                              initial={{ left: '-100%' }}
                              animate={{ left: '100%' }}
                              transition={{ repeat: Infinity, repeatDelay: 3, duration: 1.5 }}
                            />
                          </motion.div>
                                                   {/* Actual button with stable dimensions - SIMPLIFIED FOR RELIABILITY */}
                          <button
                            type="button" /* Changed to button type for more direct control */
                            disabled={isLoading}
                            className="absolute inset-0 w-full h-full flex items-center justify-center rounded-lg text-white font-medium focus:outline-none"
                            style={{ boxShadow: '0 4px 14px rgba(170, 20, 145, 0.39)', WebkitTapHighlightColor: 'transparent' }}
                            onClick={(e) => {
                              // Most direct implementation possible
                              e.preventDefault();
                              e.stopPropagation();
                              if (isLoading) return;
                              
                              console.log('Submit button clicked - direct implementation');
                              
                              // Validate email directly here for immediate feedback
                              const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                              if (!email) {
                                setEmailError('Please enter your email');
                                return;
                              }
                              if (!emailRegex.test(email)) {
                                setEmailError('Please enter a valid email address');
                                return;
                              }
                              
                              // Execute submit function directly
                              handleSubmit(e as unknown as React.FormEvent);
                            }}
                          >
                            {/* Content wrapper with fixed dimensions */}
                            <div className="z-10 flex items-center justify-center gap-2 min-w-[180px]">
                              {isLoading ? (
                                <div className="flex items-center justify-center">
                                  <svg className="w-5 h-5 text-white mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Submitting</span>
                                </div>
                              ) : (
                                <span className="flex items-center justify-center gap-2">
                                  Join Our Waitlist <Send className="w-4 h-4 ml-1" />
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.form>
                  </>
                ) : (
                  <EmailPopupSuccess 
                    onClose={() => {
                      console.log('Closing from EmailPopupSuccess component');
                      // First, close the modal
                      setIsOpen(false);
                      // Reset the submission state after a short delay
                      setTimeout(() => {
                        setIsSubmitted(false);
                      }, 500);
                    }}
                  />
                )}
              </div>
              
              {/* Decorative particles */}
              <div className="absolute inset-0 z-0">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/70 rounded-full"
                    style={{ 
                      left: `${Math.random() * 100}%`, 
                      top: `${Math.random() * 100}%`,
                      scale: Math.random() * 0.5 + 0.5
                    }}
                    animate={{ 
                      y: [0, -20],
                      opacity: [0, 0.8, 0] 
                    }}
                    transition={{
                      duration: 2 + Math.random() * 3,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Create a reusable click handler for testing
const testClickHandler = () => {
  console.log('Button clicked!');
  alert('Button clicked!');
};

const CollegeChatLanding = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  
  // Handler to open the email popup
  const handleOpenEmailPopup = () => {
    console.log('Opening popup!');
    setShowEmailPopup(true);
  };

  // Handler to close the email popup
  const handleCloseEmailPopup = () => {
    console.log('Closing popup!');
    setShowEmailPopup(false);
  };

  useEffect(() => {
    // Set loaded after a delay for animation purposes
    const timer = setTimeout(() => setIsLoaded(true), 200);
    return () => clearTimeout(timer);
  }, []);

  const features = [
    {
      icon: Users,
      title: "Connect with Peers",
      description: "Find study buddies, project partners, and lifelong friends in your college."
    },
    {
      icon: BookOpen,
      title: "Study Groups",
      description: "Join or create study groups for your courses and ace those exams together."
    },
    {
      icon: Coffee,
      title: "Campus Events",
      description: "Stay updated on campus events, parties, and social gatherings happening around you."
    },
    {
      icon: Heart,
      title: "Safe Space",
      description: "A verified college-only environment where you can be yourself and make genuine connections."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Email Popup Modal */}
      <EmailPopup isOpen={showEmailPopup} setIsOpen={setShowEmailPopup} />
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 65 }}>
          <Suspense fallback={null}>
            <AnimatedGradient />
            <FloatingOrbs />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.2} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <Star className="w-4 h-4" />
                  Coming Soon - Early Access
                </span>
                
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight text-center lg:text-left">
                  <span className="text-pink-500 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)] relative">
                    <span className="relative inline-block text-transparent bg-gradient-to-b from-pink-300 to-pink-500 bg-clip-text text-4xl sm:text-5xl lg:text-7xl font-gothic">ogadda</span>
                  </span>
                </h1>
                
                {isLoaded && (
                  <motion.p 
                    className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8 max-w-lg mx-auto lg:mx-0 block"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.4, 
                      duration: 0.8,
                      ease: "easeOut"
                    }}
                  >
                    <motion.span
                      className="inline-block"
                      initial={{ filter: "blur(4px)" }}
                      animate={{ filter: "blur(0px)" }}
                      transition={{ duration: 1.2, delay: 0.5 }}
                    >
                      Hey college fam! Ogadda is your go-to spot for unfiltered hostel gossip, heartbreak rants, and exam stress relief. No fake vibes, just real students, real stories. Jump on the waitlist and let's make campus convos lit! 🚀
                    </motion.span>
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.button
                  className="relative px-8 sm:px-10 py-3 sm:py-4 font-semibold text-white flex items-center justify-center group w-full sm:w-auto"
                  style={{
                    WebkitTapHighlightColor: 'transparent'
                  }}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  animate="initial"
                  onClick={handleOpenEmailPopup}
                >
                  {/* Animated borders */}
                  <motion.span 
                    className="absolute inset-0 rounded-xl overflow-hidden"
                    variants={{
                      initial: { opacity: 0, scale: 0.95 },
                      hover: { opacity: 1, scale: 1 }
                    }}
                  >
                    {[...Array(4)].map((_, i) => (
                      <motion.span 
                        key={i}
                        className="absolute inset-[-2px] rounded-xl"
                        style={{
                          background: `conic-gradient(from ${i * 90}deg at 50% 50%, #8b5cf6 0deg, #d946ef 90deg, #ec4899 180deg, #3b82f6 270deg, #8b5cf6 360deg)`,
                        }}
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 4,
                          ease: "linear",
                          repeat: Infinity,
                          repeatType: "loop",
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.span>

                  {/* Button background */}
                  <motion.span 
                    className="absolute inset-[2px] bg-slate-900 rounded-lg z-[1]"
                    variants={{
                      hover: { inset: '3px' },
                      tap: { inset: '1px' }
                    }}
                  />
                  
                  {/* Button content */}
                  <motion.span 
                    className="relative z-10 flex items-center"
                    variants={{
                      hover: { scale: 1.05 },
                      tap: { scale: 0.97 }
                    }}
                  >
                    <motion.span
                      className="inline-block"
                    >
                      Join Waitlist
                    </motion.span>
                    <motion.span
                      className="ml-2 inline-block text-xl"
                      variants={{
                        initial: { x: 0 },
                        hover: { x: [0, 5, 0], transition: { repeat: Infinity, duration: 1 } }
                      }}
                    >
                      🚀
                    </motion.span>
                  </motion.span>
                  
                  {/* Particle effects */}
                  <motion.span 
                    className="absolute inset-0 rounded-xl overflow-hidden"
                    variants={{
                      initial: { opacity: 0 },
                      hover: { opacity: 1 }
                    }}
                  >
                    {[...Array(20)].map((_, i) => (
                      <motion.span 
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
                        variants={{
                          hover: { 
                            y: [0, -30],
                            x: [0, (Math.random() - 0.5) * 20],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                          }
                        }}
                        transition={{
                          duration: 0.8 + Math.random() * 0.5,
                          ease: "easeOut",
                          repeat: Infinity,
                          repeatType: "loop",
                          delay: Math.random() * 0.2,
                        }}
                      />
                    ))}
                  </motion.span>
                  
                  {/* Shine effect */}
                  <motion.span
                    className="absolute inset-0 overflow-hidden rounded-xl"
                    variants={{
                      hover: {}
                    }}
                  >
                    <motion.span 
                      className="absolute top-0 left-0 h-full w-[120%] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]"
                      variants={{
                        hover: { x: ["-100%", "100%"] }
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatDelay: 0.5
                      }}
                    />
                  </motion.span>
                </motion.button>
              </motion.div>
            </div>

            {/* Right Content - Chat Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 30 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="flex justify-center"
            >
              <ChatPreview />
            </motion.div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div className="overflow-hidden mb-3 sm:mb-4">
              <motion.h2 
                className="text-3xl sm:text-4xl font-bold mb-0 inline-block relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  transition: {
                    duration: 0.7,
                    ease: [0.2, 0.65, 0.3, 0.9]
                  }
                }}
              >
                {/* Background glow effect */}
                <motion.span 
                  className="absolute inset-0 blur-xl rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6)',
                    opacity: 0.3,
                    zIndex: -1,
                  }}
                  animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                
                {"Built for College Life".split("").map((char, index) => {
                  // Generate a unique hue for each character for rainbow effect
                  const hue = (index * 15) % 360;
                  
                  return (
                    <motion.span
                      key={index}
                      className={char === " " ? "mx-2" : ""}
                      style={{ 
                        display: "inline-block",
                        color: "white",
                        textShadow: "0 0 8px rgba(255,255,255,0)",
                        position: "relative",
                        transformOrigin: "bottom center"
                      }}
                      initial={{ 
                        opacity: 0, 
                        y: 40,
                        rotateZ: index % 2 === 0 ? -10 : 10,
                        scale: 1.2,
                        filter: "blur(10px)"
                      }}
                      animate={{ 
                        opacity: 1, 
                        rotateZ: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        textShadow: "0 0 10px rgba(255,255,255,0.4)"
                      }}
                      // Add a continuous floating animation after initial reveal
                      whileInView={{
                        y: [0, -3, 0],
                        transition: {
                          y: {
                            delay: 0.8 + index * 0.05,
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "easeInOut",
                            // Stagger the floating animation to create a wave effect
                            repeatDelay: 0.2
                          }
                        }
                      }}
                      transition={{ 
                        duration: 0.7, 
                        delay: index * 0.06,
                        ease: [0.2, 0.65, 0.3, 0.9]
                      }}
                      whileHover={{
                        color: `hsl(${hue}, 80%, 60%)`,
                        y: -5,
                        scale: 1.2,
                        rotate: [0, -5, 5, 0],
                        transition: { 
                          duration: 0.3,
                          rotate: { duration: 0.5 }
                        }
                      }}
                    >
                      {/* Rainbow gradient effect on hover */}
                      <motion.span
                        style={{ 
                          position: "absolute", 
                          left: 0, 
                          top: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, hsl(${hue}, 100%, 60%), hsl(${(hue + 60) % 360}, 100%, 70%))`,
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          opacity: 0
                        }}
                        animate={{
                          opacity: [0, 0.6, 0],
                        }}
                        transition={{
                          duration: 4,
                          delay: index * 0.1,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut"
                        }}
                      >
                        {char}
                      </motion.span>
                      
                      {/* The main character */}
                      {char}
                    </motion.span>
                  );
                })}
              </motion.h2>
            </motion.div>
            <p className="text-white/70 text-lg max-w-2xl mx-auto">
              Everything you need to make the most of your college experience, 
              all in one secure and student-friendly platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={0.9 + index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 30 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="container mx-auto px-4 sm:px-6 py-10 sm:py-16 text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-12 border border-white/10">
            <MessageCircle className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
              Ready to Connect?
            </h3>
            <p className="text-white/70 text-lg mb-8 max-w-2xl mx-auto">
              Be among the first to experience the future of college social networking. 
              Sign up for early access and help shape the platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your college email"
                className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={(e) => e.stopPropagation()}
                onFocus={() => handleOpenEmailPopup()}
              />
              <button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 whitespace-nowrap"
                onClick={handleOpenEmailPopup}
                style={{ position: 'relative', overflow: 'hidden', WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="relative z-10">Get Early Access</span>
                {/* Add shimmer effect */}
                <span className="absolute inset-0 overflow-hidden">
                  <span className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full animate-shimmer"></span>
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CollegeChatLanding;
