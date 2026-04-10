import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auth.css';
const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(''); 
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = isLogin 
        ? 'https://civicconnect-m1vy.onrender.com/api/auth/login' 
        : 'https://civicconnect-m1vy.onrender.com/api/auth/register';
        
      const payload = isLogin ? { email, password } : { username, email, password };

      const response = await axios.post(url, payload);

      const { token, username: savedName, _id } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('username', savedName);
      localStorage.setItem('userId', _id);

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>

      <div className="civic-auth-wrapper">
        <div className="civic-auth-panel">
          
          <div className="civic-auth-tabs">
            <button 
              type="button"
              className={`civic-auth-tab-btn ${isLogin ? 'is-active-login' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Log In
            </button>
            <button 
              type="button"
              className={`civic-auth-tab-btn ${!isLogin ? 'is-active-signup' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <div className="civic-auth-body">
            <h3 className={`civic-auth-title ${isLogin ? 'civic-auth-title-login' : 'civic-auth-title-signup'}`}>
              {isLogin ? 'Welcome Back' : 'Join the Community'}
            </h3>
            <p className="civic-auth-subtitle">
              {isLogin ? 'Log in to help your neighborhood.' : 'Create an account to report issues.'}
            </p>

            {error && <div className="civic-auth-error">{error}</div>}

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="civic-auth-input-group">
                  <label className="civic-auth-label">Username</label>
                  <input 
                    type="text" 
                    className="civic-auth-input"
                    placeholder="civic_hero_99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isLogin} 
                  />
                </div>
              )}

              <div className="civic-auth-input-group">
                <label className="civic-auth-label">Email address</label>
                <input 
                  type="email" 
                  className="civic-auth-input"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="civic-auth-input-group">
                <label className="civic-auth-label">Password</label>
                <input 
                  type="password" 
                  className="civic-auth-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className={`civic-auth-submit-btn ${isLogin ? 'civic-auth-btn-login' : 'civic-auth-btn-signup'}`}
              >
                {isLogin ? 'Log In' : 'Create Account'}
              </button>
            </form>

            <div className="civic-auth-toggle-box">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span 
                onClick={toggleMode}
                className={`civic-auth-toggle-link ${isLogin ? 'civic-auth-link-signup' : 'civic-auth-link-login'}`}
              >
                {isLogin ? 'Sign up here' : 'Log in here'}
              </span>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;