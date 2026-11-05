import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Key, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles,
  Database,
  ExternalLink,
  Info
} from 'lucide-react';
import { signInAdmin, signUpAdmin, getAdminSession, SUPABASE_PROJECT_ID } from '../services/supabase';
import { BrandLogo } from './BrandLogo';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingInitialAuth, setIsCheckingInitialAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated via Supabase, redirect straight to dashboard
  useEffect(() => {
    let isMounted = true;
    getAdminSession()
      .then((session) => {
        if (isMounted) {
          if (session && session.user) {
            onNavigate('/admin/dashboard');
          } else {
            setIsCheckingInitialAuth(false);
          }
        }
      })
      .catch(() => {
        if (isMounted) setIsCheckingInitialAuth(false);
      });

    return () => {
      isMounted = false;
    };
  }, [onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (authMode === 'signup') {
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify and re-enter.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        const { data, error } = await signInAdmin(email.trim(), password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMessage('Invalid email or password. If you haven\'t created an admin account yet, switch to the "Admin Setup" tab below.');
          } else if (error.message.includes('Email not confirmed')) {
            setErrorMessage('Email address has not been confirmed yet. Check your inbox or disable email confirmation in your Supabase Auth settings.');
          } else {
            setErrorMessage(error.message);
          }
          setIsLoading(false);
          return;
        }

        if (data.session) {
          setSuccessMessage('✓ Successfully signed in! Redirecting to Admin Dashboard...');
          setTimeout(() => {
            onNavigate('/admin/dashboard');
          }, 600);
        } else {
          setErrorMessage('Could not establish admin session. Please try again.');
          setIsLoading(false);
        }
      } else {
        // Sign up / First-time setup
        const { data, error } = await signUpAdmin(email.trim(), password);
        if (error) {
          setErrorMessage(error.message);
          setIsLoading(false);
          return;
        }

        if (data.session) {
          setSuccessMessage('✓ Admin account created and signed in! Redirecting to Admin Dashboard...');
          setTimeout(() => {
            onNavigate('/admin/dashboard');
          }, 800);
        } else if (data.user) {
          setSuccessMessage('✓ Admin account registered! If email confirmation is enabled in your Supabase project, check your inbox to confirm. Otherwise, you can now sign in.');
          setAuthMode('signin');
          setIsLoading(false);
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'An unexpected error occurred during authentication.');
      setIsLoading(false);
    }
  };

  if (isCheckingInitialAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex p-3 bg-cyan-950/80 rounded-2xl border border-cyan-700/50 shadow-lg text-cyan-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white font-heading">
              Sanjeevini Dental Clinic
            </h2>
            <p className="text-xs text-slate-400">
              Verifying Supabase Administrator authorization...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Strip */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md z-10">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Clinic Website</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[11px]">Supabase Project: {SUPABASE_PROJECT_ID}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-md space-y-6">
          
          {/* Logo & Brand Card Header */}
          <div className="text-center space-y-3">
            <div className="inline-block">
              <BrandLogo variant="light" size="lg" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                Admin Portal Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Authorized access for Sanjeevini Dental Clinic doctors and staff.
              </p>
            </div>
          </div>

          {/* Authentication Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl">
            
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                First-time Setup
              </button>
            </div>

            {/* Error Message Toast */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-950/50 border border-rose-800/60 rounded-xl flex items-start gap-2.5 text-rose-200 text-xs animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Success Message Toast */}
            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-950/50 border border-emerald-800/60 rounded-xl flex items-start gap-2.5 text-emerald-200 text-xs animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{successMessage}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-email">
                  Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@sanjeevinidental.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-password">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={authMode === 'signup' ? 'Create a secure password (min 6 chars)' : 'Enter admin password'}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (only for setup) */}
              {authMode === 'signup' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5" htmlFor="admin-confirm-password">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type your password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    This creates an authorized admin user directly in your Supabase Auth project.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Connecting to Supabase Auth...</span>
                  </>
                ) : authMode === 'signin' ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Admin Dashboard</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Admin Account</span>
                  </>
                )}
              </button>

            </form>

            {/* Guidance Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Admin authentication is managed via <strong>Supabase Auth</strong>. Passwords are never hard-coded or exposed in frontend code.
                </span>
              </div>
            </div>

          </div>

          {/* Security & RLS Notice */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-4 text-[11px] text-slate-400 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supabase Row Level Security (RLS) Protected</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Patients can only submit bookings. Only authenticated clinic staff can view, confirm, reschedule, or manage appointment records.
            </p>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-800/60 z-10">
        Sanjeevini Dental Clinic · Vinobanagar, Shivamogga, Karnataka · 089710 96312
      </footer>
    </div>
  );
};
