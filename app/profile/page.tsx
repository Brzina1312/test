'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { User, Save } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { user, userProfile, updateUserProfile, loading } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: 0,
    gender: 'other' as 'male' | 'female' | 'other',
    height: 0,
    weight: 0,
    targetWeight: 0,
    fitnessGoal: 'maintain' as 'lose_weight' | 'gain_muscle' | 'maintain' | 'improve_endurance',
    activityLevel: 'moderate' as 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active',
    dietaryRestrictions: [] as string[],
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (userProfile) {
      setFormData({
        name: userProfile.name,
        age: userProfile.age,
        gender: userProfile.gender,
        height: userProfile.height,
        weight: userProfile.weight,
        targetWeight: userProfile.targetWeight || 0,
        fitnessGoal: userProfile.fitnessGoal,
        activityLevel: userProfile.activityLevel,
        dietaryRestrictions: userProfile.dietaryRestrictions,
      });
    }
  }, [user, userProfile, loading, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(formData);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Profile Settings
              </h1>
              <p className="text-gray-600">
                Manage your personal information and preferences
              </p>
            </div>
            {!editing ? (
              <Button onClick={() => setEditing(true)}>
                <User className="h-5 w-5 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} loading={saving}>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!editing}
                />
                <Input
                  label="Email"
                  value={user?.email || ''}
                  disabled
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    disabled={!editing}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      disabled={!editing}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Physical Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Height (cm)"
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) })}
                  disabled={!editing}
                />
                <Input
                  label="Current Weight (kg)"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
                  disabled={!editing}
                />
                <Input
                  label="Target Weight (kg)"
                  type="number"
                  value={formData.targetWeight}
                  onChange={(e) => setFormData({ ...formData, targetWeight: parseInt(e.target.value) })}
                  disabled={!editing}
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Fitness Goals
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Goal
                  </label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value as any })}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="lose_weight">Lose Weight</option>
                    <option value="gain_muscle">Gain Muscle</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="improve_endurance">Improve Endurance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Level
                  </label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as any })}
                    disabled={!editing}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="sedentary">Sedentary</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="active">Active</option>
                    <option value="very_active">Very Active</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Dietary Restrictions
              </h3>
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
                          setFormData({
                            ...formData,
                            dietaryRestrictions: [...formData.dietaryRestrictions, restriction],
                          });
                        } else {
                          setFormData({
                            ...formData,
                            dietaryRestrictions: formData.dietaryRestrictions.filter(
                              (r) => r !== restriction
                            ),
                          });
                        }
                      }}
                      disabled={!editing}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{restriction}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
