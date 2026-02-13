"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { ChevronRight, ChevronLeft, Target, Activity, Apple, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const GOALS = [
  "Weight Loss",
  "Muscle Gain",
  "Improve Endurance",
  "General Fitness",
  "Flexibility",
  "Athletic Performance",
];

const FITNESS_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const DIETARY_PREFERENCES = [
  "No Restrictions",
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Keto",
  "Paleo",
  "Gluten-Free",
  "Dairy-Free",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState("");
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateUserProfile } = useAuth();
  const router = useRouter();

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const toggleDietaryPreference = (pref: string) => {
    setDietaryPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const handleComplete = async () => {
    if (!selectedGoals.length || !fitnessLevel || !dietaryPreferences.length) {
      toast.error("Please complete all steps");
      return;
    }

    setLoading(true);
    try {
      await updateUserProfile({
        goals: selectedGoals,
        fitnessLevel,
        dietaryPreferences,
        onboardingCompleted: true,
      });
      toast.success("Profile setup complete!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedGoals.length > 0;
    if (step === 2) return !!fitnessLevel;
    if (step === 3) return dietaryPreferences.length > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900">Setup Your Profile</h1>
              <span className="text-sm text-gray-500">Step {step} of 3</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    s <= step ? "bg-primary-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {step === 1 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-primary-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">What are your goals?</h2>
                  <p className="text-gray-600">Select all that apply</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedGoals.includes(goal)
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium">{goal}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-8 h-8 text-primary-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">What's your fitness level?</h2>
                  <p className="text-gray-600">Be honest, we'll tailor your plan accordingly</p>
                </div>
              </div>
              <div className="space-y-3">
                {FITNESS_LEVELS.map((level) => (
                  <button
                    key={level}
                    onClick={() => setFitnessLevel(level)}
                    className={`w-full p-6 rounded-xl border-2 transition-all text-left ${
                      fitnessLevel === level
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-semibold text-lg">{level}</span>
                    <p className="text-sm mt-1 opacity-75">
                      {level === "Beginner" && "New to fitness or returning after a break"}
                      {level === "Intermediate" && "Regular exercise routine, comfortable with basics"}
                      {level === "Advanced" && "Experienced, looking for challenging workouts"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <Apple className="w-8 h-8 text-primary-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dietary preferences?</h2>
                  <p className="text-gray-600">Select all that apply</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DIETARY_PREFERENCES.map((pref) => (
                  <button
                    key={pref}
                    onClick={() => toggleDietaryPreference(pref)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      dietaryPreferences.includes(pref)
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium">{pref}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={!canProceed() || loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Complete Setup
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
