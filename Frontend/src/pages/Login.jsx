import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, User, Eye, EyeOff, Github, AlertCircle } from 'lucide-react';
import { authAPI } from '../services/api';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'code'
  const [mode, setMode] = useState('signin'); // 'signin' or 'signup'
  const [loading, setLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [error, setError] = useState('');
  
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'github_auth_failed') {
      setError('GitHub authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await authAPI.sendCode(email, mode);
      setStep('code');
      alert('Verification code sent to your email!');
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || 'Failed to send code';
      
      // Hiển thị gợi ý thông minh dựa trên backend response
      if (errorData?.suggestSignup) {
        if (window.confirm(`${errorMessage}\n\nWould you like to switch to Sign Up mode?`)) {
          setMode('signup');
        }
      } else if (errorData?.suggestSignin) {
        if (window.confirm(`${errorMessage}\n\nWould you like to switch to Sign In mode?`)) {
          setMode('signin');
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) return;

    dispatch(loginStart());
    setLoading(true);
    
    try {
      let response;
      if (mode === 'signin') {
        response = await authAPI.signin({ email, verificationCode: code });
      } else {
        response = await authAPI.signup({ email, verificationCode: code });
      }
      dispatch(loginSuccess(response.data));
      navigate('/dashboard');
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.error || `${mode} failed`));
      alert(error.response?.data?.error || `${mode} failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = () => {
    window.location.href = authAPI.githubAuth();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
  <div className="bg-white shadow-lg rounded-2xl p-8">
    {/* 🌸 Hình bên trái */}
    <img
      src="/assets/left image.png"
      alt="left decoration"
      className="absolute bottom-0 left-0 w-25 h-25 object-contain opacity-80"
    />

    {/* 🌸 Hình bên phải */}
    <img
      src="/assets/right image.png"
      alt="right decoration"
      className='absolute bottom-0 right-0 w-25 h-25 object-contain opacity-80'
    />

        <div className="text-center mb-8">
          <a href="/">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-20 h-20 object-contain bg-centered bg-no-repeat mx-auto mb-4"
            />
          </a>
        </div>
        {error && (
          <div className="center mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 bg-red-50" />
            <p className="bg-red-50 text-sm">{error}</p>
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showCode ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !code}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (mode === 'signin' ? 'Signing in...' : 'Signing up...') : (mode === 'signin' ? 'Sign In' : 'Sign Up')}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGithubAuth}
            className="mt-4 w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <Github className="w-5 h-5" />
            <span>GitHub</span>
          </button>
        </div>
<div className='mt-4 text-center text-gray-500'>
          <p>Privacy Policy</p>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-600">
           This site is protected by reCAPTCHA and the Google Privacy
            <div className='mt-4 text-center text-blue-500'>
            Policy and Terms of Service apply.
            </div>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;