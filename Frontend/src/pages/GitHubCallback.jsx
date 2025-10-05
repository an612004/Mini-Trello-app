import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';

const GitHubCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        
        // Save to Redux store
        dispatch(loginSuccess({ token, user }));
        
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Error processing GitHub callback:', error);
        navigate('/login?error=github_auth_failed');
      }
    } else {
      navigate('/login?error=github_auth_failed');
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-medium text-gray-900">Processing GitHub Authentication...</h2>
        <p className="text-gray-600 mt-2">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
};

export default GitHubCallback;