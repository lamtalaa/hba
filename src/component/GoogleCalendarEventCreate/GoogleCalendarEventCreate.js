import React, { useEffect, useRef, useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import moment from 'moment';
import { toast, ToastContainer } from 'react-toastify';
import './GoogleCalendarEventCreate.css'; 

function GoogleCalendarEvent({ selectedDate2, sunrise, sunset, parentTime, selectedLocation }) {

    const session = useSession();
    const sunriseMoment = moment(sunrise, 'HH:mm:ss');
    const sunsetMoment = moment(sunset, 'HH:mm:ss');
    const [isButtonPressed, setIsButtonPressed] = useState(false);
    const wasButtonPreviouslyPressed = useRef(false);
    const [selectedCalendar, setSelectedCalendar] = useState('primary');
    const [calendars, setCalendars] = useState([]);
    const meetingTime = parentTime === 'AM' ? sunriseMoment : sunsetMoment;
    const date = selectedDate2.format('YYYY-MM-DD');
    const formattedMeetingTime = meetingTime.format('HH:mm:ss');

    let formattedTime = null;
    try {
        formattedTime = moment(formattedMeetingTime, 'h:mm A').format('HH:mm:ss');
    } catch (error) {
        console.error('Error parsing formattedMeetingTime:', error.message);
    }

    const handleButtonPress = () => {
        if (formattedTime) {
            setIsButtonPressed(true);
        }
    };

    const handleButtonRelease = () => {
        setIsButtonPressed(false);
    };

    const handleCalendarChange = (event) => {
        setSelectedCalendar(event.target.value);
    };

    useEffect(() => {
        if (isButtonPressed && !wasButtonPreviouslyPressed.current && formattedTime && session && session.provider_token) {
            createGoogleCalendarEvent();
        }
        wasButtonPreviouslyPressed.current = isButtonPressed;
    }, [isButtonPressed, formattedTime, session, selectedCalendar]);

    useEffect(() => {
        fetchCalendars();
    }, [session]);

    async function fetchCalendars() {

        try {
            const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch calendars');
            }
    
            const data = await response.json();
           
            const filteredCalendars = data.items.filter(calendar => !calendar.primary && !calendar.summary.includes('Birthdays'));
            setCalendars(filteredCalendars);
        } catch (error) {
            console.error('Error fetching calendars:', error.message);
        }
    }

    async function createGoogleCalendarEvent() {

        try {
            const event = {
                'summary': `${selectedLocation} Appointment`,
                'location': selectedLocation,
                'colorId': 3,
                'start': {
                    'dateTime': `${date}T${formattedTime}`,
                    'timeZone': 'America/New_York'
                },
                'end': {
                    'dateTime': `${date}T${formattedTime}`,
                    'timeZone': 'America/New_York'
                },
                'reminders': {
                    'useDefault': true
                }
            };

            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${selectedCalendar}/events`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(event)
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(`Failed to create Google Calendar event: ${data.error.message}`);
            }

            const data = await response.json();
            console.log('Google Calendar event created successfully!', data);
            toast.success(`Google Calendar event created successfully!`);
        } catch (error) {
            console.error('Error creating Google Calendar event:', error.message);
            toast.error(`Error creating Google Calendar event.`);
        }
    }

    return (
        
        <div className="google-calendar-event-container"> 
        <h4> Calendar Selection </h4>
            <select value={selectedCalendar} onChange={handleCalendarChange}>
                <option value="primary">Primary Calendar</option>
                {calendars.map((calendar) => (
                    <option key={calendar.id} value={calendar.id}>
                        {calendar.summary}
                    </option>
                ))}
            </select>
            <button className="create-event-button" onMouseDown={handleButtonPress} onMouseUp={handleButtonRelease}>
                Create Google Calendar Event
            </button>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}

export default GoogleCalendarEvent;
