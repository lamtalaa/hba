import { supabase } from '../../supabase.js';
import React, { useState } from 'react';
import './Login.css'; // 根据您的实际设置调整路径
import test from '../../images/Login.png';

function Login({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 添加状态来跟踪用户是否已登录

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleLoginFormSubmit = async (event) => {
    event.preventDefault();

    let login;
    let error;

    try {
      ({ data: login, error } = await supabase
        .from('login')
        .select('name, pin')
        .eq('name', username)
        .single());

      if (error) {
        throw error;
      }

      if (!login || login.pin !== password) {
        throw new Error('Incorrect username or password');
      }

      setLoginErrorMessage('');
      setIsLoggedIn(true); // 设置为已登录状态
      onSuccess(username); // 登录成功时调用父组件传递的成功回调函数

    } catch (error) {
      if (!login) {
        setLoginErrorMessage('Incorrect username or password');
      } else {
        setLoginErrorMessage(error.message);
      }
    }
  };

  return (
    <div className="login-popup">
      <img src={test} alt="Test Image" />
      <form onSubmit={handleLoginFormSubmit}>
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={handleUsernameChange}
          placeholder="Username"
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={handlePasswordChange}
          placeholder="Password"
        />
        {loginErrorMessage && <div className="error-message">{loginErrorMessage}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;