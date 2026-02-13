# FitAI - AI-Powered Fitness & Meal Planner

A comprehensive Next.js 14 application featuring AI-powered workout planning, meal planning, progress tracking, and personalized fitness coaching.

## Features

### 🏋️ Workout Planning
- **AI-Generated Workout Plans**: Personalized workout routines based on fitness level, goals, and available equipment
- **Interactive Workout Player**: Step-by-step exercise guidance with rest timers and progress tracking
- **Exercise Library**: Detailed instructions, target muscles, and difficulty levels for each exercise
- **Workout History**: Track completed workouts and monitor progress over time

### 🍎 Meal Planning
- **Custom Meal Plans**: AI-generated nutrition plans based on body metrics, goals, and dietary restrictions
- **Macro Tracking**: Detailed calorie, protein, carbs, and fat breakdown for each meal
- **Recipe Instructions**: Step-by-step cooking instructions with ingredient lists
- **Dietary Preferences**: Support for vegetarian, vegan, gluten-free, and other dietary requirements

### 📊 Progress Tracking
- **BMI Calculator**: Real-time BMI calculation and tracking
- **Weight Tracking**: Monitor weight changes over time
- **Workout Statistics**: Track total workouts, weekly activity, and current streaks
- **Visual Progress**: Charts and graphs to visualize fitness journey

### 💬 AI Fitness Coach
- **24/7 Chat Support**: Ask questions about workouts, nutrition, form, and motivation
- **Personalized Advice**: Context-aware responses based on user profile and goals
- **Evidence-Based**: Recommendations backed by fitness and nutrition science

### 👤 User Management
- **Firebase Authentication**: Secure sign-up and login with email/password and Google OAuth
- **Onboarding Flow**: Guided setup to capture user goals, metrics, and preferences
- **Profile Management**: Update personal information, goals, and dietary preferences

## Tech Stack

