import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { getUserProfile } from '../services/userService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && firebaseUser.uid !== 'guest_user_123') {
        try {
          const profile = await getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error("Failed to load user profile", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe; // cleanup on unmount
  }, []);

  const refreshUserProfile = async () => {
    if (user && user.uid !== 'guest_user_123') {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    }
  };

  const loginAsGuest = () => {
    setUser({ uid: 'guest_user_123', displayName: 'Guest' });
    setUserProfile(null);
  };

  const logout = async () => {
    if (user?.uid === 'guest_user_123') {
      setUser(null);
      setUserProfile(null);
    } else {
      try {
        await firebaseSignOut(auth);
      } catch (error) {
        console.error("Sign out error", error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, loginAsGuest, logout, refreshUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
