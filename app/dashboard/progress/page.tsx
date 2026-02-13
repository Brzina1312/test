"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { collection, query, where, getDocs, orderBy, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TrendingUp, Calendar, Award, Plus, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface WorkoutSession {
  id: string;
  workoutName: string;
  completedAt: string;
  duration: string;
}

interface ProgressEntry {
  id: string;
  date: string;
  weight?: number;
  notes?: string;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([]);
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const sessionsRef = collection(db, "workoutSessions");
      const sessionsQuery = query(
        sessionsRef,
        where("userId", "==", user.uid),
        orderBy("completedAt", "desc")
      );
      const sessionsSnap = await getDocs(sessionsQuery);
      const sessions = sessionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkoutSession[];
      setWorkoutSessions(sessions);

      const progressRef = collection(db, "progress");
      const progressQuery = query(
        progressRef,
        where("userId", "==", user.uid),
        orderBy("date", "desc")
      );
      const progressSnap = await getDocs(progressQuery);
      const progress = progressSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ProgressEntry[];
      setProgressEntries(progress);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProgress = async () => {
    if (!user || !weight) {
      toast.error("Please enter your weight");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "progress"), {
        userId: user.uid,
        date: new Date().toISOString(),
        weight: parseFloat(weight),
        notes,
      });

      toast.success("Progress recorded!");
      setWeight("");
      setNotes("");
      setShowAddProgress(false);
      fetchData();
    } catch (error) {
      toast.error("Failed to save progress");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const chartData = progressEntries
    .slice()
    .reverse()
    .map((entry) => ({
      date: format(new Date(entry.date), "MMM dd"),
      weight: entry.weight,
    }))
    .filter((entry) => entry.weight);

  const totalWorkouts = workoutSessions.length;
  const thisWeekWorkouts = workoutSessions.filter((session) => {
    const sessionDate = new Date(session.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate > weekAgo;
  }).length;

  const latestWeight = progressEntries.find((entry) => entry.weight)?.weight;
  const previousWeight = progressEntries
    .slice(1)
    .find((entry) => entry.weight)?.weight;
  const weightChange = latestWeight && previousWeight
    ? latestWeight - previousWeight
    : null;

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Tracking</h1>
          <p className="text-gray-600">Monitor your fitness journey</p>
        </div>
        <button
          onClick={() => setShowAddProgress(!showAddProgress)}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          <Plus className="w-5 h-5" />
          Log Progress
        </button>
      </div>

      {showAddProgress && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Log Your Progress</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="150"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="Feeling great!"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleAddProgress}
              disabled={saving}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : (
                "Save Progress"
              )}
            </button>
            <button
              onClick={() => setShowAddProgress(false)}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <Award className="w-12 h-12 mb-4 opacity-90" />
          <div className="text-4xl font-bold mb-2">{totalWorkouts}</div>
          <div className="text-blue-100">Total Workouts</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <Calendar className="w-12 h-12 mb-4 opacity-90" />
          <div className="text-4xl font-bold mb-2">{thisWeekWorkouts}</div>
          <div className="text-purple-100">This Week</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <TrendingUp className="w-12 h-12 mb-4 opacity-90" />
          <div className="text-4xl font-bold mb-2">
            {latestWeight ? `${latestWeight} lbs` : "-"}
          </div>
          <div className="text-green-100">
            Current Weight
            {weightChange !== null && (
              <span className="ml-2">
                ({weightChange > 0 ? "+" : ""}
                {weightChange.toFixed(1)} lbs)
              </span>
            )}
          </div>
        </div>
      </div>

      {chartData.length > 1 && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Weight Progress</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: "#0ea5e9", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Workouts</h3>
        {workoutSessions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No workouts completed yet. Start a workout to see your progress!
          </p>
        ) : (
          <div className="space-y-3">
            {workoutSessions.slice(0, 10).map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition"
              >
                <div>
                  <div className="font-semibold text-gray-900">
                    {session.workoutName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {format(new Date(session.completedAt), "PPP")}
                  </div>
                </div>
                <div className="text-sm font-medium text-primary-600">
                  {session.duration}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
