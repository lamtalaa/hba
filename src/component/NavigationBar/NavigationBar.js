import { useState, useEffect } from 'react';

import "./NavigationBar.css";



function NavigationBar({ optionList, option, optionCallBack }) {

    useEffect(() => {
    }, [option]);

    const handleOptionChange = (i) => {

        optionCallBack(i);
    }

    const renderNavBar = () => {

        const arr = [];
        for (let i = 0; i < Object.keys(optionList).length; ++i) {
            const key = Object.keys(optionList)[i];

            arr.push(

                <li 
                    key={i}
                    className={`navigation-bar-item ${option === i ? "active" : ''}`} 
                    onClick={() => handleOptionChange(i)}>
                        {key}
                </li>
            );
        }

        return arr;
    }

    return (

        <div className="navigation-bar">
            <ul className='navigation-bar-content'>
                { renderNavBar() }
            </ul>
        </div>
    )
}

export default NavigationBar;