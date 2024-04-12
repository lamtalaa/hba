import React, { useState, useEffect } from 'react';
import moment from 'moment-timezone';
import classNames from 'classnames';
import './HomeCalendar.css';
import '../SearchBar/SearchBar.css';
import { useSession } from '@supabase/auth-helpers-react';

function RenderCalendar({ selectedDate, onDateSelect }) {
    const [currentMonth, setCurrentMonth] = useState(moment());
    const session = useSession();

    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startOfWeek = startOfMonth.clone().startOf('week');
    let endOfWeek = endOfMonth.clone().endOf('week');

    while (endOfWeek.diff(startOfWeek, 'days') < 41) {
        endOfWeek = endOfWeek.add(1, 'week');
    }

    const handleDateClick = (date) => {
        onDateSelect(date); // Update selectedDate directly
    };

    const calendar = [];
    let currentDay = startOfWeek.clone();

    while (currentDay.isSameOrBefore(endOfWeek, 'day')) {
        const buttonClassName = classNames('calendar-button', {
            'not-this-month': !currentDay.isSame(currentMonth, 'month'),
            'before-today': currentDay.isBefore(moment(), 'day'),
            'today': currentDay.isSame(moment(), 'day'),
            'selected': selectedDate && selectedDate.isSame(currentDay, 'day')
        });

        calendar.push({
            date: currentDay.clone(),
            buttonClassName: buttonClassName
        });

        currentDay.add(1, 'day');
    }

    const goToPreviousMonth = () => {
        setCurrentMonth(prevMonth => prevMonth.clone().subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(prevMonth => prevMonth.clone().add(1, 'month'));
    };
    
    return (
        <>
            <table className="calendar-container">
                <thead>
                    <tr>
                        <th colSpan="7">
                        <div className="calendar-header">
                            <h2 className="month"> {currentMonth.format('MMMM YYYY')}</h2>
                            <div className="calendar-buttons">
                                <button onClick={goToPreviousMonth} className="arrow-icon"><span className="arrow arrow-rev"></span></button>
                                <button onClick={goToNextMonth} className="arrow-icon"><span className="arrow arrow"></span></button>
                            </div>
                        </div>
                        </th>
                    </tr>
                    <tr>
                        <th>SUN</th>
                        <th>MON</th>
                        <th>TUE</th>
                        <th>WED</th>
                        <th>THU</th>
                        <th>FRI</th>
                        <th>SAT</th>
                    </tr>
                </thead>
                <tbody className="calendar-table">
                    {calendar.reduce((rows, key, index) => (index % 7 === 0 ? rows.push([key]) : rows[rows.length - 1].push(key)) && rows, []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {row.map((day) => (
                                <td key={day.date.format('YYYY-MM-DD')}>
                                    <button className={`${day.buttonClassName} hovered`} onClick={() => handleDateClick(day.date)}>
                                        {day.date.date()}
                                    </button>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            </>
            );
}

export default RenderCalendar;