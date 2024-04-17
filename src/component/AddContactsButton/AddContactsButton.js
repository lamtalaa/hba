import { useState } from 'react';
import useOutsideClick from '../../utility/handleOutsideClick/useOutsideClick';

import './AddContactsButton.css';

// Enum for categories
const contactCategory = Object.freeze({

    mainPhone: 0,
    workPhone: 1,
    mobilePhone: 2,
    email: 3,
    CCEmail: 4,
    fax: 5
});

// Buttons for adding contact information for a rider
function AddContactsButton({ id=1, person, toggleUpdate=null, toggleState=null, toDisable=false }) {

    const [isActive, setActive] = useState(false);
    const ref = useOutsideClick(() => setActive(false));

    // Update field value
    const handleUpdate = (event, category) => {

        const key = Object.keys(contactCategory).find(key => contactCategory[key] === category);
        person[key] = event.target.value;
        toggleUpdate(!toggleState);
    }

    // Open dropdown content
    const handleToggle = (event) => {

        event.preventDefault();
        setActive(!isActive);
    }

    return (
        
        <div ref={ ref } className="contact-button">
            <button className="option-button" onClick={handleToggle}>Add Contacts</button>
            <div className={`contact-content ${isActive ? 'active' : ''}`}>
                <div className="contact-content-wrapper">
                <h2>Contact Information for Rider #{id}</h2>
                    <div className="form-body-wrapper_flex-column">
                        <div className="form-body-wrapper_flex-row">
                            <div className="form-field flex1">
                                <label htmlFor="main-phone">Main Phone Number</label>
                                <input 
                                    id="name-phone" 
                                    type="tel" 
                                    value={person.mainPhone} 
                                    onChange={event => handleUpdate(event, contactCategory.mainPhone)}
                                    disabled={toDisable}
                                />
                            </div>
                            <div className="form-field flex1">
                                <label htmlFor="email">Email</label>
                                <input 
                                    id="email" 
                                    type="email" 
                                    value={person.email} 
                                    onChange={event => handleUpdate(event, contactCategory.email)}
                                    disabled={toDisable}
                                />
                            </div>
                        </div>
                        <div className="form-body-wrapper_flex-row">
                            <div className="form-field flex1">
                                <label htmlFor="work-phone">Work Phone Number</label>
                                <input 
                                    id="work-phone" 
                                    type="tel" 
                                    value={person.workPhone} 
                                    onChange={event => handleUpdate(event, contactCategory.workPhone)}
                                    disabled={toDisable}
                                />
                            </div>
                            <div className="form-field flex1">
                                <label htmlFor="cc-email">CC Email</label>
                                <input 
                                    id="cc-email" 
                                    type="email" 
                                    value={person.CCEmail} 
                                    onChange={event => handleUpdate(event, contactCategory.CCEmail)}
                                    disabled={toDisable}
                                />
                            </div>
                        </div>
                        <div className="form-body-wrapper_flex-row">
                            <div className="form-field flex1">
                                <label htmlFor="mobile-phone">Mobile Phone Number</label>
                                <input 
                                    id="mobile-phone" 
                                    type="tel" 
                                    value={person.mobilePhone} 
                                    onChange={event => handleUpdate(event, contactCategory.mobilePhone)}
                                    disabled={toDisable}
                                />
                            </div>
                            <div className="form-field flex1">
                                <label htmlFor="fax">Fax</label>
                                <input 
                                    id="fax" 
                                    type="text" 
                                    value={person.fax} 
                                    onChange={event => handleUpdate(event, contactCategory.fax)}
                                    disabled={toDisable}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddContactsButton;