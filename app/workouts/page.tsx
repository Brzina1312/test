'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { WorkoutPlan } from '@/types';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Dumbbell, Clock, TrendingUp, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WorkoutsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      if (!user) return;

      try {
        const plansRef = collection(db, 'workoutPlans');
        const q = query(plansRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const plans = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as WorkoutPlan[];

        setWorkoutPlans(plans);
      } catch (error) {
        console.error('Error fetching workout plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchWorkoutPlans();
  }, [user]);

  const generateWorkoutPlan = async () => {
    if (!user || !userProfile) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProfile }),
      });

      const data = await response.json();

      const newPlan: Omit<WorkoutPlan, 'id'> = {
        userId: user.uid,
        name: data.name,
        description: data.description,
        frequency: data.frequency,
        duration: data.duration,
        exercises: data.exercises.map((ex: any, index: number) => ({
          id: `ex-${Date.now()}-${index}`,
          ...ex,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'workoutPlans'), newPlan);
      
      setWorkoutPlans([
        { id: docRef.id, ...newPlan },
        ...workoutPlans,
      ]);
    } catch (error) {
      console.error('Error generating workout plan:', error);
      alert('Failed to generate workout plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Workout Plans
              </h1>
              <p className="text-gray-600">
                AI-powered workout plans tailored to your goals
              </p>
            </div>
            <Button
              onClick={generateWorkoutPlan}
              loading={generating}
              className="flex items-center gap-2"
            >
              <Dumbbell className="h-5 w-5" />
              Generate New Plan
            </Button>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : workoutPlans.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <Dumbbell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No workout plans yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate your first AI-powered workout plan to get started
                </p>
                <Button
                  onClick={generateWorkoutPlan}
                  loading={generating}
                >
                  Generate Your First Plan
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workoutPlans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card hover>
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-gray-600">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {plan.duration} min
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        {plan.frequency}x per week
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Dumbbell className="h-4 w-4 mr-1" />
                        {plan.exercises.length} exercises
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <p className="text-sm font-semibold text-gray-700">Exercises:</p>
                      <div className="space-y-1">
                        {plan.exercises.slice(0, 3).map((exercise) => (
                          <div key={exercise.id} className="text-sm text-gray-600">
                            • {exercise.name} ({exercise.sets} sets × {exercise.reps})
                          </div>
                        ))}
                        {plan.exercises.length > 3 && (
                          <div className="text-sm text-gray-500">
                            + {plan.exercises.length - 3} more exercises
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      fullWidth
                      onClick={() => router.push(`/workouts/${plan.id}`)}
                      className="flex items-center justify-center gap-2"
                    >
                      <Play className="h-5 w-5" />
                      Start Workout
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
