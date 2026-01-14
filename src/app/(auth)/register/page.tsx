'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button, Logo } from '@/components/common';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ChevronLeft, 
  Loader2, 
  AlertCircle, 
  Check 
} from 'lucide-react';
import { signIn } from 'next-auth/react';

interface PasswordRules {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
}

export default function RegisterPage() {
  const { register, error, loading, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = 
    useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [passwordRules, setPasswordRules] = useState<PasswordRules>({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const oldValue = formData[name as keyof typeof formData];
    
    setFormData({ ...formData, [name]: value });
    
    // Real-time password validation
    if (name === 'password') {
      setPasswordRules({
        minLength: value.length >= 8,
        hasUpperCase: /[A-Z]/.test(value),
        hasLowerCase: /[a-z]/.test(value),
        hasNumber: /\d/.test(value),
      });
    }
    
    // Only clear errors when email or password changes to different 
    // value
    if ((name === 'email' || name === 'password') && 
        value !== oldValue) {
      setFormError('');
      clearError();
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setPasswordTouched(true);

    // Validation
    if (!formData.email || !formData.password || 
        !formData.confirmPassword) {
      setFormError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Email không hợp lệ');
      return;
    }

    // Validate password rules
    const allRulesMet = Object.values(passwordRules)
      .every(rule => rule);
    if (!allRulesMet) {
      setFormError('Mật khẩu chưa đáp ứng đủ yêu cầu');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      // Error already set in AuthContext
    }
  };

  const displayError = formError || error;

  function BackButton() {
    const router = useRouter();
    const params = useSearchParams();
    const callback = params?.get('callbackUrl');

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      if (callback) {
        router.push(callback);
      } else {
        router.back();
      }
    };

    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-3 px-3 h-9 
          bg-white/95 text-primary rounded-lg shadow-md 
          hover:shadow-lg hover:bg-white transition-all"
      >
        <ChevronLeft className="w-4 h-4 text-gray-700" />
        <span className="hidden sm:inline text-sm font-medium leading-none">
          Quay lại
        </span>
      </button>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center 
      justify-center px-4 py-8">
      {/* Top-left Back to previous (uses callbackUrl or history.back) */}
      <div className="absolute top-4 left-4 z-30">
        <BackButton />
      </div>

      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center 
          bg-no-repeat"
        style={{
          backgroundImage: "url('/register-bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br 
          from-purple-900/90 via-pink-900/85 to-orange-900/90">
        </div>
      </div>

      {/* Register Card with Fade-in Animation */}
      <div 
        className="relative z-10 w-full max-w-md"
        style={{
          animation: 'fadeInUp 0.6s ease-out',
        }}
      >
        {/* Logo & Title */}
          <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full bg-transparent \
            backdrop-blur-sm mb-4">
            <img src="/logo.svg" alt="Logo" className="h-12 w-auto" />
          </div>

        </div>

        {/* Register Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl 
          shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} noValidate 
            className="space-y-5">
            {/* Error Alert */}
            {displayError && (
              <div className="bg-red-50 border-l-4 border-red-500 
                text-red-700 px-4 py-3 rounded-r-lg text-sm 
                flex items-start animate-shake">
                <AlertCircle className="w-5 h-5 mr-2 
                  flex-shrink-0 mt-0.5" />
                {displayError}
              </div>
            )}

            {/* Email Input with Icon */}
            <div>
              <label 
                htmlFor="email"
                className="block text-sm font-semibold 
                  text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 
                  flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 border 
                    border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 
                    focus:ring-purple-500 
                    focus:border-transparent 
                    transition-all duration-200 
                    hover:border-gray-400 text-primary 
                    placeholder-gray-400"
                  placeholder="email@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input with Icon & Toggle */}
            <div>
              <label 
                htmlFor="password"
                className="block text-sm font-semibold 
                  text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 
                  flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handlePasswordBlur}
                  className="w-full pl-12 pr-12 py-3 border 
                    border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 
                    focus:ring-purple-500 
                    focus:border-transparent 
                    transition-all duration-200 
                    hover:border-gray-400 text-primary 
                    placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 
                    -translate-y-1/2 text-gray-400 
                    hover:text-gray-600 transition-colors 
                    focus:outline-none"
                  disabled={loading}
                  aria-label={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Real-time Password Rules Checklist */}
              {formData.password && (
                <div className="mt-3 space-y-2">
                  <PasswordRule 
                    met={passwordRules.minLength}
                    text="Tối thiểu 8 ký tự"
                  />
                  <PasswordRule 
                    met={passwordRules.hasUpperCase}
                    text="Ít nhất 1 chữ hoa (A-Z)"
                  />
                  <PasswordRule 
                    met={passwordRules.hasLowerCase}
                    text="Ít nhất 1 chữ thường (a-z)"
                  />
                  <PasswordRule 
                    met={passwordRules.hasNumber}
                    text="Ít nhất 1 số (0-9)"
                  />
                </div>
              )}
            </div>

            {/* Confirm Password Input with Icon & Toggle */}
            <div>
              <label 
                htmlFor="confirmPassword"
                className="block text-sm font-semibold 
                  text-gray-700 mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 
                  flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-3 border 
                    border-gray-300 rounded-xl 
                    focus:outline-none focus:ring-2 
                    focus:ring-purple-500 
                    focus:border-transparent 
                    transition-all duration-200 
                    hover:border-gray-400 text-primary 
                    placeholder-gray-400"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => 
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-4 top-1/2 
                    -translate-y-1/2 text-gray-400 
                    hover:text-gray-600 transition-colors 
                    focus:outline-none"
                  disabled={loading}
                  aria-label={
                    showConfirmPassword 
                      ? 'Hide confirm password' 
                      : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Register Button with Gradient & Animation */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r 
                from-purple-600 to-pink-600 
                hover:from-purple-700 hover:to-pink-700 
                text-white font-semibold rounded-xl shadow-lg 
                hover:shadow-xl focus:outline-none focus:ring-2 
                focus:ring-purple-500 focus:ring-offset-2 
                transition-all duration-200 
                transform hover:scale-[1.02] 
                active:scale-[0.98] disabled:opacity-50 
                disabled:cursor-not-allowed 
                disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center 
                  justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 
                    h-5 w-5 text-white" />
                  Đang đăng ký...
                </span>
              ) : (
                'Đăng ký'
              )}
            </button>

            {/* Divider with "Or" */}
            <div className="relative">
              <div className="absolute inset-0 flex 
                items-center">
                <div className="w-full border-t 
                  border-gray-300"></div>
              </div>
              <div className="relative flex justify-center 
                text-sm">
                <span className="px-4 bg-white text-gray-500 
                  font-medium">
                  Hoặc
                </span>
              </div>
            </div>

            {/* Google Sign Up Button with Hover Effect */}
            <button
              type="button"
              onClick={() => signIn('google', { 
                callbackUrl: '/dashboard' 
              })}
              className="w-full flex items-center 
                justify-center px-4 py-3 border-2 
                border-gray-300 rounded-xl bg-white 
                hover:bg-gray-50 hover:border-gray-400 
                focus:outline-none focus:ring-2 
                focus:ring-purple-500 transition-all 
                duration-200 group transform hover:scale-[1.02] 
                active:scale-[0.98]"
              disabled={loading}
            >
              <svg
                className="w-5 h-5 mr-3"
                viewBox="0 0 533.5 544.3"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                role="img"
              >
                <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.6h146.9c-6.4 34.1-25.9 63-55.4 82.4v68.2h89.4C497.5 418.8 533.5 352.5 533.5 278.4z" />
                <path fill="#34A853" d="M272 544.3c74.6 0 137.2-24.7 182.9-66.9l-89.4-68.2c-24.7 16.6-56.2 26.5-93.5 26.5-71.8 0-132.6-48.5-154.4-113.7H26.5v71.4C71.9 488.8 166.2 544.3 272 544.3z" />
                <path fill="#FBBC05" d="M117.6 321.9c-5.4-16-8.5-33-8.5-50.4 0-17.4 3.1-34.4 8.5-50.4V149.7H26.5C9.5 186.6 0 228.7 0 271.1s9.5 84.4 26.5 121.4l91.1-70.6z" />
                <path fill="#EA4335" d="M272 107.7c39.6 0 75.1 13.6 103.1 40.2l77.4-77.4C407.6 24.5 345 0 272 0 166.2 0 71.9 55.5 26.5 149.7l91.1 71.4C139.4 156.2 200.2 107.7 272 107.7z" />
              </svg>
              <span className="text-sm font-semibold text-gray-700 
                group-hover:text-primary">
                Đăng ký với Google
              </span>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600">Đã có tài khoản? </span>
            <Link
              href="/login"
              className="text-purple-600 hover:text-purple-700 
                font-semibold transition-colors"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { 
              transform: translateX(-5px); 
            }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          
          .animate-shake {
            animation: shake 0.5s ease-in-out;
          }
        `
      }} />
    </div>
  );
}

// Password Rule Component
function PasswordRule({ 
  met, 
  text 
}: { 
  met: boolean; 
  text: string 
}) {
  return (
    <div 
      className={`
        flex items-center gap-2 text-sm transition-all 
        duration-300
        ${met ? 'text-green-600' : 'text-gray-500'}
      `}
    >
      <div 
        className={`
          flex-shrink-0 w-4 h-4 rounded-full flex 
          items-center justify-center transition-all 
          duration-300
          ${met 
            ? 'bg-green-500 scale-100' 
            : 'bg-gray-300 scale-90'
          }
        `}
      >
        {met && (
          <Check 
            className="w-3 h-3 text-white" 
            strokeWidth={3} 
          />
        )}
      </div>
      <span className="font-medium">{text}</span>
    </div>
  );
}
