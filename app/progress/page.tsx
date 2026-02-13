'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { ProgressEntry } from '@/types';
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TrendingUp, TrendingDown, Calendar, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export default function ProgressPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newEntry, setNewEntry] = useState({
    weight: userProfile?.weight || 70,
    bodyFat: 0,
    chest: 0,
    waist: 0,
    hips: 0,
    arms: 0,
    thighs: 0,
    notes: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchProgressEntries = async () => {
      if (!user) return;

      try {
        const entriesRef = collection(db, 'progressEntries');
        const q = query(
          entriesRef,
          where('userId', '==', user.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const entries = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
        })) as ProgressEntry[];

        setProgressEntries(entries);
      } catch (error) {
        console.error('Error fetching progress entries:', error);
      } finally {
        setLoadingEntries(false);
      }
    };

    fetchProgressEntries();
  }, [user]);

  const handleAddEntry = async () => {
    if (!user) return;

    try {
      const entry: Omit<ProgressEntry, 'id'> = {
        userId: user.uid,
        date: new Date(),
        weight: newEntry.weight,
        bodyFat: newEntry.bodyFat || undefined,
        measurements: {
          chest: newEntry.chest || undefined,
          waist: newEntry.waist || undefined,
          hips: newEntry.hips || undefined,
          arms: newEntry.arms || undefined,
          thighs: newEntry.thighs || undefined,
        },
        notes: newEntry.notes || undefined,
      };

      const docRef = await addDoc(collection(db, 'progressEntries'), entry);
      
      setProgressEntries([
        { id: docRef.id, ...entry },
        ...progressEntries,
      ]);
      setShowAddEntry(false);
      setNewEntry({
        weight: userProfile?.weight || 70,
        bodyFat: 0,
        chest: 0,
        waist: 0,
        hips: 0,
        arms: 0,
        thighs: 0,
        notes: '',
      });
    } catch (error) {
      console.error('Error adding progress entry:', error);
      alert('Failed to add progress entry.');
    }
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = progressEntries
    .slice()
    .reverse()
    .map(entry => ({
      date: format(entry.date, 'MMM dd'),
      weight: entry.weight,
    }));

  const latestEntry = progressEntries[0];
  const previousEntry = progressEntries[1];
  const weightChange = latestEntry && previousEntry
    ? latestEntry.weight - previousEntry.weight
    : 0;

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
                Progress Tracking
              </h1>
              <p className="text-gray-600">
                Track your fitness journey and see your improvements
              </p>
            </div>
            <Button
              onClick={() => setShowAddEntry(!showAddEntry)}
              className="flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Entry
            </Button>
          </div>

          {showAddEntry && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  New Progress Entry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <Input
                    label="Weight (kg)"
                    type="number"
                    value={newEntry.weight}
                    onChange={(e) => setNewEntry({ ...newEntry, weight: parseFloat(e.target.value) })}
                  />
                  <Input
                    label="Body Fat %"
                    type="number"
                    value={newEntry.bodyFat}
                    onChange={(e) => setNewEntry({ ...newEntry, bodyFat: parseFloat(e.target.value) })}
                  />
                  <Input
                    label="Chest (cm)"
                    type="number"
                    value={newEntry.chest}
                    onChange={(e) => setNewEntry({ ...newEntry, chest: parseFloat(e.target.value) })}
                  />
                  <Input
                    label="Waist (cm)"
                    type="number"
                    value={newEntry.waist}
                    onChange={(e) => setNewEntry({ ...newEntry, waist: parseFloat(e.target.value) })}
                  />
                  <Input
                    label="Hips (cm)"
                    type="number"
                    value={newEntry.hips}
                    onChange={(e) => setNewEntry({ ...newEntry, hips: parseFloat(e.target.value) })}
                  />
                  <Input
                    label="Arms (cm)"
                    type="number"
                    value={newEntry.arms}
                    onChange={(e) => setNewEntry({ ...newEntry, arms: parseFloat(e.target.value) })}
                  />
                </div>
                <Input
                  label="Notes"
                  type="text"
                  value={newEntry.notes}
                  onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                  className="mb-4"
                />
                <div className="flex gap-4">
                  <Button onClick={handleAddEntry}>Save Entry</Button>
                  <Button variant="outline" onClick={() => setShowAddEntry(false)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Weight</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {latestEntry?.weight || userProfile.weight}kg
                  </p>
                  {weightChange !== 0 && (
                    <div className={`flex items-center mt-2 ${weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {weightChange < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
                      <span className="text-sm font-medium">
                        {Math.abs(weightChange).toFixed(1)}kg
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Target Weight</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {userProfile.targetWeight}kg
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    {Math.abs((latestEntry?.weight || userProfile.weight) - (userProfile.targetWeight || 0)).toFixed(1)}kg to go
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Entries</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {progressEntries.length}
                  </p>
                  <div className="flex items-center mt-2 text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {latestEntry ? format(latestEntry.date, 'MMM dd, yyyy') : 'No entries'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {loadingEntries ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : progressEntries.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No progress entries yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your progress by adding your first entry
                </p>
                <Button onClick={() => setShowAddEntry(true)}>
                  Add First Entry
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Weight Progress
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">History</h3>
                {progressEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            {format(entry.date, 'MMMM dd, yyyy')}
                          </p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            <span>Weight: <strong>{entry.weight}kg</strong></span>
                            {entry.bodyFat && <span>Body Fat: <strong>{entry.bodyFat}%</strong></span>}
                            {entry.measurements?.waist && <span>Waist: <strong>{entry.measurements.waist}cm</strong></span>}
                          </div>
                          {entry.notes && (
                            <p className="mt-2 text-sm text-gray-600 italic">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
