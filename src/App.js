import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './component/SideBar/SideBar';
import RenderCalendar from './component/HomeCalendar/HomeCalendar';
import Register from './component/Register/Register';
import ChangePIN from './component/ChangePin/ChangePIN';
import SunriseSunsetComponent from './component/SunriseSunset/SunriseSunsetComponent';
import moment from 'moment-timezone';
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react';

import PageTitle from './component/PageTitle/PageTitle';
import Toggle from './component/Toggle/Toggle';
import GoogleCalendarEvents from './component/GoogleCalendarEvents/GoogleCalendarEvents';
import Address from './component/Address/Address';
import Form from './component/Form/Form';
import Appointment from './component/Appointment/Appointment';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGoogleLoggedIn, setIsGoogleLoggedIn] = useState(false);
  const [service, setService] = useState(localStorage.getItem('currentService') || 'Overview');
  const [selectedDate, setSelectedDate] = useState(moment()); // 默认为当天日期
  const [selectedDate2, setSelectedDate2] = useState(moment());
  const [selectedLocation, setSelectedLocation] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [isDark, setDark] = useState(false);

  const session = useSession();
  const supabase = useSupabaseClient();

  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);

    // 定义处理日出日落时间的函数
    const handleSunriseSunsetTime = (sunriseTime, sunsetTime) => {
        setSunrise(sunriseTime);
        setSunset(sunsetTime);
    };
  useEffect(() => {
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(storedIsLoggedIn);

    const storedGoogleLoggedIn = localStorage.getItem('isGoogleLoggedIn') === 'true';
    setIsGoogleLoggedIn(storedGoogleLoggedIn);

    if (session?.provider_token) {
      setIsGoogleLoggedIn(true);
      console.log('Google is logged in');
    } else {
      if (isGoogleLoggedIn) {
        console.log("LOGGED IN BUT TOKEN EXPIRED");
      }
      console.log('Google is not logged in');
    }

    const storedIsDark = localStorage.getItem('isDark') === 'true';
    const storedIsLight = localStorage.getItem('isLight') === 'true';

    if (storedIsDark || storedIsLight) {
      setDark(storedIsDark);
    } else {
      const defaultDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDark(defaultDarkMode);
    }

    document.body.classList.add(isDark ? 'dark' : 'light');
    const storedService = localStorage.getItem('currentService') || 'Overview';
    setService(storedService);  
  }, [session, setService]);

  useEffect(() => {
    console.log('Login status changed(App):', isLoggedIn);
  }, [isLoggedIn]);

  async function googleSignIn() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar'
      }
    });
    if (error) {
      alert("Error logging in to Google provider with Supabase");
      console.log(error);
    } else {
      setIsGoogleLoggedIn(true);
      setIsLoggedIn(true);
      localStorage.setItem('isGoogleLoggedIn', 'true');
    }
  };

  async function googlesignOut() {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setIsGoogleLoggedIn(false);
    localStorage.removeItem('isGoogleLoggedIn');
    window.location.reload();
  }

  const handleDateSelect = (date) => {
    console.log('Selected date:', date.format('YYYY-MM-DD'));
    setSelectedDate(date);
  };

  const handleDateSelect2 = (date) => {
    console.log('Selected date:', date.format('YYYY-MM-DD'));
    setSelectedDate2(date);
  };

  const handleDarkToggle = () => {
    if (isDark) {
      localStorage.removeItem('isDark');
      localStorage.setItem('isLight', 'true');
    } else {
      localStorage.removeItem('isLight');
      localStorage.setItem('isDark', 'true');
    }

    document.body.classList.remove(isDark ? 'dark' : 'light');
    document.body.classList.add(isDark ? 'light' : 'dark');
    setDark(!isDark);
  }

  // 处理地址提交
  const handleAddressSubmit = (newCoords) => {
      console.log('坐标:', newCoords); // 修正此处的变量名为 newCoords
      setCoordinates(newCoords);
  };

  return (
    <div className="App">
      <Sidebar isLoggedIn={isLoggedIn} setService={setService}/>

      <div className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {isLoggedIn ? (
          <>
            {isGoogleLoggedIn ? (
              <>
                {service === 'Overview' ? (
                  <div className="home-container">
                    <PageTitle service={service}/>
                    <div className="calendar-parent-container">
                        <RenderCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect} />
                        <div className="side-content-container">
                          <GoogleCalendarEvents selectedDate={selectedDate}>
                            <Address onAddressSubmit={handleAddressSubmit} setSelectedLocation={setSelectedLocation}/>
                            <SunriseSunsetComponent 
                            coordinates={coordinates} 
                            selectedDate={selectedDate} 
                            selectedLocation={selectedLocation}
                            onSunriseSunsetTime={handleSunriseSunsetTime}/>
                          </GoogleCalendarEvents>
                        </div>
                    </div>
                  </div>
                ) : (
                  <PageTitle service={service}/>
                )}
                {service === 'Settings' && (
                  <div className="settings-container">
                    <h2>Settings</h2>
                    <Register />
                    <ChangePIN />
                  </div>
                )}
                {service === 'Customer Information Form' && (
                  <Form/>
                )}
                {service === 'Appointment' && (
                  <div>
                  <div className="calendar-parent-container">
                    <RenderCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect2} />
                    <Appointment selectedDate2={selectedDate2} 
                    sunrise={sunrise} 
                    sunset={sunset}
                    selectedLocation={selectedLocation}/>
                  </div>
                  <div className="side_appointment_page">
                  <Address onAddressSubmit={handleAddressSubmit} setSelectedLocation={setSelectedLocation}/>
                  <SunriseSunsetComponent 
  coordinates={coordinates} 
  selectedDate={selectedDate2} 
  selectedLocation={selectedLocation} 
  onSunriseSunsetTime={handleSunriseSunsetTime}
/>
                  </div>
                  </div>
                )}
              </>
            ) : (
              <div className="login-container">
                <h2>Please Login</h2>
                <button onClick={googleSignIn} className="logon-button">Google Sign In</button>
              </div>
            )}
            <div className="account-container">
              <button 
                onClick={isGoogleLoggedIn ? googlesignOut : googleSignIn} 
                className="google-signin-button"
                style={{ backgroundColor: isGoogleLoggedIn ? 'green' : 'red' }}
              >
                {isGoogleLoggedIn ? 'Google Sign Out' : 'Google Sign In'}
              </button>
              <Toggle status={ isDark } method={ handleDarkToggle }/>
            </div>
          </>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default App;