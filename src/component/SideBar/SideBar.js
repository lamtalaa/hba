import React, { useState, useEffect, useRef } from 'react';
import homeIcon from '../../images/homeIcon.png';
import customerInputIcon from '../../images/customerInputIcon.png';
import customerInfoIcon from '../../images/customerInfoIcon.png';
import appointmentIcon from '../../images/appointmentIcon.png';
import SettingIcon from '../../images/SettingIcon.png';
import SignOut from '../../images/SignOut.png';
import Login from '../Login/Login';
import Modal from '../Modal/Modal';

import './SideBar.css';

function Sidebar({ setService }) {

    const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
    const [collapsed, setCollapsed] = useState(true); // Default is false, you can modify this according to your actual situation
    const sidebarRef = useRef(null);
    const [username, setUsername] = useState(localStorage.getItem('username') || ''); // Get username state from local storage
    const [currentService, setCurrentService] = useState(localStorage.getItem('currentService') || ''); // Get current service state from local storage

    useEffect(() => {
        // Update the local storage with the login status
        localStorage.setItem('isLoggedIn', isLoggedIn);
    }, [isLoggedIn]);

    const handleMouseEnter = () => {
        setCollapsed(false);
    };

    const handleMouseLeave = () => {
        setCollapsed(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false); // Update login status to false
        window.location.reload();
        localStorage.removeItem('isLoggedIn'); // Remove login status from local storage
        localStorage.removeItem('username'); // Remove username from local storage
        localStorage.removeItem('currentService'); // Remove current service from local storage
        setUsername(''); // Clear username
        setCurrentService(''); // Clear current service
    };

    const setServiceAndCloseMenu = (serviceName) => {

        setService(serviceName);
        setCurrentService(serviceName);
        setCollapsed(false);

        // Update the currentService value in local storage
        localStorage.setItem('currentService', serviceName);
    };

    const [isLoginSuccessVisible, setIsLoginSuccessVisible] = useState(false);

    const handleLoginSuccess = (username) => {
        setIsLoggedIn(true);
        setIsLoginSuccessVisible(true); // Show login success popup when login succeeds
        setUsername(username); // Set the username
        console.log('Logged in as:', username); // Print the username to the console
        localStorage.setItem('isLoggedIn', true);
        localStorage.setItem('username', username); // Store the username in local storage
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
                                    <button 
                                        onClick={() => setServiceAndCloseMenu('Overview')} 
                                        className={`expanded-menu-button ${currentService === 'Overview' ? 'active' : ''}`}
                                    >
                                        <div className="button-content">
                                            <img src={homeIcon} alt="Home" />
                                            <span>Home</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setServiceAndCloseMenu('Customer Information Form')} 
                                        className={`expanded-menu-button ${currentService === 'Customer Information Form' ? 'active' : ''}`}
                                    >
                                        <div className="button-content">
                                            <img src={customerInputIcon} alt="Customer Input" />
                                            <span>Customer Form</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setServiceAndCloseMenu('Customer Information')} 
                                        className={`expanded-menu-button ${currentService === 'Customer Information' ? 'active' : ''}`}
                                    >
                                        <div className="button-content">
                                            <img src={customerInfoIcon} alt="Customer Info" />
                                            <span>Customer Search</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setServiceAndCloseMenu('Appointment')} 
                                        className={`expanded-menu-button ${currentService === 'Appointment' ? 'active' : ''}`}
                                    >
                                        <div className="button-content">
                                            <img src={appointmentIcon} alt="Appointment" />
                                            <span>Appointment</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setServiceAndCloseMenu('Settings')} 
                                        className={`expanded-menu-button ${currentService === 'Settings' ? 'active' : ''}`}
                                    >
                                        <div className="button-content">
                                            <img src={SettingIcon} alt="Settings" />
                                            <span>Setting</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={handleLogout} 
                                        className={`expanded-menu-button ${currentService === 'SignOut' ? 'active' : ''}`}
                                    >
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
