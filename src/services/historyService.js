import { db } from '../firebase/firebase';
import {
  collection, doc, addDoc, setDoc,
  query, orderBy, limit, getDocs, serverTimestamp,
} from 'firebase/firestore';

export async function saveExerciseHistory(uid, exerciseKey, data) {
  const { exerciseName, sessionId, category, log, prescribed } = data;
  console.log('[FitForge] Saving exercise history:', exerciseKey, log);

  await addDoc(
    collection(db, 'users', uid, 'exerciseHistory', exerciseKey, 'history'),
    {
      sessionId,
      date:      serverTimestamp(),
      log,
      prescribed,
      category,
    }
  );

  await setDoc(
    doc(db, 'users', uid, 'exerciseHistory', exerciseKey),
    {
      exerciseName,
      lastPerformed: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getLastLog(uid, exerciseKey) {
  if (!uid || !exerciseKey) return null;

  try {
    const historyRef = collection(
      db, 'users', uid, 'exerciseHistory', exerciseKey, 'history'
    );
    const q = query(historyRef, orderBy('date', 'desc'), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) {
      console.log('[FitForge] No history found for:', exerciseKey);
      return null;
    }
    const result = { id: snap.docs[0].id, ...snap.docs[0].data() };
    console.log('[FitForge] History fetched for:', exerciseKey, result);
    return result;
  } catch (err) {
    console.error('[FitForge] Error fetching history for', exerciseKey, err);
    return null;
  }
}
