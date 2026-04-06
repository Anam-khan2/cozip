import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { BrandLogo } from '../components/BrandLogo';
import { showErrorToast, showInfoToast, showSuccessToast } from '../lib/notifications';
import { signIn, signUp, useAuthSession } from '../lib/auth';
import { PageSeo } from '../components/PageSeo';

// Auth mode type
type AuthMode = 'login' | 'register';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authSession = useAuthSession();
  // Where to redirect after login — AuthGuard passes `state.from`
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login');
  }, [location.pathname]);

  const pageTitle = mode === 'register' ? 'Create Account' : 'Login';

  useEffect(() => {
    if (authSession?.isAuthenticated) {
      navigate(redirectTo);
    }
  }, [authSession?.isAuthenticated, navigate, redirectTo]);

  // Handle login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(loginForm.email, loginForm.password);
      showSuccessToast('Signed in successfully.', 'Welcome back!');
      navigate(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in right now.';
      showErrorToast('Sign in failed.', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle registration submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate password match
    if (registerForm.password !== registerForm.confirmPassword) {
      showErrorToast('Passwords do not match.', 'Please re-enter the same password in both fields.');
      return;
    }
    setIsSubmitting(true);

    try {
      await signUp(registerForm.email, registerForm.password, {
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
      });
      showSuccessToast('Account created successfully.', 'You are now signed in and ready to shop.');
      navigate(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account right now.';
      showErrorToast('Registration failed.', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <PageSeo title={pageTitle} />
      {/* LEFT SIDE - Beautiful Photo (50%) */}
      <aside 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        aria-label="Decorative image of cozy coffee setup"
      >
        <img
          src="https://images.unsplash.com/photo-1747218621940-63bf6404b2d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwY29mZmVlJTIwc2V0dXAlMjBwYXN0ZWwlMjBtdWdzJTIwYWVzdGhldGljfGVufDF8fHx8MTc3MjgzNjY2MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Cozy coffee setup with pastel mugs on a warm, aesthetic background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Soft overlay for branding */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(122, 144, 112, 0.1) 0%, rgba(244, 166, 178, 0.1) 100%)'
          }}
        />
        {/* Logo overlay */}
        <div className="absolute bottom-12 left-12 z-10">
          <div
            className="mb-4 inline-block rounded-3xl px-5 py-4"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', boxShadow: '0 12px 36px rgba(0, 0, 0, 0.18)' }}
          >
            <BrandLogo className="inline-block" imageClassName="h-24 w-auto" />
          </div>
          <p 
            className="text-lg"
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              color: '#FFFFFF',
              textShadow: '0 1px 10px rgba(0, 0, 0, 0.2)'
            }}
          >
            Your cozy mug collection awaits
          </p>
        </div>
      </aside>

      {/* RIGHT SIDE - Auth Form (50%) */}
      <main 
        className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 lg:px-8 lg:py-20"
        style={{ backgroundColor: '#FAF8F3' }}
      >
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="lg:hidden mb-10 text-center">
            <BrandLogo className="mb-4 inline-block" imageClassName="mx-auto h-20 w-auto" />
            <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
              Your cozy mug collection awaits
            </p>
          </div>

          {/* Back to Home Link */}
          <div className="mb-8">
            <Link 
              to="/"
              className="inline-flex items-center gap-2 transition-opacity hover:opacity-70"
              style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
            >
              ← Back to Home
            </Link>
          </div>

          {mode === 'login' ? (
            // LOGIN FORM
            <section aria-labelledby="login-heading">
              <header className="mb-8">
                <h2 
                  id="login-heading"
                  className="text-2xl sm:text-3xl lg:text-4xl mb-3" 
                  style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}
                >
                  Welcome Back
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                  Sign in to your account to continue
                </p>
              </header>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="login-email"
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #D4C4B0',
                      color: '#4A5D45',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="login-password"
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #D4C4B0',
                        color: '#4A5D45',
                        fontFamily: 'Inter, sans-serif',
                      }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                      style={{ color: '#7A9070' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  {/* Custom Checkbox - Remember Me */}
                  <label 
                    htmlFor="remember-me"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="sr-only"
                    />
                    <div 
                      className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                      style={{
                        backgroundColor: rememberMe ? '#7A9070' : '#FFFFFF',
                        border: '2px solid #D4C4B0',
                      }}
                      aria-hidden="true"
                    >
                      {rememberMe && (
                        <svg 
                          className="w-3 h-3" 
                          viewBox="0 0 12 12" 
                          fill="none" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path 
                            d="M10 3L4.5 8.5L2 6" 
                            stroke="#FFFFFF" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <span 
                      className="text-sm select-none"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45' }}
                    >
                      Remember me
                    </span>
                  </label>

                  {/* Forgot Password Link */}
                  <button
                    type="button"
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070', fontWeight: 500 }}
                    onClick={() => showInfoToast('Password reset is not wired yet.', 'Use any saved demo credentials to continue. ')}
                    aria-label="Open password reset information"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Sign In Button - Bold & Pill-shaped */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full transition-all hover:scale-105 text-base mt-6"
                  style={{
                    backgroundColor: '#7A9070',
                    color: '#ffffff',
                    boxShadow: '0 6px 24px rgba(122, 144, 112, 0.4)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </button>

                {/* Create Account Link */}
                <p 
                  className="text-center text-sm mt-6"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="transition-opacity hover:opacity-70"
                    style={{ color: '#5A7050', fontWeight: 600 }}
                  >
                    Create Account
                  </button>
                </p>
              </form>
            </section>
          ) : (
            // REGISTRATION FORM
            <section aria-labelledby="register-heading">
              <header className="mb-8">
                <h2 
                  id="register-heading"
                  className="text-2xl sm:text-3xl lg:text-4xl mb-3" 
                  style={{ fontFamily: 'Playfair Display, serif', color: '#5A7050', fontWeight: 600 }}
                >
                  Create Account
                </h2>
                <p style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}>
                  Join Cozip and start your cozy collection
                </p>
              </header>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label 
                      htmlFor="register-firstName"
                      className="block text-sm mb-2"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="register-firstName"
                      value={registerForm.firstName}
                      onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                      required
                      autoComplete="given-name"
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #D4C4B0',
                        color: '#4A5D45',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="register-lastName"
                      className="block text-sm mb-2"
                      style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="register-lastName"
                      value={registerForm.lastName}
                      onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                      required
                      autoComplete="family-name"
                      className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #D4C4B0',
                        color: '#4A5D45',
                        fontFamily: 'Inter, sans-serif',
                      }}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="register-email"
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="register-email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #D4C4B0',
                      color: '#4A5D45',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="register-password"
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="register-password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      autoComplete="new-password"
                      className="w-full px-4 py-3 pr-12 rounded-xl outline-none transition-all focus:ring-2"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '2px solid #D4C4B0',
                        color: '#4A5D45',
                        fontFamily: 'Inter, sans-serif',
                      }}
                      placeholder="••••••••"
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors"
                      style={{ color: '#7A9070' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                      ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <p 
                    className="text-xs mt-1"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                  >
                    Must be at least 8 characters
                  </p>
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label 
                    htmlFor="register-confirmPassword"
                    className="block text-sm mb-2"
                    style={{ fontFamily: 'Inter, sans-serif', color: '#4A5D45', fontWeight: 500 }}
                  >
                    Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="register-confirmPassword"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    autoComplete="new-password"
                    className="w-full px-4 py-3 rounded-xl outline-none transition-all focus:ring-2"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '2px solid #D4C4B0',
                      color: '#4A5D45',
                      fontFamily: 'Inter, sans-serif',
                    }}
                    placeholder="••••••••"
                  />
                </div>

                {/* Create Account Button - Bold & Pill-shaped */}
                <button
                  type="submit"
                  className="w-full py-4 rounded-full transition-all hover:scale-105 text-base mt-6"
                  style={{
                    backgroundColor: '#7A9070',
                    color: '#ffffff',
                    boxShadow: '0 6px 24px rgba(122, 144, 112, 0.4)',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                  }}
                >
                  Create Account
                </button>

                {/* Sign In Link */}
                <p 
                  className="text-center text-sm mt-6"
                  style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
                >
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="transition-opacity hover:opacity-70"
                    style={{ color: '#5A7050', fontWeight: 600 }}
                  >
                    Sign In
                  </button>
                </p>
              </form>
            </section>
          )}

          {/* Terms & Privacy (Footer) */}
          <footer className="mt-12 text-center">
            <p 
              className="text-xs"
              style={{ fontFamily: 'Inter, sans-serif', color: '#7A9070' }}
            >
              By continuing, you agree to Cozip's{' '}
              <Link
                to="/terms"
                className="underline hover:opacity-70"
                aria-label="Read Cozip terms of service"
              >
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link
                to="/privacy"
                className="underline hover:opacity-70"
                aria-label="Read Cozip privacy policy"
              >
                Privacy Policy
              </Link>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}