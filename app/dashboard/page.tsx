"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Dumbbell, Apple, TrendingUp, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";

interface WorkoutPlan {
  id: string;
  name: string;
  exercises: any[];
  createdAt: string;
}

interface MealPlan {
  id: string;
  meals: any[];
  createdAt: string;
}

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const workoutsRef = collection(db, "workoutPlans");
        const workoutsQuery = query(
          workoutsRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const workoutsSnap = await getDocs(workoutsQuery);
        if (!workoutsSnap.empty) {
          const doc = workoutsSnap.docs[0];
          setWorkoutPlan({ id: doc.id, ...doc.data() } as WorkoutPlan);
        }

        const mealsRef = collection(db, "mealPlans");
        const mealsQuery = query(
          mealsRef,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const mealsSnap = await getDocs(mealsQuery);
        if (!mealsSnap.empty) {
          const doc = mealsSnap.docs[0];
          setMealPlan({ id: doc.id, ...doc.data() } as MealPlan);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getGreeting()}, {userProfile?.displayName || "there"}!
        </h1>
        <p className="text-gray-600">Ready to crush your fitness goals today?</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard/workouts"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow"
        >
          <Dumbbell className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Workout Plans</h3>
          <p className="opacity-90">
            {workoutPlan
              ? "Continue your workout plan"
              : "Generate your personalized workout plan"}
          </p>
        </Link>

        <Link
          href="/dashboard/meals"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow"
        >
          <Apple className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Meal Plans</h3>
          <p className="opacity-90">
            {mealPlan
              ? "View your meal plan"
              : "Get AI-powered nutrition recommendations"}
          </p>
        </Link>

        <Link
          href="/dashboard/progress"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white hover:shadow-xl transition-shadow"
        >
          <TrendingUp className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-bold mb-2">Track Progress</h3>
          <p className="opacity-90">Monitor your fitness journey</p>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Quick Stats</h3>
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
              <span className="text-gray-700 font-medium">Fitness Level</span>
              <span className="text-blue-600 font-bold">
                {userProfile?.fitnessLevel || "Not set"}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
              <span className="text-gray-700 font-medium">Active Goals</span>
              <span className="text-green-600 font-bold">
                {userProfile?.goals?.length || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
              <span className="text-gray-700 font-medium">Workout Plans</span>
              <span className="text-purple-600 font-bold">
                {workoutPlan ? "1 Active" : "None"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-md p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8" />
            <h3 className="text-xl font-bold">AI Coach</h3>
          </div>
          <p className="mb-6 opacity-90">
            Get personalized advice, motivation, and answers to your fitness questions
            from your AI coach.
          </p>
          <Link
            href="/dashboard/coach"
            className="inline-block bg-white text-purple-600 font-semibold px-6 py-3 rounded-xl hover:bg-opacity-90 transition"
          >
            Chat with AI Coach
          </Link>
        </div>
      </div>

      {userProfile?.goals && userProfile.goals.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Goals</h3>
          <div className="flex flex-wrap gap-3">
            {userProfile.goals.map((goal, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-primary-50 text-primary-700 rounded-full font-medium"
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
