import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Users, 
  ScreenShare, 
  Settings,
  Shield,
  LayoutGrid,
  ChevronRight,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';

import { useWebRTC } from '../hooks/useWebRTC';

interface MeetingRoomProps {
  meetingId: string;
  onLeave: () => void;
}

function RemoteVideo({ stream }: { stream: MediaStream }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline />;
}

export function MeetingRoom({ meetingId, onLeave }: MeetingRoomProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const { remoteStreams, createCall } = useWebRTC(meetingId, localStream);

  useEffect(() => {
    const startMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
      }
    };

    startMedia();

    // Chat listener
    const chatRef = collection(db, 'meetings', meetingId, 'chat');
    const q = query(chatRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    return () => {
      unsubscribe();
      localStream?.getTracks().forEach(track => track.stop());
    };
  }, [meetingId]);

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => (track.enabled = !isVideoOn));
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => (track.enabled = !isAudioOn));
      setIsAudioOn(!isAudioOn);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      await addDoc(collection(db, 'meetings', meetingId, 'chat'), {
        senderId: auth.currentUser?.uid,
        senderName: auth.currentUser?.displayName,
        text: messageInput,
        timestamp: serverTimestamp(),
      });
      setMessageInput('');
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between glass-panel z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Shield className="w-4 h-4 text-green-500" />
          </div>
          <h1 className="font-bold text-sm tracking-tight uppercase">Meeting: {meetingId}</h1>
          <button 
            onClick={() => navigator.clipboard.writeText(meetingId)}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-zinc-500 hover:text-white"
            title="Copy ID"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <LayoutGrid className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="video-grid max-w-7xl mx-auto h-full">
            <div className="video-container group">
              {!isVideoOn ? (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                  <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-4xl font-bold">
                    {auth.currentUser?.displayName?.[0]}
                  </div>
                </div>
              ) : (
                <video ref={localVideoRef} autoPlay playsInline muted />
              )}
              <div className="absolute bottom-4 left-4 glass-panel px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <span>{auth.currentUser?.displayName} (You)</span>
                {!isAudioOn && <MicOff className="w-3 h-3 text-red-500" />}
              </div>
            </div>
            
            {/* Remote streams */}
            {Object.entries(remoteStreams).map(([uid, stream]) => (
              <div key={uid} className="video-container group">
                <RemoteVideo stream={stream} />
                <div className="absolute bottom-4 left-4 glass-panel px-3 py-1.5 rounded-lg text-sm">
                  <span>Participant</span>
                </div>
              </div>
            ))}

            {Object.keys(remoteStreams).length === 0 && (
              <div className="video-container group bg-zinc-900 flex flex-col items-center justify-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center text-4xl font-bold text-zinc-600">
                  <Users className="w-12 h-12" />
                </div>
                <div className="text-center">
                  <p className="text-zinc-500 font-medium">No one else is here yet</p>
                  <button 
                    onClick={createCall}
                    className="mt-4 text-zoom-blue hover:underline font-bold uppercase text-xs tracking-widest"
                  >
                    Start Broadcast
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat sidebar */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-80 glass-panel border-l h-full flex flex-col z-20"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Chat</h2>
                <button onClick={() => setShowChat(false)}>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-zinc-500">{msg.senderName}</p>
                    <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                      <p className="text-sm">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 bg-zinc-900/50">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-zoom-blue"
                  />
                  <button type="submit" className="p-2 bg-zoom-blue rounded-xl hover:bg-blue-600 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="p-6 flex items-center justify-center gap-4 glass-panel border-t z-10">
        <button
          onClick={toggleAudio}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors ${
            !isAudioOn ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-zinc-100'
          }`}
        >
          {isAudioOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          <span className="text-[10px] font-bold uppercase select-none">Mute</span>
        </button>
        <button
          onClick={toggleVideo}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors ${
            !isVideoOn ? 'bg-red-500/20 text-red-500' : 'hover:bg-white/10 text-zinc-100'
          }`}
        >
          {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          <span className="text-[10px] font-bold uppercase select-none">Stop Video</span>
        </button>
        
        <div className="w-px h-8 bg-white/10 mx-2" />

        <button className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 transition-colors text-zinc-300">
          <ScreenShare className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase select-none">Share</span>
        </button>
        <button className="flex flex-col items-center gap-1.5 p-3 rounded-2xl hover:bg-white/10 transition-colors text-zinc-300">
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase select-none">Participants</span>
        </button>
        <button
          onClick={() => setShowChat(!showChat)}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-colors ${
            showChat ? 'bg-zoom-blue/20 text-zoom-blue' : 'hover:bg-white/10 text-zinc-300'
          }`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase select-none">Chat</span>
        </button>
        
        <div className="w-px h-8 bg-white/10 mx-2" />

        <button
          onClick={onLeave}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-red-500/20"
        >
          End Meeting
        </button>
      </div>
    </div>
  );
}
