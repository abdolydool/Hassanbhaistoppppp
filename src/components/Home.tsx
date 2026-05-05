import React, { useState } from 'react';
import { Video, Plus, Link as LinkIcon, Calendar, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { auth, db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';

interface HomeProps {
  onJoinMeeting: (id: string) => void;
}

export function Home({ onJoinMeeting }: HomeProps) {
  const [meetingInput, setMeetingInput] = useState('');

  const createMeeting = async () => {
    const meetingId = Math.random().toString(36).substring(2, 12);
    const meetingRef = doc(db, 'meetings', meetingId);
    
    await setDoc(meetingRef, {
      id: meetingId,
      hostId: auth.currentUser?.uid,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    
    onJoinMeeting(meetingId);
  };

  const joinMeeting = () => {
    if (meetingInput.trim()) {
      onJoinMeeting(meetingInput.trim());
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-12">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={createMeeting}
              className="flex flex-col items-center justify-center aspect-square bg-[#FF742E] rounded-3xl p-6 hover:brightness-110 transition-all text-white group"
            >
              <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                <Video className="w-8 h-8" />
              </div>
              <span className="mt-4 font-bold text-lg">New Meeting</span>
            </button>
            <button
              id="join-btn-card"
              className="flex flex-col items-center justify-center aspect-square bg-zoom-blue rounded-3xl p-6 hover:brightness-110 transition-all text-white group"
            >
              <div className="bg-white/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8" />
              </div>
              <span className="mt-4 font-bold text-lg">Join</span>
            </button>
            <button className="flex flex-col items-center justify-center aspect-square bg-[#2D8CFF1A] border border-zoom-blue/20 rounded-3xl p-6 hover:bg-zoom-blue/10 transition-all text-zoom-blue group">
              <div className="bg-zoom-blue/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8" />
              </div>
              <span className="mt-4 font-bold text-lg">Schedule</span>
            </button>
            <button className="flex flex-col items-center justify-center aspect-square bg-[#2D8CFF1A] border border-zoom-blue/20 rounded-3xl p-6 hover:bg-zoom-blue/10 transition-all text-zoom-blue group">
              <div className="bg-zoom-blue/20 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                <Monitor className="w-8 h-8" />
              </div>
              <span className="mt-4 font-bold text-lg">Share Screen</span>
            </button>
          </div>

          <div className="flex gap-4 p-2 bg-zoom-panel rounded-2xl border border-white/5">
            <input
              type="text"
              placeholder="Enter meeting ID"
              value={meetingInput}
              onChange={(e) => setMeetingInput(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none px-4 text-lg"
            />
            <button
              onClick={joinMeeting}
              className="bg-zinc-700 px-6 py-3 rounded-xl hover:bg-zinc-600 transition-colors"
            >
              Join
            </button>
          </div>
        </div>

        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-zoom-blue/10 blur-3xl rounded-full" />
          <div className="relative glass-panel rounded-3xl p-8 aspect-[4/3] flex flex-col justify-between">
            <div className="flex items-center justify-between text-zinc-400 uppercase text-xs tracking-widest font-bold">
              <span>Next Meeting</span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-bold">You have no upcoming meetings</h2>
              <p className="text-zinc-500">Create a new one to get started with Hassan Bhai Stopppp</p>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-zoom-blue w-1/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
