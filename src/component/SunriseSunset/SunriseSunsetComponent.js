import React, { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment-timezone';
import './SunriseSunsetComponent.css';

function SunriseSunsetComponent({ coordinates, selectedDate, selectedLocation, onSunriseSunsetTime }) {
    const [sunriseSunsetInfo, setSunriseSunsetInfo] = useState(null);

    useEffect(() => {
        console.log("Received coordinates:", coordinates);
        console.log("Received selectedDate:", selectedDate.format('YYYY-MM-DD'));
        const fetchData = async () => {
            if (!coordinates || !selectedDate) {
                // 如果没有收到坐标或者时间，直接返回
                return;
            }

            const [latitude, longitude] = coordinates.split(',');

            const url = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${selectedDate.format('YYYY-MM-DD')}&formatted=0`;
            try {
                const response = await fetch(url);
                const data = await response.json();
                console.log(data);
                if (data.status === "OK") {
                    const sunrise = moment(data.results.sunrise).tz('America/New_York').format('h:mm A');
                    const sunset = moment(data.results.sunset).tz('America/New_York').format('h:mm A');
                    console.log("Sunrise: ",sunrise);
                    console.log("Sunset: ", sunset);
                    setSunriseSunsetInfo({ sunrise, sunset });

                    // 调用父组件中的回调函数，并传递日出日落时间
                    onSunriseSunsetTime(sunrise, sunset);
                } else {
                    throw new Error("Failed to retrieve sunrise and sunset information.");
                }
            } catch (error) {
                console.error("Error:", error);
                setSunriseSunsetInfo(null);
            }
        };
        fetchData();
    }, [coordinates, selectedDate, onSunriseSunsetTime]);

    console.log(sunriseSunsetInfo);
    console.log("Props in SunriseSunsetComponent:", { coordinates, selectedDate, selectedLocation, onSunriseSunsetTime });

    return (
        <div className="sunrise-sunset-container">
            <div className="sunrise-sunset-wrapper">
            <div className="sunrise-sunset-header">
                {selectedLocation !== "" ? (
                    <p className="ss-location">{selectedLocation}</p>
                ) : (
                    <p className="ss-location">Search A City</p>
                )
                }
                <span className="sunrise-sunset-header-divider"></span>
                <p className="ss-date">{selectedDate.format('MM-DD-YYYY')}</p>
            </div>
            {sunriseSunsetInfo ? (
                <div className="sunrise-sunset-main-content">
                    <div className="ss-time">
                        <h2>Sunrise</h2>
                        <p>{sunriseSunsetInfo.sunrise}</p>
                    </div>
                    <div className="ss-time">
                        <h2>Sunset</h2>
                        <p>{sunriseSunsetInfo.sunset}</p>
                    </div>
                </div>
            ) : (
                <div className="loading-message">Fetching sunrise and sunset times...</div>
            )}
            </div>
        </div>
    );
}

export default SunriseSunsetComponent;