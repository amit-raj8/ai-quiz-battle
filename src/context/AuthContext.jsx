import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, getFriendlyAuthErrorMessage } from '../services/authService';
import { userService, generatePilotId } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authNotification, setAuthNotification] = useState(null);

  useEffect(() => {
    let unsubscribeFirestore = null;

    // Listen for auth state changes on mount and session updates
    const unsubscribeAuth = authService.observeAuthState((user) => {
      setCurrentUser(user);

      // Clean up any previous Firestore snapshot listener
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (user) {
        // Subscribe to real-time updates from users/{uid} collection
        unsubscribeFirestore = userService.subscribeToUserProfile(
          user.uid,
          (profileData) => {
            const isNumeric8 = profileData?.pilotId && /^PLT-\d{8}$/.test(profileData.pilotId);
            const enriched = profileData ? {
              ...profileData,
              pilotId: isNumeric8 ? profileData.pilotId : generatePilotId(user.uid)
            } : null;
            setUserProfile(enriched);
            setLoading(false);
          },
          (error) => {
            console.error('[AuthContext] Error subscribing to Firestore profile:', error);
            setLoading(false);
          }
        );
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, []);

  // Auto-dismiss notifications after 4 seconds
  useEffect(() => {
    if (authNotification) {
      const timer = setTimeout(() => {
        setAuthNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [authNotification]);

  const login = async (email, password) => {
    try {
      const user = await authService.loginUser(email, password);
      
      // Update lastLogin without failing authentication if Firestore is restricted
      let profile = null;
      try {
        profile = await userService.createOrUpdateUserDocument(user);
      } catch (firestoreError) {
        console.warn('[AuthContext] Firestore sync warning (proceeding with session):', firestoreError);
        profile = {
          uid: user.uid,
          pilotId: generatePilotId(user.uid),
          displayName: user.displayName || user.email?.split('@')[0] || 'PILOT',
          email: user.email || '',
          photoURL: user.photoURL || null,
          totalBattles: 0,
          totalScore: 0,
          bestScore: 0,
          accuracy: 0,
          currentLevel: 1,
          xp: 0,
          maxBoost: 0
        };
      }
      setUserProfile(profile);

      const name = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Pilot';
      setAuthNotification({
        type: 'success',
        message: `Welcome back, ${name}!`
      });
      return { success: true, user };
    } catch (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      return { success: false, error: friendlyMessage };
    }
  };

  const register = async (email, password, displayName) => {
    try {
      const user = await authService.registerUser(email, password, displayName);
      
      // Create users/{uid} document with default stats without failing registration if Firestore is restricted
      let profile = null;
      try {
        profile = await userService.createOrUpdateUserDocument(user, { displayName });
      } catch (firestoreError) {
        console.warn('[AuthContext] Firestore creation warning (proceeding with session):', firestoreError);
        profile = {
          uid: user.uid,
          pilotId: generatePilotId(user.uid),
          displayName: displayName?.trim() || user.displayName || user.email?.split('@')[0] || 'PILOT',
          email: user.email || '',
          photoURL: user.photoURL || null,
          totalBattles: 0,
          totalScore: 0,
          bestScore: 0,
          accuracy: 0,
          currentLevel: 1,
          xp: 0,
          maxBoost: 0
        };
      }
      setUserProfile(profile);

      const name = displayName?.trim() || profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Pilot';
      setAuthNotification({
        type: 'success',
        message: `Account enlisted! Welcome to the Arena, ${name}!`
      });
      return { success: true, user };
    } catch (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      return { success: false, error: friendlyMessage };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const user = await authService.signInWithGoogle();
      
      // Create document if doesn't exist, or update lastLogin if it does
      let profile = null;
      try {
        profile = await userService.createOrUpdateUserDocument(user);
      } catch (firestoreError) {
        console.warn('[AuthContext] Firestore Google sync warning (proceeding with session):', firestoreError);
        profile = {
          uid: user.uid,
          pilotId: generatePilotId(user.uid),
          displayName: user.displayName || user.email?.split('@')[0] || 'PILOT',
          email: user.email || '',
          photoURL: user.photoURL || null,
          totalBattles: 0,
          totalScore: 0,
          bestScore: 0,
          accuracy: 0,
          currentLevel: 1,
          xp: 0,
          maxBoost: 0
        };
      }
      setUserProfile(profile);

      const name = profile?.displayName || user.displayName || user.email?.split('@')[0] || 'Pilot';
      setAuthNotification({
        type: 'success',
        message: `Authenticated with Google as ${name}!`
      });
      return { success: true, user };
    } catch (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      return { success: false, error: friendlyMessage };
    }
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
      setUserProfile(null);
      setAuthNotification({
        type: 'success',
        message: 'Logged out successfully.'
      });
      return { success: true };
    } catch (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(error);
      return { success: false, error: friendlyMessage };
    }
  };

  const clearNotification = () => setAuthNotification(null);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        authNotification,
        setAuthNotification,
        clearNotification,
        login,
        register,
        signInWithGoogle,
        loginWithGoogle: signInWithGoogle,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
