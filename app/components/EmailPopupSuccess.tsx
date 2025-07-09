import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailPopupSuccessProps {
  onClose: () => void;
}

export default function EmailPopupSuccess({ onClose }: EmailPopupSuccessProps) {
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
        className="text-white/60 text-center text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Thank you for joining our exclusive waitlist community!
      </motion.p>
      
      <motion.div 
        className="mt-8 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button
          type="button"
          id="successCloseButtonNew"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Close button clicked - ultra reliable implementation');
            
            // Method 1: Use global function if available
            if (window.closeWaitlistModal) {
              try {
                window.closeWaitlistModal();
                console.log('Closed using global function');
                return;
              } catch (err) {
                console.log('Global function failed, trying alternatives');
              }
            }
            
            // Method 2: Use passed callback
            try {
              onClose();
              console.log('Closed using callback');
              return;
            } catch (err) {
              console.log('Callback failed, trying direct DOM method');
            }
            
            // Method 3: Use direct DOM method as last resort
            try {
              // Force body scroll
              document.body.style.overflow = 'auto';
              // Try to find and hide modal directly
              const modalElement = document.querySelector('[role="dialog"]');
              if (modalElement && modalElement.parentNode) {
                modalElement.parentNode.removeChild(modalElement);
                console.log('Removed modal from DOM directly');
              }
              
              // Reset session state
              sessionStorage.setItem('modalClosed', 'true');
              console.log('Emergency DOM manipulation complete');
            } catch (err) {
              console.log('All close methods failed:', err);
              alert('Please refresh the page to continue');
            }
          }}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium text-sm hover:opacity-90 active:opacity-100 transition-opacity"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}