- **Framework**: Next.js 14 (App Router with TypeScript)
- **Styling**: Tailwind CSS 4 with custom components
- **Authentication**: Firebase Auth (Email/Password + Google OAuth)
- **Database**: Cloud Firestore for data persistence
- **AI Integration**: OpenAI GPT-4 for workout/meal generation and chat coaching
- **Animations**: Framer Motion for smooth UI transitions
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fitai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your credentials:
   ```env
   # Firebase Configuration (Client)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Firestore Database
   - Enable Authentication (Email/Password and Google providers)
   - Copy your Firebase config values to `.env.local`

5. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /workoutPlans/{planId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
       match /mealPlans/{planId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
       match /workoutSessions/{sessionId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
       match /progressEntries/{entryId} {
         allow read, write: if request.auth != null && 
           resource.data.userId == request.auth.uid;
       }
     }
   }
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
fitai/
├── app/
│   ├── api/              # API routes
│   │   ├── chat/         # AI coach chat endpoint
│   │   ├── generate-meal-plan/  # Meal plan generation
│   │   └── generate-workout/    # Workout plan generation
│   ├── coach/            # AI coach chat page
│   ├── dashboard/        # Main dashboard
│   ├── login/            # Login page
│   ├── signup/           # Sign up page
│   ├── onboarding/       # User onboarding flow
│   ├── profile/          # User profile management
│   ├── workouts/         # Workout plans listing and player
│   ├── meals/            # Meal plans listing
│   ├── progress/         # Progress tracking
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css       # Global styles
├── components/
│   ├── layout/           # Layout components (Navigation)
│   ├── onboarding/       # Onboarding flow components
│   └── ui/               # Reusable UI components (Button, Card, Input)
├── contexts/
│   └── AuthContext.tsx   # Authentication context
├── lib/
│   └── firebase.ts       # Firebase configuration
├── types/
│   └── index.ts          # TypeScript type definitions
├── public/               # Static assets
├── .env.local.example    # Environment variables template
├── .gitignore
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Key Features Implementation

### Authentication Flow
1. Users can sign up with email/password or Google OAuth
2. After sign-up, users are redirected to the onboarding flow
3. Onboarding captures: age, gender, height, weight, fitness goals, activity level, and dietary restrictions
4. User profile is stored in Firestore and synced via AuthContext
5. Protected routes redirect to login if user is not authenticated

### Workout Generation
1. User clicks "Generate Workout Plan" on dashboard or workouts page
2. API endpoint receives user profile (goals, fitness level, etc.)
3. OpenAI GPT-4 generates personalized workout with exercises, sets, reps, and instructions
4. Workout plan is saved to Firestore
5. User can view all workout plans and start interactive workout sessions

### Meal Planning
1. User requests meal plan generation
2. API calculates daily calorie needs based on body metrics and goals
3. OpenAI GPT-4 generates meal plan with recipes, macros, and instructions
4. Meal plan respects dietary restrictions (vegetarian, vegan, etc.)
5. Plan is saved to Firestore for future reference

### AI Coach Chat
1. User asks fitness/nutrition questions
2. Chat history is maintained in component state
3. OpenAI GPT-4 responds with context-aware advice
4. System prompt includes user profile for personalized responses
5. Chat supports follow-up questions and maintains conversation context

## Database Schema

### Users Collection (`users/{userId}`)
```typescript
{
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;  // cm
  weight: number;  // kg
  targetWeight?: number;
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryRestrictions: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Workout Plans (`workoutPlans/{planId}`)
```typescript
{
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: number;  // days per week
  duration: number;   // minutes
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Meal Plans (`mealPlans/{planId}`)
```typescript
{
  id: string;
  userId: string;
  name: string;
  description: string;
  dailyCalories: number;
  dailyProtein: number;
  dailyCarbs: number;
  dailyFat: number;
  meals: {
    breakfast: Meal[];
    lunch: Meal[];
    dinner: Meal[];
    snacks: Meal[];
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Workout Sessions (`workoutSessions/{sessionId}`)
```typescript
{
  id: string;
  userId: string;
  workoutPlanId: string;
  date: Date;
  duration: number;
  caloriesBurned: number;
  exercises: {
    exerciseId: string;
    sets: number;
    reps: number[];
    weight: number[];
    completed: boolean;
  }[];
  notes?: string;
  rating?: number;
}
```

## API Routes

### POST `/api/chat`
Chat with AI fitness coach
- **Body**: `{ messages: ChatMessage[], context: UserProfile }`
- **Response**: `{ message: string }`

### POST `/api/generate-workout`
Generate personalized workout plan
- **Body**: `{ userProfile: UserProfile }`
- **Response**: `WorkoutPlan`

### POST `/api/generate-meal-plan`
Generate personalized meal plan
- **Body**: `{ userProfile: UserProfile }`
- **Response**: `MealPlan`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | Yes |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Project ID | Yes |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | Yes |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | Yes |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase App ID | Yes |
| `OPENAI_API_KEY` | OpenAI API Key for GPT-4 | Yes |

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Adding New Exercise Types
Edit `app/api/generate-workout/route.ts` and modify the OpenAI prompt to include new exercise categories.

### Changing AI Model
Update the `model` parameter in API routes:
- `gpt-4o-mini` (default, cost-effective)
- `gpt-4` (more powerful, higher cost)
- `gpt-3.5-turbo` (faster, lower cost)

### Modifying Meal Plan Structure
Edit `app/api/generate-meal-plan/route.ts` to adjust:
- Meal categories (add snacks, pre-workout, etc.)
- Macro ratios based on fitness goals
- Recipe complexity and preparation time

## Best Practices

1. **Security**: Never commit `.env.local` file
2. **Firestore**: Implement proper security rules for production
3. **API Costs**: Monitor OpenAI API usage to control costs
4. **Performance**: Use React Server Components where possible
5. **Error Handling**: Always wrap Firebase/OpenAI calls in try-catch blocks

## Troubleshooting

### Firebase Connection Issues
- Verify all Firebase config values in `.env.local`
- Check Firebase console for enabled authentication methods
- Ensure Firestore database is created and has proper rules

### OpenAI API Errors
- Verify API key is valid and has sufficient credits
- Check OpenAI rate limits and usage quotas
- Ensure request format matches API requirements

### Build Errors
- Clear `.next` cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npx tsc --noEmit`

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review documentation and troubleshooting guide

## Roadmap

- [ ] Exercise video demonstrations
- [ ] Progress photos upload
- [ ] Social features (share workouts, compete with friends)
- [ ] Apple Health / Google Fit integration
- [ ] Wearable device sync
- [ ] Advanced analytics and insights
- [ ] Custom exercise builder
- [ ] Nutrition barcode scanner
- [ ] Meal prep planning
- [ ] Push notifications for workout reminders

---

Built with ❤️ using Next.js, Firebase, and OpenAI
