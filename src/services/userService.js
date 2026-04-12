import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

/**
 * Fetches the user's health and diet profile from Firestore.
 * @param {string} uid - The Firebase Auth User ID
 * @returns {Promise<Object|null>} - The user profile data or null if it doesn't exist
 */
export const getUserProfile = async (uid) => {
  if (!uid) return null;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

/**
 * Creates or updates the user's health profile in Firestore.
 * @param {string} uid - The Firebase Auth User ID
 * @param {Object} profileData - The profile metrics (height, weight, goal, etc.)
 */
export const saveUserProfile = async (uid, profileData) => {
  if (!uid) throw new Error("User ID is required to save profile");
  try {
    const docRef = doc(db, 'users', uid);
    // { merge: true } ensures we don't accidentally overwrite data we didn't specify
    await setDoc(docRef, profileData, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};
