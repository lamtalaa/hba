import { useState } from 'react';
import useOutsideClick from '../../utility/handleOutsideClick/useOutsideClick';
import './AddContactsButton.css';

// Enum for categories
const category = Object.freeze({

    MainPhone: 0,
    WorkPhone: 1,
    MobilePhone: 2,
    Email: 3,
    CCEmail: 4,
    Fax: 5
});

function AddContactsButton({ id=1, person, toggleUpdate=null, toggleState=null }) {
    const [isActive, setActive] = useState(false);
    const ref = useOutsideClick(() => setActive(false));

    const handleUpdate = (event, category) => {

        switch(category) {
            case 0:
                updateRiderMainPhone(event);
                break;
            case 1:
                updateRiderWorkPhone(event);
                break;
            case 2:
                updateRiderMobilePhone(event);
                break;
            case 3:
                updateRiderEmail(event);
                break;
            case 4:
                updateRiderCCEmail(event);
                break;
            case 5:
                updateRiderFax(event);
                break;
        }
        toggleUpdate(!toggleState);
    }

    const updateRiderMainPhone = (event) => {

        person.mainPhone = event.target.value;
    }

    const updateRiderWorkPhone = (event) => {

        person.workPhone = event.target.value;
    }

    const updateRiderMobilePhone = (event) => {

        person.mobilePhone = event.target.value;
    }

    const updateRiderEmail = (event) => {

        person.email = event.target.value;
    }

    const updateRiderCCEmail = (event) => {

        person.CCEmail = event.target.value;
    }

    const updateRiderFax = (event) => {

        person.fax = event.target.value;
    }

    const handleToggle = () => {

        setActive(!isActive);
    }

    return (
        <div ref={ ref } className="contact-button">
            <button className="option-button" onClick={ handleToggle }>Add Contacts</button>
            <div className={`contact-content ${ isActive ? 'active' : '' }`}>
                <div className="contact-content-wrapper">
                <h2>Contact Information for Rider #{id}</h2>
                    <div className="form-body-wrapper_flex-column">
                        <div className="form-body-wrapper_flex-row">
                            <div className="form-field flex1">
                                <label htmlFor="main-phone">Main Phone Number</label>
                                <input id="name-phone" type="tel" value={person.mainPhone} onChange={event => handleUpdate(event, category.MainPhone)}/>
                            </div>
                            <div className="form-field flex1">
                                <label htmlFor="email">Email</label>
                                <input id="email" type="email" value={person.email} onChange={event => handleUpdate(event, category.Email)}/>
                            </div>
                        </div>
                        <div className="form-body-wrapper_flex-row">
                            <div className="form-field flex1">
                                <label htmlFor="work-phone">Work Phone Number</label>
                                <input id="work-phone" type="tel" value={person.workPhone} onChange={event => handleUpdate(event, category.WorkPhone)}/>
                            </div>
                            <div className="form-field flex1">
                                <label htmlFor="cc-email">CC Email</label>
                                <input id="cc-email" type="email" value={person.CCEmail} onChange={event => handleUpdate(event, category.CCEmail)}/>
                            </div>
                        </div>
                        <div className="form-body-wrapper_flex-row">
                            <div className="form-field flex1">
                                <label htmlFor="mobile-phone">Mobile Phone Number</label>
                                <input id="mobile-phone" type="tel" value={person.mobilePhone} onChange={event => handleUpdate(event, category.MobilePhone)}/>
                            </div>
                            <div className="form-field flex1">
                                <label htmlFor="fax">Fax</label>
                                <input id="fax" type="text" value={person.fax} onChange={event => handleUpdate(event, category.Fax)}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddContactsButton;