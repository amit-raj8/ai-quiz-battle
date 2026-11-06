import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';

export default function ProtectedRoute({ children, featureName = "This arena feature" }) {
  const { currentUser, loading, setAuthNotification } = useAuth();
  const { navigateTo } = useQuiz();

  useEffect(() => {
    if (!loading && !currentUser) {
      if (setAuthNotification) {
        setAuthNotification({
          type: 'error',
          message: `PILOT CLEARANCE REQUIRED: Please sign in to access ${featureName}.`
        });
      }
      navigateTo('login', { skipAuthCheck: true });
    }
  }, [loading, currentUser, navigateTo, featureName, setAuthNotification]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 py-20">
        <div className="w-10 h-10 border-2 border-[#202020] border-t-[#FFC000] animate-spin" />
        <p className="text-xs font-mono tracking-[0.2em] text-[#FFC000] uppercase">
          AUTHENTICATING PILOT CLEARANCE...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return children;
}
