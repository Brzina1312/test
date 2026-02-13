"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/lib/contexts/AuthContext";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Check,
  ArrowLeft,
  Timer,
  Dumbbell,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

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
}

export default function WorkoutPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [workout, setWorkout] = useState<WorkoutPlan | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [workoutCompleted, setWorkoutCompleted] = useState(false);

  useEffect(() => {
    fetchWorkout();
  }, [params.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResting && restTimeLeft > 0) {
      interval = setInterval(() => {
        setRestTimeLeft((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimeLeft]);

  const fetchWorkout = async () => {
    try {
      const docRef = doc(db, "workoutPlans", params.id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setWorkout({ id: docSnap.id, ...docSnap.data() } as WorkoutPlan);
      }
    } catch (error) {
      console.error("Error fetching workout:", error);
      toast.error("Failed to load workout");
    } finally {
      setLoading(false);
    }
  };

  const handleNextSet = () => {
    if (!workout) return;

    const currentExercise = workout.exercises[currentExerciseIndex];
    
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      const restSeconds = parseInt(currentExercise.rest) || 60;
      setRestTimeLeft(restSeconds);
      setIsResting(true);
    } else {
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    if (!workout) return;

    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setIsResting(false);
    } else {
      completeWorkout();
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(currentExerciseIndex - 1);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  const skipRest = () => {
    setIsResting(false);
    setRestTimeLeft(0);
  };

  const completeWorkout = async () => {
    if (!user || !workout) return;

    try {
      await addDoc(collection(db, "workoutSessions"), {
        userId: user.uid,
        workoutPlanId: workout.id,
        workoutName: workout.name,
        completedAt: new Date().toISOString(),
        duration: workout.duration,
      });

      setWorkoutCompleted(true);
      toast.success("Workout completed! Great job!");
    } catch (error) {
      console.error("Error saving workout session:", error);
      toast.error("Failed to save workout session");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Workout not found</p>
          <button
            onClick={() => router.push("/dashboard/workouts")}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Back to Workouts
          </button>
        </div>
      </div>
    );
  }

  if (workoutCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Check className="w-24 h-24 text-green-600 mx-auto mb-6" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Workout Complete!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Amazing work! You&apos;ve completed {workout.name}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push("/dashboard/workouts")}
              className="px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition"
            >
              Back to Workouts
            </button>
            <button
              onClick={() => router.push("/dashboard/progress")}
              className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition"
            >
              View Progress
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentExercise = workout.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / workout.exercises.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/dashboard/workouts")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Workouts
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {workout.name}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Exercise {currentExerciseIndex + 1} of {workout.exercises.length}</span>
              <span>•</span>
              <span>Set {currentSet} of {currentExercise.sets}</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isResting ? (
              <motion.div
                key="rest"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center py-12"
              >
                <Timer className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Rest Time</h2>
                <div className="text-6xl font-bold text-blue-600 mb-8">
                  {restTimeLeft}s
                </div>
                <button
                  onClick={skipRest}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition"
                >
                  Skip Rest
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="exercise"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-8">
                  <Dumbbell className="w-20 h-20 text-primary-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {currentExercise.name}
                  </h2>
                  <div className="flex justify-center gap-8 mb-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary-600">
                        {currentExercise.sets}
                      </div>
                      <div className="text-sm text-gray-600">Sets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary-600">
                        {currentExercise.reps}
                      </div>
                      <div className="text-sm text-gray-600">Reps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary-600">
                        {currentExercise.rest}s
                      </div>
                      <div className="text-sm text-gray-600">Rest</div>
                    </div>
                  </div>
                  {currentExercise.notes && (
                    <div className="bg-blue-50 rounded-xl p-4 max-w-md mx-auto">
                      <p className="text-sm text-gray-700">{currentExercise.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handlePreviousExercise}
                    disabled={currentExerciseIndex === 0}
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <SkipBack className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextSet}
                    className="flex-1 max-w-xs flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 rounded-xl transition"
                  >
                    {currentSet < currentExercise.sets ? (
                      <>
                        <Check className="w-6 h-6" />
                        Complete Set
                      </>
                    ) : (
                      <>
                        <SkipForward className="w-6 h-6" />
                        Next Exercise
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleNextExercise}
                    disabled={currentExerciseIndex === workout.exercises.length - 1}
                    className="p-4 bg-gray-100 hover:bg-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <SkipForward className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
