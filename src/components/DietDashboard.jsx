import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { calculateBMI, calculateDailyProtein } from '../utils/healthMath';
import { generateDietPlan } from '../services/gemini';
import HealthProfileScreen from './HealthProfileScreen';

export default function DietDashboard() {
  const { userProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [error, setError] = useState(null);
  // Optional: toggles showing the profile setup if they want to edit metrics
  const [showProfileSetup, setShowProfileSetup] = useState(!userProfile); 

  useEffect(() => {
    // Automatically close setup if userProfile is suddenly populated
    if (userProfile && showProfileSetup) {
      setShowProfileSetup(false);
    }
  }, [userProfile]);

  useEffect(() => {
    // If we have a profile but no diet plan generated yet, fetch it
    if (userProfile && !dietPlan && !loading && !error) {
      fetchDietPlan();
    }
  }, [userProfile]);

  const fetchDietPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const bmi = calculateBMI(userProfile.weightKg, userProfile.heightCm);
      const proteinGoal = calculateDailyProtein(userProfile.weightKg, userProfile.goal);
      
      const plan = await generateDietPlan({ userProfile, bmi, proteinGoal });
      setDietPlan(plan);
    } catch (err) {
      console.error(err);
      setError("Failed to generate diet plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // If user hasn't set up their profile, force them to do so
  if (showProfileSetup || !userProfile) {
    return <HealthProfileScreen onComplete={() => setShowProfileSetup(false)} />;
  }

  const bmi = calculateBMI(userProfile.weightKg, userProfile.heightCm);
  const proteinGoal = calculateDailyProtein(userProfile.weightKg, userProfile.goal);

  return (
    <div className="bg-animated min-h-screen text-white p-4 pb-20">
      <div className="max-w-2xl mx-auto mt-8">
        
        {/* Header & Core Metrics */}
        <div className="glass-card-elevated p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-black" style={{ fontFamily: 'Syne, sans-serif' }}>
              Nutrition Center
            </h1>
            <button 
              onClick={() => setShowProfileSetup(true)}
              className="text-xs opacity-70 hover:opacity-100 uppercase"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-center">
              <div className="text-xs font-mono opacity-60 mb-1">GOAL</div>
              <div className="font-bold capitalize">{userProfile.goal.replace('_', ' ')}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-center">
              <div className="text-xs font-mono opacity-60 mb-1">BMI</div>
              <div className="font-bold">{bmi}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-white/10 text-center">
              <div className="text-xs font-mono opacity-60 mb-1">DIET</div>
              <div className="font-bold capitalize">{userProfile.dietaryPreference}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-[#4285F4]/30 text-center shadow-[0_0_15px_rgba(66,133,244,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-[#4285F4]/20 to-transparent"></div>
              <div className="relative z-10">
                <div className="text-xs font-mono text-[#4285F4] font-bold mb-1">TARGET PROTEIN</div>
                <div className="font-black text-xl">{proteinGoal}g</div>
              </div>
            </div>
          </div>
        </div>

        {/* Diet Plan Section */}
        <div className="glass-card-elevated p-6">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl font-bold mb-1">Daily Meal Strategy</h2>
              <p className="text-xs font-mono opacity-60">AI Generated specifically for you</p>
            </div>
            <button 
              onClick={fetchDietPlan}
              disabled={loading}
              className="btn-secondary px-4 py-2 text-xs rounded-lg flex items-center gap-2"
            >
              {loading ? 'Generating...' : '↻ Regenerate'}
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col flex-wrap justify-center items-center py-12 gap-4">
              <div className="w-8 h-8 rounded-full border-4 border-t-[#4285F4] border-white/10 animate-spin"></div>
              <div className="text-sm font-mono opacity-60 animate-pulse">Consulting the AI Nutritionist...</div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-sm text-red-200">
              {error}
            </div>
          ) : dietPlan ? (
            <div className="space-y-6 animate-fade-in">
              <p className="text-sm border-l-4 border-[#34A853] pl-4 italic opacity-90">
                "{dietPlan.summary}"
              </p>
              
              <div className="space-y-3">
                {dietPlan.meals.map((meal, i) => (
                  <div key={i} className="bg-black/30 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-colors">
                    <div>
                      <h3 className="font-bold text-[#FBBC05] mb-1">{meal.name}</h3>
                      <p className="text-sm text-white/90">{meal.food}</p>
                    </div>
                    <div className="bg-white/10 px-3 py-1.5 rounded-lg text-sm font-mono shrink-0 whitespace-nowrap text-center">
                      <span className="opacity-60 text-xs">Protein:</span> {meal.protein}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
        
      </div>
    </div>
  );
}
