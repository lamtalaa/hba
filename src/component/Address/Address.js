import React, { useState, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';

// Address input associated with a search bar and assists fetching the sunrise/sunset time
const AddressInput = ({ onAddressSubmit, setSelectedLocation }) => {

    const [address, setAddress] = useState('');
    const [queryLocation, setQueryLocation] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Initialize if address was written earlier
    useEffect(() => {
        let storedAddress = localStorage.getItem('address');
        if (storedAddress) {
            setQueryLocation(storedAddress);
            queryAddress(storedAddress);
        }
    }, []);

    // Store address if query is not empty
    useEffect(() => {
        setAddress(queryLocation);
        if (address !== '') { localStorage.setItem('address', address); }
    }, [address, queryLocation])

    // Update query as the user types in the address
    const handleAddressChange = (event) => {
        setQueryLocation(event.target.value);
        console.log("TYPING: ", event.target.value);
    };

    // Handle the query for the sunrise/sunset API
    const handleSubmit = (event) => {
        event.preventDefault();
        setErrorMessage(''); // 清除之前的错误消息

        setAddress(queryLocation);
        queryAddress(queryLocation);
    }

    // Actually query the sunrise/sunset API
    const queryAddress = async (location) => {

        console.log("REQUESTED LOCATION: ", location);
        if (location === '') return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&addressdetails=1&limit=1`);
            const data = await response.json();
            if (data.length > 0) {
                const { lat, lon, name } = data[0];

                const { city, state } = data[0].address;
                if (city === undefined || state === undefined) {
                    setSelectedLocation(name);
                    setQueryLocation(name);
                } else {
                    setSelectedLocation(city + ', ' + state);
                    setQueryLocation(city + ', ' + state);
                }

                // 调用父组件的回调函数，将坐标传递给父组件
                onAddressSubmit(`${lat},${lon}`);
            } else {
                setErrorMessage('No results found for the address. Please provide a more detailed address.');
            }
        } catch (error) {
            console.error('Error fetching geocoding data:', error);
            setErrorMessage('Error fetching geocoding data. Please try again later.');
        }
    }

    return (

        <SearchBar
            icon="address"
            placeholder="Search City" {...queryLocation !== '' && {value: queryLocation}}
            onSubmitMethod={handleSubmit}
            onChangeMethod={handleAddressChange}
        />
    );
};

export default AddressInput;