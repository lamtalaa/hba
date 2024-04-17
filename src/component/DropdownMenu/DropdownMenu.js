import { useState, useEffect } from 'react';
import useOutsideClick from '../../utility/handleOutsideClick/useOutsideClick';

import './DropdownMenu.css'

function DropdownMenu({ itemList=[''], htmlForRef=null, label='', value='', callback=null }) {

    const [isActive, setActive] = useState(false);
    const [content, setContent] = useState('');
    const ref = useOutsideClick(() => setActive(false));

    // Initialize Dropdown Menu with first item
    useEffect(() => {
        if (value === '') {
            setContent(itemList[0]);
        } else  {
            console.log("\t----vALUE: ", value);
            setContent(value);
            callback(value);
        }
    }, [value]);

    const handleToggle = (event) => {
        event.preventDefault();
        setActive(!isActive);
    }

    const handleContentChange = (item) => {
        setContent(item);
        if (callback) {callback(item);}
    }

    return (

        <span className="form-body-wrapper_flex-row">
        <div ref={ref} className="dropdownMenu-container" id={htmlForRef}>
            <button className="dropdownMenu-button" onClick={(event) => handleToggle(event)}>
                <div className="dropdownMenu-button-content-wrapper">
                    <span>{ content }</span>
                    <span className="dropdownMenu-button-icon"></span>
                </div>
            </button>
            <ul className={`dropdownMenu-content ${isActive ? 'active' : ''}`}>
                {itemList.map((item, index) => (
                    <li onClick={() => handleContentChange(item)} key={index}>{item}</li>
                ))}
            </ul>
        </div>
        {htmlForRef !== null && <label className="form-checkbox-text" htmlFor={htmlForRef}>{label}</label>}
        </span>
    )
}

export default DropdownMenu;