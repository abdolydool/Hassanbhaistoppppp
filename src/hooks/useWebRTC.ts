import { useEffect, useRef, useState } from 'react';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const servers = {
  iceServers: [
    {
      urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
    },
  ],
  iceCandidatePoolSize: 10,
};

export function useWebRTC(meetingId: string, localStream: MediaStream | null) {
  const [remoteStreams, setRemoteStreams] = useState<{ [uid: string]: MediaStream }>({});
  const pcs = useRef<{ [uid: string]: RTCPeerConnection }>({});

  useEffect(() => {
    if (!localStream || !auth.currentUser) return;

    const currentUserUid = auth.currentUser.uid;
    const callsRef = collection(db, 'meetings', meetingId, 'calls');

    // Listener for new call offers
    const unsubscribe = onSnapshot(callsRef, async (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === 'added') {
          const callData = change.doc.data();
          const callId = change.doc.id;

          // If someone else created a call and I'm not the offerer
          if (callData.offererId !== currentUserUid && !pcs.current[callData.offererId]) {
            await answerCall(callId, callData.offererId);
          }
        }
      });
    });

    const answerCall = async (callId: string, offererId: string) => {
      const pc = new RTCPeerConnection(servers);
      pcs.current[offererId] = pc;

      const remoteStream = new MediaStream();
      setRemoteStreams(prev => ({ ...prev, [offererId]: remoteStream }));

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteStream.addTrack(track);
        });
      };

      const callDoc = doc(db, 'meetings', meetingId, 'calls', callId);
      const answerCandidates = collection(callDoc, 'answerCandidates');
      const offerCandidates = collection(callDoc, 'offerCandidates');

      pc.onicecandidate = (event) => {
        event.candidate && addDoc(answerCandidates, event.candidate.toJSON());
      };

      const callData = (await getDoc(callDoc)).data();
      const offerDescription = callData?.offer;
      await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

      const answerDescription = await pc.createAnswer();
      await pc.setLocalDescription(answerDescription);

      const answer = {
        type: answerDescription.type,
        sdp: answerDescription.sdp,
      };

      await updateDoc(callDoc, { answer });

      onSnapshot(offerCandidates, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            let data = change.doc.data();
            pc.addIceCandidate(new RTCIceCandidate(data));
          }
        });
      });
    };

    return () => {
      unsubscribe();
      Object.values(pcs.current).forEach(pc => pc.close());
    };
  }, [meetingId, localStream]);

  const createCall = async () => {
    if (!localStream || !auth.currentUser) return;

    const pc = new RTCPeerConnection(servers);
    const currentUserUid = auth.currentUser.uid;

    const callDoc = doc(collection(db, 'meetings', meetingId, 'calls'));
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    pc.onicecandidate = (event) => {
      event.candidate && addDoc(offerCandidates, event.candidate.toJSON());
    };

    const offerDescription = await pc.createOffer();
    await pc.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer, offererId: currentUserUid });

    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!pc.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        const remoteId = "peer"; // Simplification for 1-to-1 or first peer
        setRemoteStreams(prev => {
          const fresh = prev[remoteId] || new MediaStream();
          fresh.addTrack(track);
          return { ...prev, [remoteId]: fresh };
        });
      });
    };

    pcs.current["host"] = pc;
  };

  return { remoteStreams, createCall };
}
