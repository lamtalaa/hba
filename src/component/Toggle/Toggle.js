import { useState, useEffect } from 'react';
import './Toggle.css';

function ToggleButton({ status=null, method=null }) {

    const [isActive, setActive] = useState(false);

    useEffect(() => {

        if (status !== null)
            setActive(status);
    }, [status])

    const handleToggle = () => {

        setActive(!isActive);
        if (method !== null) 
            method();
    };

    return (

        <button onClick={ handleToggle } className={`toggle-button ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
        </button>
    )
}

export default ToggleButton;