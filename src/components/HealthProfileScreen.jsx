import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveUserProfile } from '../services/userService';
import { calculateBMI, getBMICategory, calculateDailyProtein } from '../utils/healthMath';

export default function HealthProfileScreen({ onComplete }) {
  const { user, userProfile, refreshUserProfile } = useAuth();
  
  // Initialize state with existing profile or defaults
  const [heightCm, setHeightCm] = useState(userProfile?.heightCm || '');
  const [weightKg, setWeightKg] = useState(userProfile?.weightKg || '');
  const [activityLevel, setActivityLevel] = useState(userProfile?.activityLevel || 'moderate');
  const [goal, setGoal] = useState(userProfile?.goal || 'muscle_gain');
  const [dietaryPreference, setDietaryPreference] = useState(userProfile?.dietaryPreference || 'omnivore');
  
  const [saving, setSaving] = useState(false);
  const [bmi, setBmi] = useState(null);
  const [proteinGoal, setProteinGoal] = useState(null);

  // Recalculate metrics instantly when inputs change
  useEffect(() => {
    const h = parseFloat(heightCm);
    const w = parseFloat(weightKg);
    if (h > 0 && w > 0) {
      setBmi(calculateBMI(w, h));
      setProteinGoal(calculateDailyProtein(w, goal));
    } else {
      setBmi(null);
      setProteinGoal(null);
    }
  }, [heightCm, weightKg, goal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!heightCm || !weightKg) return;
    
    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        heightCm: parseFloat(heightCm),
        weightKg: parseFloat(weightKg),
        activityLevel,
        goal,
        dietaryPreference
      });
      // Refresh the context so the rest of the app gets the data
      await refreshUserProfile();
      
      // Let the parent component (e.g. App/Router) know we're done
      if (onComplete) onComplete();
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-animated min-h-screen flex items-center justify-center p-4">
      <div className="glass-card-elevated p-8 max-w-lg w-full animate-fade-in text-white">
        <h2 className="text-3xl font-black mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          Health & Body Metrics
        </h2>
        <p className="text-sm mb-6 opacity-70" style={{ fontFamily: 'Space Mono, monospace' }}>
          We use this logic to personalize your diet & workout recovery.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5 opacity-70 font-mono">WEIGHT (KG)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="input-field w-full"
                placeholder="e.g. 75"
                required
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5 opacity-70 font-mono">HEIGHT (CM)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="input-field w-full"
                placeholder="e.g. 180"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs mb-1.5 opacity-70 font-mono">PRIMARY GOAL</label>
              <select 
                value={goal} 
                onChange={(e) => setGoal(e.target.value)}
                className="input-field w-full appearance-none"
              >
                <option value="muscle_gain">Build Muscle</option>
                <option value="fat_loss">Lose Fat</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5 opacity-70 font-mono">DIET TYPE</label>
              <select 
                value={dietaryPreference} 
                onChange={(e) => setDietaryPreference(e.target.value)}
                className="input-field w-full appearance-none"
              >
                <option value="omnivore">Omnivore (Anything)</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="keto">Keto</option>
              </select>
            </div>
          </div>

          {/* Dynamic Metrics Display */}
          {bmi && proteinGoal && (
            <div className="mt-6 p-4 rounded-xl border" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
              <h3 className="text-sm font-bold mb-3 border-b pb-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                YOUR CALCULATED METRICS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">{bmi}</div>
                  <div className="text-xs font-mono opacity-70">BMI ({getBMICategory(bmi)})</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{proteinGoal}g</div>
                  <div className="text-xs font-mono opacity-70">DAILY PROTEIN TARGET</div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full btn-primary py-4 font-bold text-sm mt-6 rounded-xl"
          >
            {saving ? 'SAVING PROFILE...' : 'SAVE & CONTINUE'}
          </button>
        </form>
      </div>
    </div>
  );
}
