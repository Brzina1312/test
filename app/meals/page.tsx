'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MealPlan, Meal } from '@/types';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UtensilsCrossed, Clock, Flame, ChefHat } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MealsPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchMealPlans = async () => {
      if (!user) return;

      try {
        const plansRef = collection(db, 'mealPlans');
        const q = query(plansRef, where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        
        const plans = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as MealPlan[];

        setMealPlans(plans);
        if (plans.length > 0) {
          setSelectedPlan(plans[0]);
        }
      } catch (error) {
        console.error('Error fetching meal plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchMealPlans();
  }, [user]);

  const generateMealPlan = async () => {
    if (!user || !userProfile) return;

    setGenerating(true);
    try {
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userProfile }),
      });

      const data = await response.json();

      const newPlan: Omit<MealPlan, 'id'> = {
        userId: user.uid,
        name: data.name,
        description: data.description,
        dailyCalories: data.dailyCalories,
        dailyProtein: data.dailyProtein,
        dailyCarbs: data.dailyCarbs,
        dailyFat: data.dailyFat,
        meals: {
          breakfast: data.meals.breakfast.map((m: any, i: number) => ({
            id: `breakfast-${Date.now()}-${i}`,
            ...m,
          })),
          lunch: data.meals.lunch.map((m: any, i: number) => ({
            id: `lunch-${Date.now()}-${i}`,
            ...m,
          })),
          dinner: data.meals.dinner.map((m: any, i: number) => ({
            id: `dinner-${Date.now()}-${i}`,
            ...m,
          })),
          snacks: data.meals.snacks.map((m: any, i: number) => ({
            id: `snack-${Date.now()}-${i}`,
            ...m,
          })),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'mealPlans'), newPlan);
      
      const planWithId = { id: docRef.id, ...newPlan };
      setMealPlans([planWithId, ...mealPlans]);
      setSelectedPlan(planWithId);
    } catch (error) {
      console.error('Error generating meal plan:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const MealCard = ({ meal, type }: { meal: Meal; type: string }) => (
    <Card hover className="h-full">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-xs font-semibold text-blue-600 uppercase">{type}</span>
          <h4 className="text-lg font-bold text-gray-900">{meal.name}</h4>
        </div>
        <ChefHat className="h-6 w-6 text-gray-400" />
      </div>
      
      <p className="text-sm text-gray-600 mb-4">{meal.description}</p>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-blue-50 rounded-lg p-2 text-center">
          <Flame className="h-4 w-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-gray-600">Calories</p>
          <p className="text-sm font-bold text-gray-900">{meal.calories}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">Protein</p>
          <p className="text-sm font-bold text-gray-900">{meal.protein}g</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">Carbs</p>
          <p className="text-sm font-bold text-gray-900">{meal.carbs}g</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">Fat</p>
          <p className="text-sm font-bold text-gray-900">{meal.fat}g</p>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Clock className="h-4 w-4 mr-1" />
          {meal.prepTime} min prep
        </div>
        
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
            View Recipe
          </summary>
          <div className="space-y-3 mt-2">
            <div>
              <p className="font-semibold text-gray-700 mb-1">Ingredients:</p>
              <ul className="list-disc list-inside text-gray-600">
                {meal.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1">Instructions:</p>
              <ol className="list-decimal list-inside text-gray-600">
                {meal.instructions.map((inst, i) => (
                  <li key={i}>{inst}</li>
                ))}
              </ol>
            </div>
          </div>
        </details>
      </div>
    </Card>
  );

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
                Meal Plans
              </h1>
              <p className="text-gray-600">
                AI-generated meal plans based on your nutritional needs
              </p>
            </div>
            <Button
              onClick={generateMealPlan}
              loading={generating}
              className="flex items-center gap-2"
            >
              <UtensilsCrossed className="h-5 w-5" />
              Generate New Plan
            </Button>
          </div>

          {loadingPlans ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : mealPlans.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <UtensilsCrossed className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No meal plans yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Generate your first AI-powered meal plan to get started
                </p>
                <Button
                  onClick={generateMealPlan}
                  loading={generating}
                >
                  Generate Your First Plan
                </Button>
              </div>
            </Card>
          ) : selectedPlan ? (
            <>
              <Card className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedPlan.name}
                    </h2>
                    <p className="text-gray-600">{selectedPlan.description}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Daily Calories</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedPlan.dailyCalories}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Protein</p>
                      <p className="text-2xl font-bold text-green-600">
                        {selectedPlan.dailyProtein}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Carbs</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {selectedPlan.dailyCarbs}g
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Fat</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {selectedPlan.dailyFat}g
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Breakfast</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPlan.meals.breakfast.map((meal) => (
                      <MealCard key={meal.id} meal={meal} type="Breakfast" />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Lunch</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPlan.meals.lunch.map((meal) => (
                      <MealCard key={meal.id} meal={meal} type="Lunch" />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Dinner</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPlan.meals.dinner.map((meal) => (
                      <MealCard key={meal.id} meal={meal} type="Dinner" />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Snacks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedPlan.meals.snacks.map((meal) => (
                      <MealCard key={meal.id} meal={meal} type="Snack" />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}
