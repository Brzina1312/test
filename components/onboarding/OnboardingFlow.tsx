'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

const steps = [
  {
    id: 'basics',
    title: 'Tell us about yourself',
    fields: ['age', 'gender', 'height', 'weight'],
  },
  {
    id: 'goals',
    title: 'What are your fitness goals?',
    fields: ['fitnessGoal', 'targetWeight', 'activityLevel'],
  },
  {
    id: 'preferences',
    title: 'Any dietary restrictions?',
    fields: ['dietaryRestrictions'],
  },
];

export default function OnboardingFlow() {
  const { updateUserProfile, userProfile } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: userProfile?.age || 25,
    gender: userProfile?.gender || 'other',
    height: userProfile?.height || 170,
    weight: userProfile?.weight || 70,
    fitnessGoal: userProfile?.fitnessGoal || 'maintain',
    targetWeight: userProfile?.targetWeight || 70,
    activityLevel: userProfile?.activityLevel || 'moderate',
    dietaryRestrictions: userProfile?.dietaryRestrictions || [],
  });

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setLoading(true);
      try {
        await updateUserProfile(formData);
        router.push('/dashboard');
      } catch (error) {
        console.error('Error updating profile:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                } ${index > 0 ? 'ml-2' : ''}`}
              />
            ))}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === 0 && (
              <div className="space-y-4">
                <Input
                  label="Age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <div className="flex gap-4">
                    {['male', 'female', 'other'].map((gender) => (
                      <button
                        key={gender}
                        onClick={() => updateFormData('gender', gender)}
                        className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                          formData.gender === gender
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Height (cm)"
                    type="number"
                    value={formData.height}
                    onChange={(e) => updateFormData('height', parseInt(e.target.value))}
                  />
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => updateFormData('weight', parseInt(e.target.value))}
                  />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fitness Goal
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'lose_weight', label: 'Lose Weight' },
                      { value: 'gain_muscle', label: 'Gain Muscle' },
                      { value: 'maintain', label: 'Maintain Weight' },
                      { value: 'improve_endurance', label: 'Improve Endurance' },
                    ].map((goal) => (
                      <button
                        key={goal.value}
                        onClick={() => updateFormData('fitnessGoal', goal.value)}
                        className={`w-full py-3 rounded-lg font-medium transition-all ${
                          formData.fitnessGoal === goal.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Input
                  label="Target Weight (kg)"
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => updateFormData('targetWeight', parseInt(e.target.value))}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Level
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => updateFormData('activityLevel', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sedentary">Sedentary (little or no exercise)</option>
                    <option value="light">Light (exercise 1-3 days/week)</option>
                    <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                    <option value="active">Active (exercise 6-7 days/week)</option>
                    <option value="very_active">Very Active (intense exercise daily)</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Select any dietary restrictions that apply to you:
                </p>
                <div className="space-y-2">
                  {[
                    'Vegetarian',
                    'Vegan',
                    'Gluten-Free',
                    'Dairy-Free',
                    'Nut Allergy',
                    'Pescatarian',
                    'Halal',
                    'Kosher',
                  ].map((restriction) => (
                    <label
                      key={restriction}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.dietaryRestrictions.includes(restriction)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFormData('dietaryRestrictions', [
                              ...formData.dietaryRestrictions,
                              restriction,
                            ]);
                          } else {
                            updateFormData(
                              'dietaryRestrictions',
                              formData.dietaryRestrictions.filter((r) => r !== restriction)
                            );
                          }
                        }}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{restriction}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 mt-8">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            loading={loading}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
