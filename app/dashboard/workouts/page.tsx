"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Plus, Play, Loader2, Dumbbell } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
}

interface WorkoutPlan {
  id: string;
  name: string;
  exercises: Exercise[];
  duration: string;
  difficulty: string;
  createdAt: string;
}

export default function WorkoutsPage() {
  const { user, userProfile } = useAuth();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchWorkoutPlans();
  }, [user]);

  const fetchWorkoutPlans = async () => {
    if (!user) return;

    try {
      const workoutsRef = collection(db, "workoutPlans");
      const q = query(
        workoutsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const plans = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkoutPlan[];
      setWorkoutPlans(plans);
    } catch (error) {
      console.error("Error fetching workout plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateWorkoutPlan = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/generate-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          goals: userProfile?.goals,
          fitnessLevel: userProfile?.fitnessLevel,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate workout plan");
      }

      toast.success("Workout plan generated!");
      fetchWorkoutPlans();
    } catch (error) {
      toast.error("Failed to generate workout plan");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout Plans</h1>
          <p className="text-gray-600">AI-powered personalized workout routines</p>
        </div>
        <button
          onClick={generateWorkoutPlan}
          disabled={generating}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Generate New Plan
            </>
          )}
        </button>
      </div>

      {workoutPlans.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No workout plans yet
          </h3>
          <p className="text-gray-500 mb-6">
            Generate your first AI-powered workout plan
          </p>
          <button
            onClick={generateWorkoutPlan}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Generate Workout Plan
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workoutPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {plan.difficulty}
                    </span>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                      {plan.duration}
                    </span>
                  </div>
                </div>
                <Dumbbell className="w-8 h-8 text-primary-600" />
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {plan.exercises.length} exercises
                </p>
                <ul className="space-y-1">
                  {plan.exercises.slice(0, 3).map((exercise, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {exercise.name}
                    </li>
                  ))}
                  {plan.exercises.length > 3 && (
                    <li className="text-sm text-gray-500">
                      + {plan.exercises.length - 3} more
                    </li>
                  )}
                </ul>
              </div>

              <Link
                href={`/dashboard/workouts/${plan.id}`}
                className="flex items-center justify-center gap-2 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition"
              >
                <Play className="w-5 h-5" />
                Start Workout
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
