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

## 🚀 Deployment to GitHub

This app is optimized for GitHub. You have two ways to deploy:

### 1. Automatic Deployment (GitHub Actions)
I've included a GitHub Action workflow. Simply:
1. Create a new repository on GitHub.
2. Push your code to the `main` branch.
3. Go to your repo **Settings** > **Pages**.
4. Under **Build and deployment** > **Source**, select **GitHub Actions**.
5. Your site will deploy automatically!

### 2. Manual Deployment
Run:
```bash
npm run deploy
```

## ⚠️ Important: Firebase Authorization
For Google Login to work on GitHub, you **must**:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project > **Authentication** > **Settings** > **Authorized domains**.
3. Add your GitHub Pages domain (e.g., `your-username.github.io`).

## Technologies

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **Backend**: Firebase Auth & Firestore
- **Animation**: Framer Motion
- **Icons**: Lucide React
