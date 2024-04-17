import { useState, useEffect } from 'react';

import './Toggle.css';

function ToggleButton({ status=null, method=null, labels }) {
    const [isActive, setActive] = useState(false);

    useEffect(() => {
        if (status !== null) {setActive(status);}
    }, [status])

    const handleToggle = () => {
        setActive(!isActive);
        if (method !== null) {method();}
    };

    return (

        <button onClick={ handleToggle } className={`toggle-button ${isActive ? 'active' : 'inactive'}`}>
            {isActive ? labels[0] : labels[1]}
        </button>
    )
}

export default ToggleButton;