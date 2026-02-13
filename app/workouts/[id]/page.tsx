'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WorkoutPlan, Exercise } from '@/types';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Play, Pause, SkipForward, CheckCircle, ArrowLeft, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WorkoutPlayerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const workoutId = params.id as string;

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchWorkoutPlan = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'workoutPlans', workoutId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setWorkoutPlan({
            id: docSnap.id,
            ...docSnap.data(),
            createdAt: docSnap.data().createdAt?.toDate(),
            updatedAt: docSnap.data().updatedAt?.toDate(),
          } as WorkoutPlan);
        } else {
          router.push('/workouts');
        }
      } catch (error) {
        console.error('Error fetching workout plan:', error);
      }
    };

    fetchWorkoutPlan();
  }, [user, workoutId, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isResting && !isPaused && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 1) {
            setIsResting(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isResting, isPaused, restTimer]);

  if (!workoutPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentExercise = workoutPlan.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / workoutPlan.exercises.length) * 100;

  const handleCompleteSet = () => {
    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
      setRestTimer(currentExercise.restTime);
      setIsResting(true);
    } else {
      setCompletedExercises(new Set([...completedExercises, currentExercise.id]));
      handleNextExercise();
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < workoutPlan.exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setIsResting(false);
      setRestTimer(0);
    } else {
      handleCompleteWorkout();
    }
  };

  const handleCompleteWorkout = async () => {
    if (!user) return;

    try {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000 / 60);
      const caloriesBurned = Math.round(duration * 5);

      await addDoc(collection(db, 'workoutSessions'), {
        userId: user.uid,
        workoutPlanId: workoutId,
        date: new Date(),
        duration,
        caloriesBurned,
        exercises: workoutPlan.exercises.map(ex => ({
          exerciseId: ex.id,
          sets: ex.sets,
          reps: [],
          weight: [],
          completed: completedExercises.has(ex.id) || ex.id === currentExercise.id,
        })),
        rating: 5,
      });

      router.push('/dashboard?workout=complete');
    } catch (error) {
      console.error('Error saving workout session:', error);
      alert('Failed to save workout session.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/workouts')}
              className="mb-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Workouts
            </Button>
            
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Exercise {currentExerciseIndex + 1} of {workoutPlan.exercises.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isResting ? (
              <motion.div
                key="rest"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="text-center">
                  <Timer className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Rest Time</h2>
                  <p className="text-6xl font-bold text-blue-600 mb-6">
                    {formatTime(restTimer)}
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button
                      variant="outline"
                      onClick={() => setIsPaused(!isPaused)}
                    >
                      {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button onClick={() => setIsResting(false)}>
                      Skip Rest
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key={currentExercise.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                          {currentExercise.name}
                        </h2>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                            {currentExercise.difficulty}
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                            {currentExercise.equipment}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-8 mb-6 text-white text-center">
                      <p className="text-sm mb-2">Set {currentSet} of {currentExercise.sets}</p>
                      <p className="text-5xl font-bold">{currentExercise.reps}</p>
                      <p className="text-sm mt-2">repetitions</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Target Muscles</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentExercise.targetMuscles.map((muscle, index) => (
                          <span
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                          >
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2">Instructions</h3>
                      <ol className="space-y-2">
                        {currentExercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex text-gray-700">
                            <span className="font-semibold mr-2">{index + 1}.</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      variant="outline"
                      onClick={handleNextExercise}
                      className="flex-1"
                    >
                      <SkipForward className="h-5 w-5 mr-2" />
                      Skip Exercise
                    </Button>
                    <Button
                      onClick={handleCompleteSet}
                      className="flex-1"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Complete Set
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
