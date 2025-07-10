import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface EmailPopupSuccessProps {
  onClose: () => void;
}

export default function EmailPopupSuccess({ onClose }: EmailPopupSuccessProps) {
  // Add automatic redirect after 3 seconds
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      window.location.href = '/';
    }, 3000);
    
    // Clean up the timer if component unmounts
    return () => clearTimeout(redirectTimer);
  }, []);
  return (
    <div className="py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.2, 1] }}
        transition={{ duration: 0.5, times: [0, 0.7, 1] }}
        className="flex justify-center mb-6"
      >
        <div className="rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 p-5">
          <CheckCircle size={56} className="text-pink-400" />
        </div>
      </motion.div>
      
      <motion.h3 
        className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500 mb-3 text-center font-gothic"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Success! You're on the List
      </motion.h3>
      
      <motion.p 
        className="text-white/80 text-center mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        We've received your email! You'll be notified when <span className="font-gothic italic text-pink-400">ogadda</span> launches.
      </motion.p>
      
      <motion.p
        className="text-white/60 text-center text-sm mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Thank you for joining our exclusive waitlist community!
      </motion.p>
      
      {/* Close button removed as requested */}
    </div>
  );
}
