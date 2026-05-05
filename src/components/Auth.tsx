import React from 'react';
import { LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import { signInWithGoogle } from '../lib/firebase';

export function Auth() {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Failed to sign in', error);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-zoom-dark">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-8"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-zoom-blue rounded-2xl flex items-center justify-center shadow-lg shadow-zoom-blue/20">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-12 h-12 text-white"
              >
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </motion.div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Hassan Bhai Stopppp</h1>
          <p className="text-zinc-400 max-w-sm">
            Experience the next generation of meetings. 
            All-in-one chat and video conferencing.
          </p>
        </div>

        <button
          id="google-signin-btn"
          onClick={handleSignIn}
          className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors mx-auto"
        >
          <LogIn className="w-5 h-5" />
          Sign in with Google
        </button>
      </motion.div>
    </div>
  );
}
