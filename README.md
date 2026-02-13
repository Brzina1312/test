# AI Fitness & Meal Planner

A complete AI-powered fitness and meal planning application built with Next.js 14, Firebase, and OpenAI.

## Features

### 🔐 Authentication
- Email/password authentication
- Google OAuth integration
- Secure user profile management

### 🎯 Personalized Onboarding
- Multi-step onboarding flow
- Goal selection (Weight Loss, Muscle Gain, Endurance, etc.)
- Fitness level assessment
- Dietary preference configuration

### 💪 Workout Plans
- AI-generated personalized workout plans
- Interactive workout player with:
  - Exercise animations and guidance
  - Set tracking
  - Rest timer
  - Progress indicators
- Workout history tracking

### 🍎 Meal Plans
- AI-generated nutrition plans
- Customized based on dietary preferences
- Detailed macros (calories, protein, carbs, fats)
- Ingredient lists and cooking instructions
- Multiple meal types (breakfast, lunch, dinner, snacks)

### 📊 Progress Tracking
- Workout session history
- Weight tracking with charts
- Weekly statistics
- Visual progress graphs

### 🤖 AI Coaching Chat
- Real-time chat with AI fitness coach
- Personalized advice based on user profile
- Nutrition and workout guidance
- Motivational support
- Context-aware responses

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **AI**: OpenAI GPT-4
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-fitness-meal-planner
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with your credentials:

```env
# Firebase Configuration (Client)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (Server-side)
FIREBASE_CLIENT_EMAIL=your_firebase_admin_client_email
FIREBASE_PRIVATE_KEY=your_firebase_admin_private_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google

3. Create Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules:

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
    
    match /progress/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

4. Download Firebase Admin SDK credentials:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Use the credentials in your `.env` file

### OpenAI Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env` file

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
├── app/
│   ├── api/                    # API routes
│   │   ├── chat/              # AI chat endpoint
│   │   ├── generate-meals/    # Meal plan generation
│   │   └── generate-workout/  # Workout plan generation
│   ├── dashboard/             # Main dashboard pages
│   │   ├── coach/            # AI coach chat
│   │   ├── meals/            # Meal plans
│   │   ├── progress/         # Progress tracking
│   │   └── workouts/         # Workout plans
│   ├── login/                # Login page
│   ├── signup/               # Signup page
│   ├── onboarding/           # Onboarding flow
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Landing page
│   └── globals.css           # Global styles
├── components/
│   └── dashboard/
│       └── Navigation.tsx    # Dashboard navigation
├── lib/
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication context
│   └── firebase/
│       ├── config.ts         # Firebase client config
│       └── admin.ts          # Firebase admin config
└── public/                   # Static assets
```

## Key Features Implementation

### Authentication Flow
1. User signs up with email/password or Google
2. Profile created in Firestore
3. Redirected to onboarding
4. After onboarding, access to dashboard

### AI Workout Generation
- Uses GPT-4 to create personalized workout plans
- Considers user's fitness level and goals
- Generates 5-7 exercises with sets, reps, and rest periods
- Stores in Firestore for later access

### AI Meal Planning
- Generates daily meal plans with macros
- Respects dietary preferences
- Provides ingredients and instructions
- Calculates total daily calories

### Interactive Workout Player
- Real-time set tracking
- Automatic rest timer
- Exercise progression
- Session logging for progress tracking

### AI Coach Chat
- Context-aware conversations
- Personalized based on user profile
- Conversational history maintained
- Provides fitness and nutrition advice

## Customization

### Styling
- Modify `tailwind.config.ts` for custom theme colors
- Update `app/globals.css` for global styles

### AI Prompts
- Edit API route files to customize AI behavior
- Adjust temperature and model parameters in OpenAI calls

### Onboarding Flow
- Modify `app/onboarding/page.tsx` to add/remove steps
- Update goal and preference options

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Google Cloud Run
- Self-hosted

## Security Considerations

- Never commit `.env` file
- Use Firebase security rules for data access
- Validate user input on both client and server
- Keep API keys secure
- Implement rate limiting for API routes

## Performance Optimization

- Uses Next.js App Router for optimal performance
- Image optimization with Next.js Image component
- Code splitting and lazy loading
- Efficient state management with React Context

## Future Enhancements

- [ ] Social features (share workouts, meal plans)
- [ ] Integration with fitness trackers
- [ ] Video exercise demonstrations
- [ ] Meal prep shopping lists
- [ ] Calendar integration
- [ ] Push notifications for workouts
- [ ] Progressive Web App (PWA) support
- [ ] Multi-language support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- OpenAI for GPT-4 API
- Firebase for backend services
- Next.js team for the amazing framework
- All open-source contributors
