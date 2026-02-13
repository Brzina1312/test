# FitAI - AI Fitness & Meal Planner

A complete AI-powered fitness and nutrition application built with Next.js, Firebase, and OpenAI. Get personalized workout plans, meal plans, progress tracking, and an AI coaching chatbot tailored to your fitness goals.

## Features

### 🏋️ Personalized Workout Plans
- AI-generated workout plans based on your fitness level and goals
- Interactive workout player with exercise instructions
- Real-time progress tracking during workouts
- Exercise animations and step-by-step guidance
- Set and rep tracking with rest timers

### 🍽️ Custom Meal Plans
- AI-generated meal plans based on your dietary preferences
- Calorie and macro calculations (protein, carbs, fats)
- Detailed recipes with ingredients and instructions
- Support for various dietary restrictions (vegan, vegetarian, gluten-free, etc.)
- Daily nutrition targets based on your goals

### 📊 Progress Tracking
- Weight tracking over time
- Body measurements logging
- Visual charts and progress graphs
- Workout history and statistics
- BMI calculator and insights

### 🤖 AI Fitness Coach
- Real-time chat with an AI fitness coach
- Personalized advice on workouts and nutrition
- Form corrections and exercise tips
- Motivation and support
- Context-aware responses based on your profile

### 👤 User Onboarding
- Guided onboarding flow
- Personal information collection (age, gender, height, weight)
- Fitness goals selection (lose weight, gain muscle, maintain, improve endurance)
- Activity level assessment
- Dietary restrictions setup

### 🔐 Authentication
- Email and password authentication
- Google Sign-In integration
- User profile management
- Secure Firebase authentication

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **AI**: OpenAI GPT-4o-mini
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project
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

Create a `.env.local` file in the root directory and add your credentials:

```env
# Firebase Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

4. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Add your web app and copy the configuration values

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── chat/         # AI coach chat endpoint
│   │   ├── generate-workout/  # Workout plan generation
│   │   └── generate-meal-plan/ # Meal plan generation
│   ├── coach/            # AI coach chat page
│   ├── dashboard/        # Main dashboard
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── onboarding/       # User onboarding flow
│   ├── workouts/         # Workout plans and player
│   ├── meals/            # Meal plans
│   ├── progress/         # Progress tracking
│   ├── profile/          # User profile management
│   └── layout.tsx        # Root layout with AuthProvider
├── components/
│   ├── layout/           # Layout components (Navigation)
│   ├── onboarding/       # Onboarding flow components
│   └── ui/               # Reusable UI components
├── contexts/
│   └── AuthContext.tsx   # Authentication context and hooks
├── lib/
│   └── firebase.ts       # Firebase configuration
└── types/
    └── index.ts          # TypeScript type definitions
```

## Firebase Collections

The app uses the following Firestore collections:

- `users` - User profiles and settings
- `workoutPlans` - AI-generated workout plans
- `workoutSessions` - Completed workout sessions
- `mealPlans` - AI-generated meal plans
- `progressEntries` - Weight and body measurement tracking

## Features in Detail

### Onboarding Flow
New users go through a 3-step onboarding process:
1. Basic information (age, gender, height, weight)
2. Fitness goals and target weight
3. Dietary restrictions and preferences

### Workout Player
The workout player provides an interactive experience:
- Exercise-by-exercise guidance
- Set and rep tracking
- Rest timers between sets
- Progress indicators
- Skip and completion controls

### AI Meal Plan Generation
Meal plans are calculated based on:
- Basal Metabolic Rate (BMR)
- Total Daily Energy Expenditure (TDEE)
- Fitness goals (calorie surplus/deficit)
- Macro distribution (protein, carbs, fats)
- Dietary restrictions

### AI Coaching
The AI coach provides:
- Exercise form tips
- Nutrition advice
- Workout recommendations
- Motivational support
- Personalized responses based on user profile

## Development

### Build for Production

```bash
npm run build
```

### Run Production Build

```bash
npm start
```

### Lint Code

```bash
npm run lint
```

## Environment Variables

All required environment variables are documented in `.env.example`. Make sure to set up both Firebase and OpenAI credentials for the app to function properly.

## Deployment

This app can be deployed to Vercel, Netlify, or any platform that supports Next.js:

1. Push your code to a Git repository
2. Connect your repository to your hosting platform
3. Add environment variables in the platform's dashboard
4. Deploy!

For Vercel:
```bash
vercel deploy
```

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue in the GitHub repository.
