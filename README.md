# FitAI - AI Fitness & Meal Planner

A comprehensive AI-powered fitness and nutrition application built with Next.js 14, Firebase, and OpenAI. Get personalized workout plans, meal plans, progress tracking, and an AI coaching chat system.

## Features

### 🏋️ Personalized Workout Plans
- AI-generated workout plans based on your fitness goals and level
- Interactive workout player with exercise instructions
- Step-by-step guidance with sets, reps, and rest timers
- Exercise animations and form tips

### 🍽️ Custom Meal Plans
- Nutrition plans calculated based on your body metrics
- Daily macro tracking (calories, protein, carbs, fat)
- Detailed recipes with ingredients and instructions
- Support for dietary restrictions (vegetarian, vegan, gluten-free, etc.)

### 📊 Progress Tracking
- Track weight, body fat percentage, and measurements
- Visual progress charts and graphs
- Historical data and trends
- Photo progress tracking

### 🤖 AI Fitness Coach
- 24/7 AI chatbot for fitness questions
- Personalized advice based on your profile
- Form corrections and technique tips
- Motivational support and guidance

### 👤 User Onboarding
- Multi-step onboarding flow
- Collect fitness goals, body metrics, and preferences
- Personalized experience from day one

### 🔐 Authentication
- Email/password authentication
- Google OAuth integration
- Secure user data storage with Firebase

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, OpenAI API
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Firebase account
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fitai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database
4. Copy your Firebase configuration to `.env.local`

### Firestore Collections

The app uses the following collections:

- `users`: User profiles and settings
- `workoutPlans`: Generated workout plans
- `mealPlans`: Generated meal plans
- `workoutSessions`: Completed workout sessions
- `progressEntries`: Weight and body measurements

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/         # AI chat endpoint
│   │   ├── generate-workout/  # Workout generation
│   │   └── generate-meal-plan/ # Meal plan generation
│   ├── dashboard/        # Main dashboard
│   ├── workouts/         # Workout plans and player
│   ├── meals/            # Meal plans
│   ├── progress/         # Progress tracking
│   ├── coach/            # AI coach chat
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── onboarding/       # User onboarding
│   └── profile/          # User profile settings
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── onboarding/       # Onboarding flow
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                   # Utility functions
│   └── firebase.ts       # Firebase configuration
└── types/                 # TypeScript types
    └── index.ts          # Type definitions
```

## Key Features Implementation

### AI Workout Generation

The workout generation uses OpenAI's GPT-4 to create personalized workout plans based on:
- User's fitness goals (lose weight, gain muscle, etc.)
- Activity level
- Age, gender, height, and weight
- Available equipment

### AI Meal Plan Generation

Meal plans are calculated using:
- BMR (Basal Metabolic Rate) calculation
- TDEE (Total Daily Energy Expenditure) based on activity level
- Macro distribution (protein, carbs, fat)
- Dietary restrictions and preferences

### Workout Player

The interactive workout player includes:
- Exercise progression tracker
- Rest timer between sets
- Visual progress bar
- Exercise instructions and target muscles
- Session completion tracking

### Progress Tracking

Track and visualize:
- Weight changes over time
- Body measurements
- BMI calculation
- Goal progress

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel project settings
4. Deploy!

## Environment Variables

All environment variables must be set in production:

- Firebase credentials (NEXT_PUBLIC_*)
- OpenAI API key (OPENAI_API_KEY)

## Security Notes

- Never commit `.env.local` to version control
- Keep Firebase security rules restrictive
- Validate all user inputs on the server side
- Use Firebase Authentication for secure user management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Firebase, and OpenAI
