import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

export default function Toast({ message, show, onDismiss }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-zinc-800 text-white rounded-lg shadow-lg z-50 border border-zinc-700"
        >
          {message.includes('must log in') ? (
            <AlertCircle size={20} className="text-yellow-400" />
          ) : (
            <CheckCircle size={20} className="text-green-400" />
          )}
          <span className="font-medium">{message}</span>
          <button 
            onClick={onDismiss} 
            className="ml-2 text-zinc-400 hover:text-white"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}