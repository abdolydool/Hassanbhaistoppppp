# Hassan Bhai Stopppp 🎥

A professional-grade Zoom replica built with React, Tailwind CSS, and Firebase. This all-in-one app supports real-time video meetings, instant chat, and meeting management.

## Features

- 🔐 **Google Authentication**: Secure sign-in with Firebase.
- 📹 **Video Conferencing**: Real-time WebRTC video and audio.
- 💬 **Instant Chat**: Keep the conversation going with a sidebar chat.
- 🏠 **Meeting Home**: Easily create or join meetings via IDs.
- 📱 **Responsive Design**: Polished UI that works on all devices.

## Quick Start

1. **Clone the repo**:
   ```bash
   git clone <your-repo-url>
   cd hassan-bhai-stopppp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Setup**:
   - Create a project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Google Provider).
   - Create a **Firestore Database**.
   - Copy your config into `firebase-applet-config.json`.

4. **Run development server**:
   ```bash
   npm run dev
   ```

## Deploy to GitHub Pages

This project is pre-configured for GitHub Pages.

1. **Set your repo in package.json**:
   Ensure `homepage` or the repository link is set if needed (Vite uses relative paths by default here).

2. **Deploy**:
   ```bash
   npm run deploy
   ```

## Technologies

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **Backend**: Firebase Auth & Firestore
- **Animation**: Framer Motion
- **Icons**: Lucide React
