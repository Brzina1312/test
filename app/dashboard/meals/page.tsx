"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Plus, Apple, Loader2, Coffee, Utensils, Sun, Moon } from "lucide-react";
import toast from "react-hot-toast";

interface Meal {
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  ingredients: string[];
  instructions?: string;
}

interface MealPlan {
  id: string;
  date: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks?: Meal[];
  };
  totalCalories: number;
  createdAt: string;
}

const MealIcon = ({ mealType }: { mealType: string }) => {
  switch (mealType) {
    case "breakfast":
      return <Coffee className="w-6 h-6" />;
    case "lunch":
      return <Sun className="w-6 h-6" />;
    case "dinner":
      return <Moon className="w-6 h-6" />;
    default:
      return <Apple className="w-6 h-6" />;
  }
};

export default function MealsPage() {
  const { user, userProfile } = useAuth();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);

  useEffect(() => {
    fetchMealPlans();
  }, [user]);

  const fetchMealPlans = async () => {
    if (!user) return;

    try {
      const mealsRef = collection(db, "mealPlans");
      const q = query(
        mealsRef,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const plans = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MealPlan[];
      setMealPlans(plans);
      if (plans.length > 0) {
        setSelectedPlan(plans[0]);
      }
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async () => {
    setGenerating(true);
    try {
      const response = await fetch("/api/generate-meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid,
          dietaryPreferences: userProfile?.dietaryPreferences,
          goals: userProfile?.goals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate meal plan");
      }

      toast.success("Meal plan generated!");
      fetchMealPlans();
    } catch (error) {
      toast.error("Failed to generate meal plan");
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meal Plans</h1>
          <p className="text-gray-600">AI-powered personalized nutrition plans</p>
        </div>
        <button
          onClick={generateMealPlan}
          disabled={generating}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
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

      {mealPlans.length === 0 ? (
        <div className="text-center py-16">
          <Apple className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No meal plans yet
          </h3>
          <p className="text-gray-500 mb-6">
            Generate your first AI-powered meal plan
          </p>
          <button
            onClick={generateMealPlan}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Generate Meal Plan
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Your Plans</h3>
              <div className="space-y-2">
                {mealPlans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedPlan?.id === plan.id
                        ? "bg-green-50 border-2 border-green-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {new Date(plan.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {plan.totalCalories} cal
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {selectedPlan && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Daily Meal Plan
                  </h2>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {selectedPlan.totalCalories}
                    </div>
                    <div className="text-sm text-gray-600">Total Calories</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(selectedPlan.meals).map(([mealType, meal]) => {
                  if (mealType === "snacks" && Array.isArray(meal)) {
                    return meal.map((snack, idx) => (
                      <MealCard
                        key={`snack-${idx}`}
                        mealType="snack"
                        meal={snack}
                      />
                    ));
                  }
                  return (
                    <MealCard
                      key={mealType}
                      mealType={mealType}
                      meal={meal as Meal}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MealCard({ mealType, meal }: { mealType: string; meal: Meal }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow">
      <div
        className="p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-100 rounded-xl text-green-600">
            <MealIcon mealType={mealType} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 capitalize">
              {mealType}
            </h3>
            <p className="text-gray-600">{meal.time}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {meal.calories}
            </div>
            <div className="text-sm text-gray-600">cal</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="font-bold text-blue-600">{meal.protein}g</div>
            <div className="text-xs text-gray-600">Protein</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="font-bold text-orange-600">{meal.carbs}g</div>
            <div className="text-xs text-gray-600">Carbs</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="font-bold text-purple-600">{meal.fats}g</div>
            <div className="text-xs text-gray-600">Fats</div>
          </div>
        </div>

        <h4 className="font-semibold text-gray-900 mb-2">{meal.name}</h4>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-2">Ingredients:</h5>
            <ul className="space-y-1 mb-4">
              {meal.ingredients.map((ingredient, idx) => (
                <li key={idx} className="text-gray-700 text-sm">
                  • {ingredient}
                </li>
              ))}
            </ul>
            {meal.instructions && (
              <>
                <h5 className="font-semibold text-gray-900 mb-2">
                  Instructions:
                </h5>
                <p className="text-gray-700 text-sm">{meal.instructions}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
