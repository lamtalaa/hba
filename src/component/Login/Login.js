import { supabase } from '../../supabase.js';
import React, { useState } from 'react';

import LoginImage from '../../images/Login.png';

import './Login.css'; // 根据您的实际设置调整路径

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
                .from('Employee')
                .select('Name, Pin')
                .eq('Name', username)
                .single());

            if (error) {
                throw error;
            }

            if (!login || login.Pin !== password) {
                throw new Error('Incorrect username or password');
            }

            setLoginErrorMessage('');
            setIsLoggedIn(true); // 设置为已登录状态
            onSuccess(username); // 登录成功时调用父组件传递的成功回调函数

        } catch (error) {
            if (!login) {
                setLoginErrorMessage('Incorrect username or password');
                console.error(error.message);
            } else {
                setLoginErrorMessage(error.message);
            }
        }
    };

    return (

        <div className="login-popup">
            <img src={LoginImage} alt="Login Image" />
            <form onSubmit={handleLoginFormSubmit}>
                <label htmlFor="username">Username</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="Username"
                />
                <label htmlFor="password">Password</label>
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
