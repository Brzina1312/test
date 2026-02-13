"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";

interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  onboardingCompleted: boolean;
  goals?: string[];
  fitnessLevel?: string;
  dietaryPreferences?: string[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profileDoc = await getDoc(doc(db, "users", user.uid));
        if (profileDoc.exists()) {
          setUserProfile(profileDoc.data() as UserProfile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile: UserProfile = {
      uid: userCredential.user.uid,
      email: userCredential.user.email!,
      onboardingCompleted: false,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
    setUserProfile(newProfile);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    const profileDoc = await getDoc(doc(db, "users", userCredential.user.uid));
    if (!profileDoc.exists()) {
      const newProfile: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        displayName: userCredential.user.displayName || undefined,
        onboardingCompleted: false,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newProfile);
      setUserProfile(newProfile);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    
    const updatedProfile = { ...userProfile, ...profile };
    await setDoc(doc(db, "users", user.uid), updatedProfile, { merge: true });
    setUserProfile(updatedProfile as UserProfile);
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
