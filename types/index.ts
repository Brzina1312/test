export interface UserProfile {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  fitnessGoal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryRestrictions: string[];
  targetWeight?: number;
  weeklyGoal?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sets: number;
  reps: string;
  duration?: number;
  restTime: number;
  instructions: string[];
  videoUrl?: string;
  gifUrl?: string;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  frequency: number;
  duration: number;
  exercises: Exercise[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  servings: number;
  imageUrl?: string;
}

export interface MealPlan {
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

export interface WorkoutSession {
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

export interface ProgressEntry {
  id: string;
  userId: string;
  date: Date;
  weight: number;
  bodyFat?: number;
  measurements?: {
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
  };
  notes?: string;
  photos?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}
