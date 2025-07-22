import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError('');

    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <Sparkles className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white drop-shadow-md dark:text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
            Welcome to Trendulum
          </h2>
          <p className="mt-2 text-center text-sm text-white drop-shadow-md dark:text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white drop-shadow-md dark:text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={`input-field mt-1 ${errors.email ? 'border-red-300' : ''}`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white drop-shadow-md dark:text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  className={`input-field pr-10 ${errors.password ? 'border-red-300' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex justify-center py-3"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
          <div className="text-center">
            <p className="text-sm text-white drop-shadow-md dark:text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-primary-200 hover:text-primary-100 underline drop-shadow-md"
                style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}
              >
                Sign up here
              </Link>
            </p>
          </div>
          </div>
        </form>

        <div className="mt-8 text-center">
        <div className="mt-8 text-center">
          <p className="text-xs text-white drop-shadow-md dark:text-white" style={{textShadow: '0 2px 8px rgba(0,0,0,0.5)'}}>
            By signing in, you agree to our <span className="underline">Terms of Service</span> and <span className="underline">Privacy Policy</span>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 