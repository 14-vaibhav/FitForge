/**
 * Calculates BMI from weight and height.
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {number|null} BMI value rounded to 1 decimal, or null if invalid inputs
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

/**
 * Gets a descriptive category for a given BMI.
 * @param {number} bmi 
 * @returns {string} The category
 */
export function getBMICategory(bmi) {
  if (!bmi) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 24.9) return 'Normal weight';
  if (bmi < 29.9) return 'Overweight';
  return 'Obese';
}

/**
 * Calculates estimated daily protein intake goal based on weight and fitness goal.
 * @param {number} weightKg 
 * @param {string} goal - "muscle_gain", "fat_loss", or "maintenance"
 * @returns {number|null} Protein in grams
 */
export function calculateDailyProtein(weightKg, goal) {
  if (!weightKg) return null;
  
  // Base factors (grams of protein per kg of bodyweight)
  let factor = 1.6; // maintenance default

  if (goal === 'muscle_gain') {
    factor = 2.0; // Needs surplus protein for hypertrophy
  } else if (goal === 'fat_loss') {
    factor = 1.8; // High protein helps preserve muscle in a deficit
  } else {
    factor = 1.6;
  }

  return Math.round(weightKg * factor);
}

/**
 * Recommends post-workout protein intake specifically for a single meal.
 * @param {number} weightKg 
 * @returns {number} Ideal protein boundary for one meal
 */
export function calculatePostWorkoutProtein(weightKg) {
  if (!weightKg) return 25; // Safe default
  // Usually, 0.4g/kg to 0.55g/kg is recommended per meal
  return Math.round(weightKg * 0.4);
}
