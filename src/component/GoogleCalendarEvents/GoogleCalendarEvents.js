import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { useSession } from '@supabase/auth-helpers-react';
import './GoogleCalendarEvents.css';
import Accordion from '../Accordion/Accordion';

function GoogleCalendarEvents({ selectedDate, children }) {
    const [eventsOnSelectedDate, setEventsOnSelectedDate] = useState([]);
    const session = useSession();
    const [calendars, setCalendars] = useState([]);
    const [selectedCalendars, setSelectedCalendars] = useState([]);
    const [selectedCalendarIds, setSelectedCalendarIds] = useState([]); // 定义选择的日历ID数组
    const [selectedCalendarNames, setSelectedCalendarNames] = useState([]); // 定义选择的日历名称数组

    // Initialize selected calendars from previous use
    useEffect(() => {

        const update = localStorage.getItem("RestoreCalendars");
        if (update === "true" && localStorage.getItem("selectedCalendars") !== null ) {
            setSelectedCalendars(JSON.parse(localStorage.getItem("selectedCalendars")));
            setSelectedCalendarIds(JSON.parse(localStorage.getItem("selectedCalendarIds")));
            setSelectedCalendarNames(JSON.parse(localStorage.getItem("selectedCalendarNames")));

            localStorage.removeItem("RestoreCalendars");
        }
    }, []);

    useEffect(() => { 
    }, [selectedCalendars, selectedCalendarIds, selectedCalendarNames])
    
    useEffect(() => {
        async function fetchCalendars() {
            try {
                const response = await fetch(`https://www.googleapis.com/calendar/v3/users/me/calendarList`, {
                    method: "GET",
                    headers: {
                        'Authorization': 'Bearer ' + session.provider_token,
                    },
                });
                const data = await response.json();
                setCalendars(data.items.filter(calendar => calendar.accessRole !== "reader" && calendar.id !== "birthdays")); // 排除只读日历和生日日历
            } catch (error) {
                console.error("Error fetching calendars:", error);
            }
        }

        fetchCalendars();
    }, [session]);

    useEffect(() => {

        if (localStorage.getItem("RestoreCalendars") !== null) {
            localStorage.setItem("selectedCalendars", JSON.stringify(selectedCalendars));
            localStorage.setItem("selectedCalendarIds", JSON.stringify(selectedCalendarIds));
            localStorage.setItem("selectedCalendarNames", JSON.stringify(selectedCalendarNames));
        } else {
            localStorage.setItem("RestoreCalendars", "true");
        }

        async function fetchEventsOnSelectedDate() {
            if (!selectedDate || !session || !session.provider_token || selectedCalendarIds.length === 0) {
                return;
            }
        
            const startDate = moment(selectedDate).startOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
            const endDate = moment(selectedDate).endOf('day').format('YYYY-MM-DDTHH:mm:ssZ');
            
            const allEvents = [];

            // Fetch events for each selected calendar
            for (const calendarId of selectedCalendarIds) {
                try {
                    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${startDate}&timeMax=${endDate}`, {
                        method: "GET",
                        headers: {
                            'Authorization': 'Bearer ' + session.provider_token,
                        },
                    });
                    const data = await response.json();

                    // Add calendar name to each event
                    const eventsWithCalendarName = data.items.map(event => {
                        return {
                            ...event,
                            calendarName: selectedCalendarNames[selectedCalendarIds.indexOf(calendarId)]
                        };
                    });

                    allEvents.push(...eventsWithCalendarName);
                } catch (error) {
                    console.error("Error fetching events on selected date:", error);
                }
            }

            // Sort events by start time
            allEvents.sort((a, b) => moment(a.start.dateTime).valueOf() - moment(b.start.dateTime).valueOf());

            setEventsOnSelectedDate(allEvents);
        }

        fetchEventsOnSelectedDate();
    }, [selectedDate, session, selectedCalendars, selectedCalendarIds, selectedCalendarNames]);

    const handleSelectCalendar = (calendarId, calendarName) => {
        if (!selectedCalendarIds.includes(calendarId)) {
            let updatedIds = [...selectedCalendarIds, calendarId];
            let updatedNames = [...selectedCalendarNames, calendarName];
            
            // 更新selectedCalendars
            let updatedCalendars = [...selectedCalendars, calendars.find(calendar => calendar.id === calendarId)];
    
            setSelectedCalendarIds(updatedIds);
            setSelectedCalendarNames(updatedNames);
            setSelectedCalendars(updatedCalendars); // 更新selectedCalendars
    
        } else {
            // Remove calendarName if already selected
            const updatedIds = selectedCalendarIds.filter(id => id !== calendarId);
            const updatedNames = selectedCalendarNames.filter(name => name !== calendarName);
            
            // 更新selectedCalendars
            let updatedCalendars = selectedCalendars.filter(calendar => calendar.id !== calendarId);
    
            setSelectedCalendarIds(updatedIds);
            setSelectedCalendarNames(updatedNames);
            setSelectedCalendars(updatedCalendars); // 更新selectedCalendars
    
        }
    };

    return (
        <>
            <Accordion icon="Calendar">
            <div className="calendar-list">
                <ul>
                    {calendars.length > 0 ? calendars.map(calendar => (
                        <li key={calendar.id}>
                            <input
                                type="checkbox"
                                id={calendar.id}
                                checked={selectedCalendars.some(selected => selected.id === calendar.id)}
                                onChange={() => handleSelectCalendar(calendar.id, calendar.summary)}
                            />
                            <label htmlFor={calendar.id}>{calendar.summary}</label>
                        </li>
                    )) : 
                        <p>Google Access Token Expired -- Please sign into your Google Account again</p>
                        /* Need to add refresh token functionality */
                    }
                </ul>
            </div>
            </Accordion>
            <div className="location-suntime-container">
                { children }
            </div>
            <div className="event-container">
            {selectedCalendars.length > 0 ? (
                eventsOnSelectedDate.length > 0 ? (
                    eventsOnSelectedDate.map((event, index) => (
                        <div key={index} className="event">
                            <div className="event-header">
                                <h3 className="event-title">{event.summary}</h3>
                                <p className="calendar-name">{event.calendarName}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No events found</p>
                )
            ) : (
                <p>No calendars enabled. Please select from "Your Calendars".</p>
            )}
            </div>
        </>
    );
}

export default GoogleCalendarEvents;