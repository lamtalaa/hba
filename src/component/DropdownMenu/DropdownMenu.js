import './DropdownMenu.css'
import { useState, useEffect } from 'react';
import useOutsideClick from '../../utility/handleOutsideClick/useOutsideClick';

function DropdownMenu({ itemList=[''], htmlForRef=null, label=''}) {
    const [isActive, setActive] = useState(false);
    const [content, setContent] = useState('');
    const ref = useOutsideClick(() => setActive(false));

    // Initialize width of Dropdown Menu
    useEffect(() => {

        const largestLength = itemList.reduce((largestNumber, currentItem) => {

            return largestNumber < currentItem.length ? currentItem.length : largestNumber;
        }, 0);

        let initialState = '';
        for (let i = 0; i < largestLength; ++i) {

            initialState += '-';
        }
        setContent(initialState);
    }, []);

    useEffect(() => {

        console.log("CHANGED: ", content);
    }, [content]);

    const handleToggle = () => {

        console.log("TOUCHED");
        setActive(!isActive);
    }

    return (
        <span className="form-body-wrapper_flex-row">
        <div ref={ ref } className="dropdownMenu-container" id={ htmlForRef }>
            <button className="dropdownMenu-button" onClick={handleToggle}>
                <div className="dropdownMenu-button-content-wrapper">
                    <span>{ content }</span>
                    <span className="dropdownMenu-button-icon"></span>
                </div>
            </button>
            <ul className={`dropdownMenu-content ${ isActive ? 'active' : '' }`}>
                { itemList.map((item, index) => (
                    <li onClick={() => setContent(item)} key={index}>{ item }</li>
                ))}
            </ul>
        </div>
        {htmlForRef !== null && <label className="form-checkbox-text" htmlFor={ htmlForRef }>{ label }</label>}
        </span>
    )
}

export default DropdownMenu;