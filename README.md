# SmartFlash Frontend

AI-Powered Flashcard Learning Companion - Frontend Application

Built with React Native and Expo for cross-platform support (Web, iOS, Android).

## Technology Stack

- **Framework**: React Native + Expo
- **Navigation**: Expo Router
- **State Management**: React Query (@tanstack/react-query)
- **UI**: React Native components with Expo
- **HTTP Client**: Axios

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (installed globally or via npx)

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm start

# Run on web
npm run web

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Build for Web

```bash
npm run build:web
```

This creates a static build in the `dist/` directory ready for deployment.

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Backend API URL
EXPO_PUBLIC_API_URL=http://localhost:5000
```

For production, set `EXPO_PUBLIC_API_URL` to your Railway backend URL.

## Deployment

### Vercel (Recommended)

This frontend is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Set Root Directory to `.` (root of frontend folder)
3. Set Build Command to `npm run build:web`
4. Set Output Directory to `dist`
5. Add environment variable: `EXPO_PUBLIC_API_URL` (your backend URL)

Vercel will automatically detect `vercel.json` configuration.

### Other Platforms

The `Dockerfile` is provided for Docker-based deployments:

```bash
docker build --build-arg EXPO_PUBLIC_API_URL=https://your-backend-url.com -t smartflash-frontend .
docker run -p 3000:80 smartflash-frontend
```

## Project Structure

```
frontend/
├── app/              # Expo Router app directory
│   ├── (tabs)/      # Tab navigation screens
│   ├── login.tsx    # Login screen
│   └── signup.tsx   # Signup screen
├── components/       # Reusable components
├── lib/             # Utilities and API client
├── constants/       # Constants and theme
└── assets/          # Images and fonts
```

## Features

- 🤖 AI-powered flashcard generation
- 📚 Study modules
- 🧠 Spaced repetition algorithm
- 📊 Performance analytics
- 📱 Cross-platform support (Web, iOS, Android)

## License

MIT

