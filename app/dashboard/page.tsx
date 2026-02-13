'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Dumbbell, UtensilsCrossed, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Dashboard() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    workoutsThisWeek: 0,
    totalWorkouts: 0,
    currentStreak: 0,
    lastWorkout: null as Date | null,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (user && userProfile && userProfile.age === 0) {
      router.push('/onboarding');
    }
  }, [user, userProfile, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const workoutsRef = collection(db, 'workoutSessions');
        const q = query(
          workoutsRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc'),
          limit(30)
        );
        const querySnapshot = await getDocs(q);
        
        const workouts = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          date: doc.data().date.toDate(),
        }));

        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const workoutsThisWeek = workouts.filter(w => w.date >= weekAgo).length;

        setStats({
          workoutsThisWeek,
          totalWorkouts: workouts.length,
          currentStreak: 0,
          lastWorkout: workouts[0]?.date || null,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calculateBMI = () => {
    const heightInMeters = userProfile.height / 100;
    return (userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-yellow-600' };
    if (bmi < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmi < 30) return { text: 'Overweight', color: 'text-orange-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  const bmi = parseFloat(calculateBMI());
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {userProfile.name}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to crush your fitness goals today?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">BMI</p>
                  <p className="text-3xl font-bold">{bmi}</p>
                  <p className="text-sm mt-1">{bmiCategory.text}</p>
                </div>
                <TrendingUp className="h-12 w-12 text-blue-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm mb-1">Workouts This Week</p>
                  <p className="text-3xl font-bold">{stats.workoutsThisWeek}</p>
                  <p className="text-sm mt-1">Keep it up!</p>
                </div>
                <Dumbbell className="h-12 w-12 text-green-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Current Weight</p>
                  <p className="text-3xl font-bold">{userProfile.weight}kg</p>
                  <p className="text-sm mt-1">Target: {userProfile.targetWeight}kg</p>
                </div>
                <TrendingUp className="h-12 w-12 text-purple-200" />
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">Total Workouts</p>
                  <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
                  <p className="text-sm mt-1">All time</p>
                </div>
                <Sparkles className="h-12 w-12 text-orange-200" />
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card hover>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Generate Workout Plan
                  </h3>
                  <p className="text-gray-600">
                    Get a personalized workout plan based on your goals and fitness level.
                  </p>
                </div>
                <Dumbbell className="h-8 w-8 text-blue-600" />
              </div>
              <Button
                fullWidth
                onClick={() => router.push('/workouts')}
                className="mt-4"
              >
                Create Workout Plan
              </Button>
            </Card>

            <Card hover>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Generate Meal Plan
                  </h3>
                  <p className="text-gray-600">
                    Get a customized meal plan tailored to your dietary needs and goals.
                  </p>
                </div>
                <UtensilsCrossed className="h-8 w-8 text-green-600" />
              </div>
              <Button
                fullWidth
                onClick={() => router.push('/meals')}
                className="mt-4"
              >
                Create Meal Plan
              </Button>
            </Card>
          </div>

          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Your Fitness Goal
                </h3>
                <p className="text-gray-600 capitalize">
                  {userProfile.fitnessGoal.replace('_', ' ')}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-900 font-medium">
                💡 Pro Tip: Consistency is key! Try to work out at least {userProfile.activityLevel === 'sedentary' ? '2-3' : '4-5'} times per week to see the best results.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
