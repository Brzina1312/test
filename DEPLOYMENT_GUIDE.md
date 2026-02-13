# FitAI Deployment Guide

## Prerequisites

Before deploying FitAI, ensure you have:

1. **Node.js 18+** installed
2. **Firebase Project** with the following enabled:
   - Firestore Database
   - Authentication (Email/Password + Google OAuth)
3. **OpenAI API Key** with access to GPT-4o-mini

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd fitai
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Fill in your credentials in `.env.local`:

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

### 3. Firebase Setup

#### Enable Authentication

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication** → **Sign-in method**
4. Enable:
   - **Email/Password** provider
   - **Google** provider (configure OAuth consent screen)

#### Enable Firestore Database

1. Navigate to **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your preferred region

#### Configure Firestore Security Rules

In the Firebase Console, go to **Firestore Database** → **Rules** and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Workout plans - users can only access their own plans
    match /workoutPlans/{planId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Meal plans - users can only access their own plans
    match /mealPlans/{planId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Workout sessions - users can only access their own sessions
    match /workoutSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Progress entries - users can only access their own progress
    match /progressEntries/{entryId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 4. OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create an API key
3. Ensure you have credits/billing enabled
4. Add the API key to your `.env.local` file

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Production Deployment

### Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables**:
   - Go to your Vercel project dashboard
   - Navigate to **Settings** → **Environment Variables**
   - Add all variables from `.env.local`

4. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Other Platforms

#### Netlify

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables in Netlify dashboard

#### AWS Amplify

1. Connect your repository to AWS Amplify
2. Configure build settings:
   - Build command: `npm run build`
   - Build output directory: `.next`
3. Add environment variables in Amplify console

#### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t fitai .
docker run -p 3000:3000 --env-file .env.local fitai
```

## Post-Deployment Checklist

- [ ] Test user registration and login
- [ ] Verify Firebase authentication works
- [ ] Test onboarding flow
- [ ] Generate a workout plan
- [ ] Generate a meal plan
- [ ] Test workout player functionality
- [ ] Test progress tracking
- [ ] Verify AI coach chat works
- [ ] Test profile updates
- [ ] Check mobile responsiveness

## Monitoring and Maintenance

### Firebase Usage

Monitor your Firebase usage:
- Authentication: Check daily active users
- Firestore: Monitor reads/writes
- Stay within free tier limits or upgrade as needed

### OpenAI API Usage

Monitor OpenAI costs:
- Check API usage in OpenAI dashboard
- Set up usage alerts
- Consider implementing rate limiting for heavy usage

### Application Monitoring

Consider adding:
- Error tracking (e.g., Sentry)
- Analytics (e.g., Google Analytics, Mixpanel)
- Performance monitoring (e.g., Vercel Analytics)

## Troubleshooting

### Build Errors

**Issue**: Build fails with TypeScript errors
- **Solution**: Run `npm run build` locally to identify issues
- Check for missing type definitions
- Verify all imports are correct

### Firebase Connection Issues

**Issue**: Can't connect to Firebase
- **Solution**: Verify environment variables are set correctly
- Check Firebase project settings
- Ensure Firestore and Auth are enabled

### OpenAI API Errors

**Issue**: OpenAI requests failing
- **Solution**: Check API key is valid
- Verify you have credits/billing enabled
- Check API rate limits

### Authentication Issues

**Issue**: Users can't sign up/login
- **Solution**: Check Firebase Auth is enabled
- Verify auth providers are configured
- Check Firestore security rules

## Security Best Practices

1. **Never commit** `.env.local` or any files with secrets
2. **Use environment variables** for all sensitive data
3. **Keep dependencies updated**: Run `npm audit` regularly
4. **Implement rate limiting** to prevent abuse
5. **Monitor Firebase security rules** regularly
6. **Use HTTPS** in production (automatic with Vercel/Netlify)

## Scaling Considerations

As your user base grows:

1. **Database Optimization**:
   - Add indexes to frequently queried fields
   - Implement pagination for large data sets
   - Consider Firebase Functions for complex operations

2. **API Optimization**:
   - Implement caching for AI responses
   - Add rate limiting
   - Consider OpenAI streaming for better UX

3. **Performance**:
   - Enable CDN (automatic with Vercel)
   - Optimize images
   - Implement code splitting
   - Use React.lazy() for route-based splitting

## Support

For issues or questions:
- Check the [README.md](./README.md) for feature documentation
- Review [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical details
- Open an issue in the repository

## License

[Your License Here]
