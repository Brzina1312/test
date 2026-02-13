'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import { Dumbbell, Zap, Target, TrendingUp, UtensilsCrossed, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">FitAI</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-semibold">AI-Powered Fitness Platform</span>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your Personal
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}AI Fitness Coach
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get personalized workout plans, meal plans, and AI coaching tailored to your unique fitness goals. 
            Transform your body and health with the power of artificial intelligence.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Your Journey
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <Dumbbell className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Personalized Workouts
            </h3>
            <p className="text-gray-600">
              AI-generated workout plans based on your fitness level, goals, and available equipment. 
              Get step-by-step instructions and exercise animations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <UtensilsCrossed className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Custom Meal Plans
            </h3>
            <p className="text-gray-600">
              Nutrition plans calculated based on your body metrics and goals. 
              Get detailed recipes with macros and prep instructions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
          >
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mb-6">
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              AI Coaching
            </h3>
            <p className="text-gray-600">
              Chat with your AI fitness coach anytime. Get instant answers to your fitness questions, 
              form corrections, and motivational support.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-white text-center">
            <div>
              <Target className="h-12 w-12 mx-auto mb-4" />
              <h4 className="text-4xl font-bold mb-2">10,000+</h4>
              <p className="text-blue-100">Personalized Plans Created</p>
            </div>
            <div>
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <h4 className="text-4xl font-bold mb-2">95%</h4>
              <p className="text-blue-100">User Satisfaction Rate</p>
            </div>
            <div>
              <Dumbbell className="h-12 w-12 mx-auto mb-4" />
              <h4 className="text-4xl font-bold mb-2">24/7</h4>
              <p className="text-blue-100">AI Coach Available</p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Fitness Journey?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users who have achieved their fitness goals with FitAI
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg px-12">
              Get Started for Free
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Dumbbell className="h-6 w-6" />
            <span className="text-xl font-bold">FitAI</span>
          </div>
          <p className="text-gray-400">
            © 2024 FitAI. Your AI-powered fitness companion.
          </p>
        </div>
      </footer>
    </div>
  );
}
