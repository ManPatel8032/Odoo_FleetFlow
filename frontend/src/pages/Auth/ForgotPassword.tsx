import React, { useState } from 'react';
import './auth.styles.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement forgot password logic
    setSubmitted(true);
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        {submitted ? (
          <div style={{ textAlign: 'center', color: '#667eea' }}>
            Check your email for password reset instructions
          </div>
        ) : (
          <>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit">Send Reset Link</button>
          </>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;
