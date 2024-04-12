import React, { useState, useEffect, useRef } from 'react';
import homeIcon from '../../images/homeIcon.png';
import customerInputIcon from '../../images/customerInputIcon.png';
import customerInfoIcon from '../../images/customerInfoIcon.png';
import appointmentIcon from '../../images/appointmentIcon.png';
import SettingIcon from '../../images/SettingIcon.png';
import SignOut from '../../images/SignOut.png';
import './SideBar.css'; // 根据您的实际设置调整路径
import Login from '../Login/Login';

function Sidebar({ setService }) {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const [collapsed, setCollapsed] = useState(true); // 默认为false，您可以根据实际情况修改
  const sidebarRef = useRef(null);
  const [username, setUsername] = useState(localStorage.getItem('username') || ''); // 从本地存储中获取用户名状态
  const [currentService, setCurrentService] = useState(localStorage.getItem('currentService') || ''); // 从本地存储中获取当前页面状态
  
  useEffect(() => {
    // 更新本地存储的登录状态
    localStorage.setItem('isLoggedIn', isLoggedIn);
  }, [isLoggedIn]);

  const handleMouseEnter = () => {
    setCollapsed(false);
  };

  const handleMouseLeave = () => {
    setCollapsed(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false); // 更新登录状态为false
    window.location.reload();
    localStorage.removeItem('isLoggedIn'); // 从本地存储中移除登录状态
    localStorage.removeItem('username'); // 从本地存储中移除用户名
    localStorage.removeItem('currentService'); // 从本地存储中移除当前页面
    setUsername(''); // 清空用户名
    setCurrentService(''); // 清空当前页面
  };

  const setServiceAndCloseMenu = (serviceName) => {
    setService(serviceName);
    setCurrentService(serviceName);
    setCollapsed(false);
  
    // 更新本地存储中的 currentService 值
    localStorage.setItem('currentService', serviceName);
  };

  const [isLoginSuccessVisible, setIsLoginSuccessVisible] = useState(false);

  const handleLoginSuccess = (username) => {
    setIsLoggedIn(true);
    setIsLoginSuccessVisible(true); // 登录成功时显示登录成功浮窗
    setUsername(username); // 设置用户名
    console.log('Logged in as:', username); // 打印用户名到控制台
    localStorage.setItem('isLoggedIn', true);
    localStorage.setItem('username', username); // 将用户名存储在本地存储中
    localStorage.setItem('currentService', 'Overview');
    setTimeout(() => {
      setIsLoginSuccessVisible(false);
      window.location.reload();
    }, 2000);
  };
  

  return (
    <div>
      {!isLoggedIn && <Login onSuccess={handleLoginSuccess} />}
      {isLoggedIn && (
        <div 
          className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}
          ref={sidebarRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <>
            <h3>HBA</h3>
            <div className="sidebar-content">
              {collapsed ? (
                <>
                  <button
                    className={`menu-button ${currentService === 'Overview' ? 'active' : ''}`}
                  >
                    <img src={homeIcon} alt="Home" />
                  </button>
                  <button
                    className={`menu-button ${currentService === 'Customer Information Form' ? 'active' : ''}`}
                  >
                    <img src={customerInputIcon} alt="Customer Input" />
                  </button>
                  <button
                    className={`menu-button ${currentService === 'Customer Information' ? 'active' : ''}`}
                  >
                    <img src={customerInfoIcon} alt="Customer Info" />
                  </button>
                  <button
                    className={`menu-button ${currentService === 'Appointment' ? 'active' : ''}`}
                  >
                    <img src={appointmentIcon} alt="Appointment" />
                  </button>
                  <button
                    className={`menu-button ${currentService === 'Settings' ? 'active' : ''}`}
                  >
                    <img src={SettingIcon} alt="Settings" />
                  </button>
                  <button
                    className={`menu-button ${currentService === 'SignOut' ? 'active' : ''}`}
                  >
                    <img src={SignOut} alt="SignOut" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setServiceAndCloseMenu('Overview')} className={`expanded-menu-button ${currentService === 'Overview' ? 'active' : ''}`}>
                    <div className="button-content">
                      <img src={homeIcon} alt="Home" />
                      <span>Home</span>
                    </div>
                  </button>
                  <button onClick={() => setServiceAndCloseMenu('Customer Information Form')} className={`expanded-menu-button ${currentService === 'Customer Information Form' ? 'active' : ''}`}>
                    <div className="button-content">
                      <img src={customerInputIcon} alt="Customer Input" />
                      <span>Customer Input</span>
                    </div>
                  </button>
                  <button onClick={() => setServiceAndCloseMenu('Customer Information')} className={`expanded-menu-button ${currentService === 'Customer Information' ? 'active' : ''}`}>
                    <div className="button-content">
                      <img src={customerInfoIcon} alt="Customer Info" />
                      <span>Customer Info</span>
                    </div>
                  </button>
                  <button onClick={() => setServiceAndCloseMenu('Appointment')} className={`expanded-menu-button ${currentService === 'Appointment' ? 'active' : ''}`}>
                    <div className="button-content">
                      <img src={appointmentIcon} alt="Appointment" />
                      <span>Appointment</span>
                    </div>
                  </button>
                  <button onClick={() => setServiceAndCloseMenu('Settings')} className={`expanded-menu-button ${currentService === 'Settings' ? 'active' : ''}`}>
                    <div className="button-content">
                      <img src={SettingIcon} alt="Settings" />
                      <span>Setting</span>
                    </div>
                  </button>
                  <button onClick={handleLogout} className={`expanded-menu-button ${currentService === 'SignOut' ? 'active' : ''}`}>
                    <div className="button-content">
                      <img src={SignOut} alt="SignOut" />
                      <span>Sign Out</span>
                    </div>
                  </button>
                </>
              )}
            </div>
            {/* Display success or error message for login */}
            {isLoginSuccessVisible && <div className="login-success-message">Login successful!</div>}
          </>
        </div>
      )}
    </div>
  );
  
}

export default Sidebar;