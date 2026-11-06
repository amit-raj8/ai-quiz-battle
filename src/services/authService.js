import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase';

/**
 * Maps Firebase Auth error codes to user-friendly human readable messages.
 * Also logs the raw error for developer debugging in console.
 */
export function getFriendlyAuthErrorMessage(error) {
  if (!error) return 'An unexpected error occurred. Please try again.';
  
  const code = error.code || '';
  
  // Log actual Firebase error details in console for debugging
  console.error('[Firebase Auth Error]:', {
    code: error.code,
    message: error.message,
    fullError: error
  });
  
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address format.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please register or check for typos.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please verify your email and password, or create an account if you have not registered yet.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Must be at least 6 characters long.';
    case 'auth/too-many-requests':
      return 'Access temporarily blocked due to too many failed attempts. Try again in a few minutes.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'This sign-in method is not enabled in Firebase Console.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Authentication request was cancelled. Please try again.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for OAuth in Firebase Console (check Authorized Domains in Firebase Authentication Settings).';
    case 'permission-denied':
      return 'Account authenticated, but database permissions are restricted.';
    default:
      if (error.message && error.message.includes('Missing or insufficient permissions')) {
        return 'Account credentials verified. Database access permissions are restricted.';
      }
      return error.message || 'Authentication failed. Please try again.';
  }
}

export const authService = {
  /**
   * Register a new user with Email, Password and Display Name
   */
  async registerUser(email, password, displayName) {
    const cleanedEmail = (email || '').trim();
    const userCredential = await createUserWithEmailAndPassword(auth, cleanedEmail, password);
    
    // Set user's displayName in Firebase Auth
    if (displayName && displayName.trim()) {
      await updateProfile(userCredential.user, {
        displayName: displayName.trim()
      });
    }

    return userCredential.user;
  },

  /**
   * Login user with Email and Password
   */
  async loginUser(email, password) {
    const cleanedEmail = (email || '').trim();
    const userCredential = await signInWithEmailAndPassword(auth, cleanedEmail, password);
    return userCredential.user;
  },

  /**
   * Sign in / Register with Google OAuth Popup
   */
  async signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const userCredential = await signInWithPopup(auth, provider);
    return userCredential.user;
  },

  /**
   * Sign out current user
   */
  async logoutUser() {
    await signOut(auth);
  },

  /**
   * Listen for Firebase Auth state changes
   */
  observeAuthState(callback) {
    return onAuthStateChanged(auth, callback);
  }
};
