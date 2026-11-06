import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext';
import Button from '../components/Button';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  UserPlus, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft,
  Loader2
} from 'lucide-react';

function GoogleIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function Register() {
  const { register, signInWithGoogle } = useAuth();
  const { navigateTo, pendingTarget, clearPendingTarget, selectCategoryAndGoToSetup } = useQuiz();

  const handlePostAuthRedirect = () => {
    if (pendingTarget?.category) {
      const targetCat = pendingTarget.category;
      clearPendingTarget();
      selectCategoryAndGoToSetup(targetCat);
    } else if (pendingTarget?.screen) {
      const targetScreen = pendingTarget.screen;
      clearPendingTarget();
      navigateTo(targetScreen);
    } else {
      navigateTo('home');
    }
  };

  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const validateForm = () => {
    if (!formData.displayName.trim()) {
      return 'Please enter a Pilot Call-Sign / Display Name.';
    }

    if (!formData.email.trim()) {
      return 'Please enter a valid email address.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return 'Please enter a valid email format (e.g., pilot@domain.com).';
    }

    if (!formData.password) {
      return 'Please enter a security key / password.';
    }

    if (formData.password.length < 6) {
      return 'Security key must be at least 6 characters long.';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Security keys do not match.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    const result = await register(
      formData.email,
      formData.password,
      formData.displayName
    );
    setIsSubmitting(false);

    if (result.success) {
      handlePostAuthRedirect();
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleSubmitting(true);
    const result = await signInWithGoogle();
    setIsGoogleSubmitting(false);

    if (result.success) {
      handlePostAuthRedirect();
    } else {
      setErrorMessage(result.error);
    }
  };

  const isAnyLoading = isSubmitting || isGoogleSubmitting;

  return (
    <div className="max-w-md mx-auto my-8 sm:my-14 px-4">
      {/* Monolithic Enlistment Container */}
      <div className="bg-[#121212] border border-[#242424] p-8 sm:p-10 space-y-8 text-left rounded-none">
        
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[#FFC000] text-[10px] font-mono font-bold tracking-[0.25em] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PILOT ENLISTMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight font-display">
            Create Pilot Profile
          </h1>
          <p className="text-xs text-[#7D7D7D] font-sans">
            Enlist in the arena, earn high scores, and ascend the global rankings.
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 bg-[#1C1214] border border-[#FF2D55] text-[#FF2D55] text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-mono">{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Display Name Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-[#969696] uppercase tracking-[0.2em] block">
              PILOT CALL-SIGN / NAME
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                placeholder="e.g. CYBERHUNTER"
                required
                autoComplete="nickname"
                disabled={isAnyLoading}
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-none text-xs sm:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FFC000] transition-colors font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-[#969696] uppercase tracking-[0.2em] block">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="pilot@quizbattle.ai"
                required
                autoComplete="email"
                disabled={isAnyLoading}
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-none text-xs sm:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FFC000] transition-colors font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-[#969696] uppercase tracking-[0.2em] block">
              SECURITY KEY / PASSWORD
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
                disabled={isAnyLoading}
                className="w-full pl-10 pr-11 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-none text-xs sm:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FFC000] transition-colors font-mono disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isAnyLoading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#7D7D7D] hover:text-white focus:outline-none disabled:opacity-50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-[#969696] uppercase tracking-[0.2em] block">
              CONFIRM SECURITY KEY
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#7D7D7D]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter security key"
                required
                autoComplete="new-password"
                disabled={isAnyLoading}
                className="w-full pl-10 pr-4 py-3 bg-[#0A0A0A] border border-[#2A2A2A] rounded-none text-xs sm:text-sm text-white placeholder-[#555555] focus:outline-none focus:border-[#FFC000] transition-colors font-mono disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email Create Account Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isAnyLoading}
              icon={isSubmitting ? Loader2 : UserPlus}
              className="py-4 font-black"
            >
              {isSubmitting ? 'ENLISTING PILOT...' : 'CREATE ACCOUNT'}
            </Button>
          </div>
        </form>

        {/* ──────── OR ──────── Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#242424] w-full" />
          <span className="bg-[#121212] px-3 text-[10px] font-mono text-[#7D7D7D] uppercase tracking-[0.25em] absolute">
            OR
          </span>
        </div>

        {/* Continue with Google Ghost Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAnyLoading}
            className="w-full py-3.5 px-4 bg-transparent hover:bg-[#1A1A1A] border border-white/40 hover:border-white text-white text-xs font-bold font-mono tracking-widest uppercase flex items-center justify-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-none"
          >
            {isGoogleSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FFC000]" />
                <span>CONNECTING GOOGLE...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4" />
                <span>CONTINUE WITH GOOGLE</span>
              </>
            )}
          </button>
        </div>

        {/* Toggle to Login */}
        <div className="pt-4 border-t border-[#222222] text-center space-y-4">
          <p className="text-xs text-[#7D7D7D]">
            Already have an authorized profile?{' '}
            <button
              type="button"
              onClick={() => navigateTo('login')}
              disabled={isAnyLoading}
              className="font-bold text-[#FFC000] hover:underline uppercase font-mono ml-1"
            >
              SIGN IN
            </button>
          </p>

          <button
            type="button"
            onClick={() => navigateTo('home')}
            disabled={isAnyLoading}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#7D7D7D] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO ARENA HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
}
