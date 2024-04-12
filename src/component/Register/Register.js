import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase'; // 根据你的实际路径进行调整
import './Register.css';

function Register() {
  const [name, setUsername] = useState(''); // 将注册的用户名作为独立的状态
  const [pin, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [scope, setPermission] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [owner, setOwner] = useState(false); // 添加 owner 状态
  const [loginData, setLoginData] = useState([]);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [deletingUser, setDeletingUser] = useState('');
  const [editingUser, setEditingUser] = useState('');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editScope, setEditPermission] = useState('');

  // 提升 checkPermission 函数的定义
  const checkPermission = async (name) => { // 接受用户名作为参数
    try {
      // 查询所有用户的登录数据
      const { data: allLoginData, error } = await supabase
        .from('login')
        .select('*');

      if (error) {
        throw error;
      }

      // 存储用户的权限信息
      const login = allLoginData.find(user => user.name === name); // 查找当前登录用户的信息
      if (login && login.scope) {
        setPermission(login.scope);

        if (login.scope !== 'owner') {
          // 如果用户权限不是 owner，则重定向到其他页面或者显示相应的提示信息
          console.log('Permission denied. Redirecting...');
          setOwner(false);
        } else {
          setOwner(true);
          console.log('You are owner!');
        }
      } else {
        console.log('User not found or scope not defined.');
        setOwner(false);
      }

      // 将所有登录数据设置到状态中
      setLoginData(allLoginData);
    } catch (error) {
      console.error('Error checking permission:', error.message);
    }
  };

  useEffect(() => {
    let mounted = true; // 设置一个标志来跟踪组件是否已经卸载

    const usernameFromLocal = localStorage.getItem('username');
    if (usernameFromLocal) {
      checkPermission(usernameFromLocal); // 使用当前登录用户名来检查权限
    }

    // 组件卸载时执行清理逻辑
    return () => {
      mounted = false;
    };
  }, [name]); // 使用 name 作为依赖项

  const handleRegister = async (event) => {
    event.preventDefault();

    try {
      // 检查用户名和密码是否为空
      if (!name || !pin) {
        throw new Error('Username and password are required.');
      }

      // 在Supabase中插入注册信息到login表
      const { data, error } = await supabase
        .from('login')
        .insert([
          { name, pin, email}
        ])
        .select();

      if (error) {
        throw error;
      }

      console.log('Account registered successfully:', data);

      // 清空表单
      setUsername('');
      setPassword('');
      setEmail('');
      setPermission('');
      setErrorMessage('');
      // 关闭注册浮窗
      setShowRegisterPopup(false);

      window.location.reload();
    } catch (error) {
      // 处理错误
      console.error('Error registering account:', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      // 在Supabase中删除指定用户名的数据
      const { data, error } = await supabase
        .from('login')
        .delete()
        .eq('name', deletingUser);

      if (error) {
        throw error;
      }

      console.log('Account deleted successfully:', data);

      // 关闭确认浮窗
      setShowConfirmationPopup(false);

      // 刷新数据
      const { data: refreshedData, error: refreshError } = await supabase
        .from('login')
        .select('*');

      if (refreshError) {
        throw refreshError;
      }

      setLoginData(refreshedData);
    } catch (error) {
      console.error('Error deleting account:', error.message);
      setErrorMessage(error.message);
    }
  };

  const handleEdit = async (event) => {
    event.preventDefault();

    try {
      // 在Supabase中更新指定用户名的数据
      const { data, error } = await supabase
        .from('login')
        .update({ name: editName, email: editEmail})
        .eq('name', editingUser);

      if (error) {
        throw error;
      }

      console.log('Account updated successfully:', data);

      // 关闭编辑浮窗
      setShowEditPopup(false);

      // 刷新数据
      const { data: refreshedData, error: refreshError } = await supabase
        .from('login')
        .select('*');

      if (refreshError) {
        throw refreshError;
      }

      setLoginData(refreshedData);
    } catch (error) {
      console.error('Error editing account:', error.message);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="register-container">
      <h2>User Management</h2>
      {owner && ( // 只有 owner 为 true 时才显示用户管理表格
        <table className="login-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Scope</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {loginData.map((login, index) => (
              <tr key={index}>
                <td>{login.name}</td>
                <td>{login.email}</td>
                <td>{login.scope}</td>
                <td>
                  <button className="edit-button" onClick={() => {
                    setEditingUser(login.name);
                    setEditName(login.name);
                    setEditEmail(login.email);
                    setEditPermission(login.scope);
                    setShowEditPopup(true);
                  }}>Edit</button>
                </td>
                <td>
                  <button className="delete-button" onClick={() => {
                    setDeletingUser(login.name);
                    setShowConfirmationPopup(true);
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {owner && ( // 只有 owner 为 true 时才显示注册按钮
        <button className="register-button" onClick={() => setShowRegisterPopup(true)}>Register</button>
      )}
      {showRegisterPopup && (
        <div className="register-popup">
          <div className="register-form">
            <span className="close-button" onClick={() => setShowRegisterPopup(false)}>X</span>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={name}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={pin}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              <button type="submit">Register</button>
            </form>
          </div>
        </div>
      )}
      {showEditPopup && (
        <div className="register-popup">
          <div className="register-form">
            <span className="close-button" onClick={() => setShowEditPopup(false)}>X</span>
            <h2>Edit</h2>
            <form onSubmit={handleEdit}>
              <label htmlFor="edit-username">Username:</label>
              <input
                type="text"
                id="edit-username"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <label htmlFor="edit-email">Email:</label>
              <input
                type="email"
                id="edit-email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
              />
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              <div className="button-group">
                <button type="submit">Save</button>
                <button onClick={() => setShowEditPopup(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showConfirmationPopup && (
        <div className="confirmation-popup">
          <div className="confirmation-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete the user "{deletingUser}"?</p>
            <div className="button-group">
              <button className="confirm-button" onClick={handleDelete}>Confirm</button>
              <button className="cancel-button" onClick={() => setShowConfirmationPopup(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Register;