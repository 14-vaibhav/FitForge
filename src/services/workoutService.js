import { db } from '../firebase/firebase';
import {
  collection, addDoc, serverTimestamp, writeBatch, doc,
} from 'firebase/firestore';
import { normalizeExerciseName } from '../utils/progression';
import { saveExerciseHistory } from './historyService';

export async function saveWorkoutSession(uid, config, completedExercises, evaluationText) {
  if (!uid) throw new Error('User not authenticated');

  const sessionRef = await addDoc(
    collection(db, 'users', uid, 'sessions'),
    {
      date:           serverTimestamp(),
      config,
      completedCount: completedExercises.filter(e => !e.log?.skipped).length,
      skippedCount:   completedExercises.filter(e =>  e.log?.skipped).length,
      evaluationText: evaluationText || '',
      createdAt:      serverTimestamp(),
    }
  );

  const exerciseWrites = completedExercises.map(async (ex) => {
    const exerciseKey = normalizeExerciseName(ex.name);

    await addDoc(
      collection(db, 'users', uid, 'sessions', sessionRef.id, 'exercises'),
      {
        name:         ex.name,
        exerciseKey,
        targetMuscle: ex.targetMuscle,
        category:     ex.category,
        sets:         ex.sets,
        reps:         ex.reps,
        log:          ex.log,
        createdAt:    serverTimestamp(),
      }
    );

    if (!ex.log?.skipped) {
      await saveExerciseHistory(uid, exerciseKey, {
        exerciseName: ex.name,
        sessionId:    sessionRef.id,
        category:     ex.category,
        log:          ex.log,
        prescribed:   { sets: ex.sets, reps: ex.reps },
      });
    }
  });

  await Promise.all(exerciseWrites);
  return sessionRef.id;
}
