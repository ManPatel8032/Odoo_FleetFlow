import React from 'react';
import './auth.styles.css';

const Login: React.FC = () => {
  return (
    <div className="login-page">
      <h1>Login</h1>
      <form>
        <label>
          Email:
          <input type="email" name="email" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};

export default Login;
