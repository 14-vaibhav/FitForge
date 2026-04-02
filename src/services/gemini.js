import { GoogleGenAI } from '@google/genai';
import { getRecentSessions } from '../utils/localHistory';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const MODEL = 'gemini-3.1-flash-lite-preview';

/**
 * Generate a structured workout plan from Gemini.
 * Returns an array of exercise objects.
 */
export async function generateWorkout({ bodyParts, duration, location }) {
  const prompt = `You are an expert personal trainer. Create a detailed, professional workout plan.

User's workout parameters:
- Body parts to train: ${bodyParts.join(', ')}
- Available time: ${duration} minutes
- Location: ${location}

Generate a complete workout plan as a JSON array. Each exercise must follow this EXACT schema:
{
  "name": "Exercise Name",
  "targetMuscle": "Primary muscle targeted",
  "category": "Strength | Cardio | Flexibility | HIIT",
  "duration": "X minutes",
  "sets": "3-4 sets" or "N/A for cardio",
  "reps": "10-12 reps" or "30 seconds" or "N/A",
  "rest": "60 seconds" or "N/A",
  "difficulty": "Beginner | Intermediate | Advanced",
  "instructions": "Step-by-step instructions in 2-3 sentences on how to perform this exercise correctly.",
  "youtubeSearchQuery": "exact YouTube search query to find a good tutorial video for this exercise",
  "tips": "1-2 pro tips for better form or results",
  "equipment": "Equipment needed (or Bodyweight / No equipment)"
}

Rules:
- Tailor duration of each exercise to fit within the ${duration}-minute total workout time
- If location is "Home", use bodyweight exercises or minimal equipment
- If location is "Gym", you can include free weights, cables, machines
- Always include a warm-up phase at the start and a cool-down/stretch at the end
- For cardio exercises: sets = "N/A", reps = specify duration (e.g., "20 minutes")
- Structure the workout logically (warm-up → main exercises → cardio if included → cool-down)
- Include 6-12 exercises total depending on time available
- Be specific with reps, sets, and rest periods
- The youtubeSearchQuery should be the exact name of the exercise + "tutorial form" for best results

Return ONLY the JSON array, no markdown, no explanation, no \`\`\`json tags. Just the raw JSON array.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text.trim();

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to extract array if there's surrounding text
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse workout plan from Gemini response.');
  }
}

/**
 * Ask Gemini to suggest a replacement exercise.
 */
export async function replaceExercise({ exercise, bodyParts, location, alreadyDone }) {
  const prompt = `You are an expert personal trainer. Suggest one alternative exercise to replace the current one.

Current exercise being replaced: ${exercise.name} (targets: ${exercise.targetMuscle})
Location: ${location}
Exercises already in the workout: ${alreadyDone.join(', ')}

Return ONE exercise object as JSON following this exact schema:
{
  "name": "Exercise Name",
  "targetMuscle": "Primary muscle targeted",
  "category": "Strength | Cardio | Flexibility | HIIT",
  "duration": "${exercise.duration}",
  "sets": "3 sets",
  "reps": "10-12 reps",
  "rest": "60 seconds",
  "difficulty": "Intermediate",
  "instructions": "Step-by-step instructions in 2-3 sentences.",
  "youtubeSearchQuery": "exact YouTube search query for tutorial",
  "tips": "A helpful tip",
  "equipment": "Equipment needed"
}

Rules:
- Target the same or similar muscle group as the exercise being replaced
- ${location === 'Home' ? 'Use bodyweight exercises or minimal equipment' : 'Can use gym equipment'}
- Do NOT suggest any exercise already in the list
- Return ONLY the raw JSON object, no markdown.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });

  const text = response.text.trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse replacement exercise.');
  }
}

/**
 * Evaluate the completed workout session with streaming.
 * onChunk(text) is called progressively as text streams in.
 * Returns the full evaluation text once complete.
 */
export async function evaluateWorkout({ workoutConfig, completedExercises }, onChunk) {
  const done    = completedExercises.filter(e => !e.log?.skipped);
  const skipped = completedExercises.filter(e =>  e.log?.skipped);

  const exerciseSummary = done.map((ex, i) => {
    const log = ex.log;
    return `${i + 1}. ${ex.name}: ${log?.setsCompleted || '?'}×${log?.repsPerSet || '?'} reps${log?.weight ? ` @ ${log.weight}` : ''}${log?.notes ? ` (${log.notes})` : ''}`;
  }).join('\n');

  // Inject historical context
  const past = getRecentSessions(2);
  let historyContext = '';
  if (past.length > 0) {
    historyContext = `\nPast Workout Context (for comparison):\n` + past.map((s, i) => 
      `- Session ${i+1}: ${s.config.bodyParts.join(', ')} (${s.exercises.filter(e=>!e.log?.skipped).length} exercises completed)`
    ).join('\n');
  }

  const prompt = `You are a fitness coach. Give a sharp, motivating evaluation of this ${workoutConfig.duration}-min ${workoutConfig.location} workout targeting ${workoutConfig.bodyParts.join(', ')}.

Completed (${done.length}): 
${exerciseSummary || 'None'}
Skipped (${skipped.length}): ${skipped.map(e => e.name).join(', ') || 'None'}
${historyContext}

Write 3 short sections with emojis: 1) Score/10 with one sentence why. 2) What they crushed. 3) One specific tip for next time. Max 150 words. Be direct and punchy.`;

  // Use streaming so text appears word-by-word
  let fullText = '';
  try {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      contents: prompt,
    });

    for await (const chunk of stream) {
      // The SDK may expose text via .text or via candidates
      const piece = typeof chunk.text === 'string'
        ? chunk.text
        : chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (piece) {
        fullText += piece;
        if (onChunk) onChunk(fullText);
      }
    }
  } catch (streamErr) {
    // Streaming failed — fall back to a single non-streaming call
    console.warn('Streaming failed, falling back to standard call:', streamErr.message);
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    fullText = response.text?.trim() || '';
    if (onChunk) onChunk(fullText);
  }

  return fullText.trim() || 'Great workout! Keep it up and stay consistent.';
}

/**
 * Build a YouTube search URL from a search query
 */
export function buildYoutubeUrl(searchQuery) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
}
