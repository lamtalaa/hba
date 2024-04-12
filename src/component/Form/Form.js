import './Form.css';
import { useState, useEffect, useRef } from 'react'
import DropdownMenu from '../DropdownMenu/DropdownMenu';
import ContactButton from '../AddContactsButton/AddContactsButton';

// Enum for the fields of the customer form
const customerCategory = Object.freeze({

    title: 0, firstName: 1, middleName: 2, lastName: 3, suffix: 4, displayName: 5,  // Full Name
    mainPhone: 6, workPhone: 7, mobilePhone: 8, email: 9, CCEmail: 10, fax: 11,     // Contact
    s_streetAddress: 12, s_city: 13, s_state: 14, s_zipCode: 15,                    // Shipping Address
    b_streetAddress: 16, b_city: 17, b_state: 18, b_zipCode: 19,                    // Billing Address
    webOrderId: 20, quickbooksId: 21, notes: 22,                                    // Additional Details & Notes
});

// Enum for categories for riders
const riderCategory = Object.freeze({

    name: 0, weight: 1,
});

// Rider Object
const Rider = (instanceId=Date.now(), name='', weight='0', mainPhone='', workPhone='', mobilePhone='', email='', CCEmail='', fax='') => {
    return {
        instanceId: instanceId,
        name: name,
        weight: weight,
        mainPhone: mainPhone,
        workPhone: workPhone,
        mobilePhone: mobilePhone,
        email: email,
        CCEmail: CCEmail,
        fax: fax
    }
}

function Form() {
    const [customer, updateCustomer] = useState({
        title: '', firstName: '', middleName: '', lastName: '', suffix: '', displayName: '',  // Full Name
        mainPhone: '', workPhone: '', mobilePhone: '', email: '', CCEmail: '', fax: '',       // Contact
        s_streetAddress: '', s_city: '', s_state: '', s_zipCode: '',                          // Shipping Address
        b_streetAddress: '', b_city: '', b_state: '', b_zipCode: '',                          // Billing Address
        webOrderId: '', quickbooksId: '', notes: ''
    });

    const [text, setText] = useState('');
    const [customerIsRider, setCustomerAsRider] = useState(false);
    const [numOfRiders, setNumOfRiders] = useState(0);
    const [listOfRiders, appendRider] = useState([]);
    const [toUpdateList, toggleUpdateList] = useState(false);

    // Contact Fields
    /*const [mainPhone, setMainPhone] = useState('');
    const [workPhone, setWorkPhone] = useState('');
    const [mobilePhone, setMobilePhone] = useState('');
    const [email, setEmail] = useState('');
    const [CCEmail, setCCEmail] = useState('');
    const [fax, setFax] = useState('');*/

    useEffect(() => {

        console.log("______________CUSTOMER INFORMATION_____________");
        console.log("\t>: ", customer);
        console.log("_______________________________________________\n\n");
    }, [customer]);

    useEffect(() => {

        console.log("___________UPDATED TABLE OF RIDERS_____________");
        console.log("\tNUM OF RIDERS: ", numOfRiders);
        console.log("\tRIDERS.......: ", ...listOfRiders);
        console.log("_______________________________________________\n\n");
        showRiderRows();
    }, [numOfRiders, listOfRiders, toUpdateList]);

    useEffect(() => {

        if (customerIsRider) {

            console.log("CUSTOMER IS RIDER TOO");
            const rider = Rider(0, customer.name, customer.weight, 
                                customer.mainPhone, customer.workPhone, 
                                customer.mobilePhone, customer.email, 
                                customer.CCEmail, customer.fax);
            addRider(rider);
        } else {

            if (numOfRiders > 0) {

                console.log("CUSTOMER IS NOT A RIDER");
                const idx = listOfRiders.findIndex((obj) => (obj.instanceId === 0))
                console.log("IDX: ", idx);
                deleteRider(idx);
            }
        }
    }, [customerIsRider]);

    const handleSubmit = async(event) => {

        event.preventDefault();
    }

    const handleCustomerRiderToggle = () => {

        setCustomerAsRider(!customerIsRider);
        toggleUpdateList(true);
    }

    const handleDeleteRider = (event, idx) => {

        event.preventDefault();
        deleteRider(idx);
    }

    const deleteRider = (idx) => {

        console.log("REMOVED RIDER with IDX: ", idx);
        if (idx > -1) {
            setNumOfRiders(numOfRiders - 1);
            listOfRiders.splice(idx, 1);
        }
        if (idx === 0) {
            setCustomerAsRider(false);
        }
    }

    const handleAddRider = (event) => {

        event.preventDefault();
        addRider();
    }

    const addRider = (rider=null) => {

        toggleUpdateList(!toUpdateList);
        setNumOfRiders(numOfRiders + 1);
        appendRider([...listOfRiders, rider ? rider : Rider()]);
    }

    const showRiderRows = () => {

        const arr = [];
        for (let i = 0; i < numOfRiders; ++i) {



            arr.push(
                <tr key={i}>
                    <th scope="row">{i + 1}</th>
                    <td><input type="text" value={listOfRiders[i].name} onChange={event => handleRiderUpdate(i, event, riderCategory.name)}></input></td>
                    <td><input type="text"
                               value={listOfRiders[i].weight === '0' ? '' : listOfRiders[i].weight} 
                               onBlur={event => fixDecimal(i, event)} 
                               onChange={event => handleRiderUpdate(i, event, riderCategory.weight)}
                               disabled={listOfRiders[i].instanceId === 0 ? true : false}>
                    </input></td>
                    <td className="form-body-wrapper_flex-row">
                        <ContactButton id={i + 1} person={listOfRiders[i]} toggleUpdate={toggleUpdateList} toggleState={toUpdateList}/>
                        <button className="delete-button" onClick={event => handleDeleteRider(event, i) }>Ｘ</button>
                    </td>
                </tr>
            )
        }
        return arr;
    }

    // Update Customer Attributes
    const handleCustomerUpdate = (event, category) => {

        event.preventDefault();
        const key = Object.keys(customerCategory).find(key => customerCategory[key] === category);
        updateCustomer(prevState => ({
            ...prevState,
            [key]: event.target.value
        }));
    }


    // Update Rider Attributes
    const handleRiderUpdate = (entryId, event, category) => {

        event.preventDefault();
        console.log("VALUE:", event.target.value);
        const key = Object.keys(riderCategory).find(key => riderCategory[key] === category);

        switch (category) {
            case 0: // Name
                listOfRiders[entryId][key] = event.target.value;
                console.log("CURRENT NAME: ", listOfRiders[entryId][key]);
                toggleUpdateList(!toUpdateList);
                break;
            case 1: // Weight
                listOfRiders[entryId][key] = sanitizeNumber(key, entryId, event.target.value);
                break;
            default:
                return;
        }
    }

    // Return old value if new value is invalid; otherwise return new value
    const sanitizeNumber = (key, entryId, value) => {
        
        if (isNaN(value)) {

            // Keep previous value
            value = listOfRiders[entryId][key];
            //toggleUpdateList(!toUpdateList);
        } else {

            // Keep new value; if it's empty, choose default value of '0'
            if (value === '') { value = '0'; }
            toggleUpdateList(!toUpdateList);
        }

        return value;
    }

    // If number ends with a decimal with no numbers in the decimal place, add a '0' after it
    const fixDecimal = (i, event) => {

        event.preventDefault();

        if ((listOfRiders[i].weight).endsWith('.')) {

            listOfRiders[i].weight += '0';
            toggleUpdateList(!toUpdateList);
            //toggleUpdateList(true);
        }
    }

    /*const handleEdit = async (event) => {
        event.preventDefault();
    
        try {
          // 在Supabase中更新指定用户名的数据
          const { data, error } = await supabase
            .from('login')
            .update({ name: editName, email: editEmail})
            .eq('name', editingUser);
    
          if (error) {
            throw error;
          }
    
          console.log('Account updated successfully:', data);
    
          // 关闭编辑浮窗
          setShowEditPopup(false);
    
          // 刷新数据
          const { data: refreshedData, error: refreshError } = await supabase
            .from('login')
            .select('*');
    
          if (refreshError) {
            throw refreshError;
          }
    
          setLoginData(refreshedData);
        } catch (error) {
          console.error('Error editing account:', error.message);
          setErrorMessage(error.message);
        }
      };*/

    return (
            <form className="form-container" onSubmit={ handleSubmit }>
                <div className="form-main-content">
                    
                    {/* Add additional form sections */}
                    {/* Full Name */}
                    <div className="form-section">
                        <h2 className="form-title">Full Name</h2>
                        <div className="form-body">
                            <div className="form-body-wrapper_flex-column">
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex1">
                                        <label htmlFor="name-title">Title</label>
                                        <input id="name-title" type="text" value={customer.title} onChange={event => handleCustomerUpdate(event, customerCategory.title)}/>
                                    </div>
                                    <div className="form-field flex3">
                                        <label htmlFor="first-name">First Name</label>
                                        <input id="first-name" type="text"/>
                                    </div>
                                    <div className="form-field flex2">
                                        <label htmlFor="middle-name">Middle Name</label>
                                        <input id="middle-name" type="text"/>
                                    </div>
                                    <div className="form-field flex3">
                                        <label htmlFor="last-name">Last Name</label>
                                        <input id="last-name" type="text"/>
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="suffix">Suffix</label>
                                        <input id="suffix" type="text"/>
                                    </div>
                                </div>
                                <div className="display-name-container">
                                    <label htmlFor="display-name" className="form-text">Customer Display Name (required) (i)</label>
                                    <span>
                                        <input className="form-checkbox" id="display-name-toggle" type="checkbox"/>
                                        <label className="form-checkbox-text" htmlFor="display-name-toggle">Override Display Name</label>
                                    </span>
                                    <div className="form-field">
                                        <input id="display-name" type="text"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="form-section">
                        <h2 className="form-title">Contact</h2>
                        <div className="form-body">
                            <div className="form-body-wrapper_flex-column">
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex1">
                                        <label htmlFor="main-phone">Main Phone Number</label>
                                        <input id="name-phone" type="tel" value={customer.mainPhone} onChange={event => handleCustomerUpdate(event, customerCategory.mainPhone)}/>
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="email">Email</label>
                                        <input id="email" type="email" value={customer.email} onChange={event => handleCustomerUpdate(event, customerCategory.email)}/>
                                    </div>
                                </div>
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex1">
                                        <label htmlFor="work-phone">Work Phone Number</label>
                                        <input id="work-phone" type="tel" value={customer.workPhone} onChange={event => handleCustomerUpdate(event, customerCategory.workPhone)}/>
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="cc-email">CC Email</label>
                                        <input id="cc-email" type="email"/>
                                    </div>
                                </div>
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex1">
                                        <label htmlFor="mobile-phone">Mobile Phone Number</label>
                                        <input id="mobile-phone" type="tel"/>
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="fax">Fax</label>
                                        <input id="fax" type="text"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="form-section">
                        <h2 className="form-title">Shipping Address</h2>
                        <div className="form-body">
                            <div className="form-body-wrapper_flex-column">
                                <div className="form-field">
                                    <label htmlFor="street-address">Street Address</label>
                                    <input id="street-address" type="text"/>
                                </div>
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex5">
                                        <label htmlFor="street-address">City</label>
                                        <input id="street-address" type="text"/>
                                    </div>
                                    <div className="form-field flex0-1">
                                        <label htmlFor="street-address">State</label>
                                        <input id="street-address" type="text"/>
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="street-address">Zip Code</label>
                                        <input id="street-address" type="text"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div className="form-section">
                        <h2 className="form-title">Billing Address</h2>
                        <div className="form-body">
                            <div className="form-body-wrapper_flex-column">
                                <span>
                                    <input className="form-checkbox" id="same-as-toggle" type="checkbox"/>
                                    <label className="form-checkbox-text" htmlFor="same-as-toggle">Use same shipping address</label>
                                </span>
                                <div className="form-field">
                                    <label htmlFor="street-address">Street Address</label>
                                    <input id="street-address" type="text"/>
                                </div>
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex5">
                                        <label htmlFor="street-address">City</label>
                                        <input id="street-address" type="text"/>
                                    </div>
                                    <div className="form-field flex0-1">
                                        <label htmlFor="street-address">State</label>
                                        <input id="street-address" type="text"/>
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="street-address">Zip Code</label>
                                        <input id="street-address" type="text"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Riders */}
                    <div className="form-section">
                        <h2 className="form-title">Riders</h2>
                        <div className="form-body">
                            <div className='form-body-wrapper_flex-column'>
                            <span>
                                <input className="form-checkbox" id="customer-as-rider-toggle" type="checkbox" checked={ customerIsRider } onChange={ handleCustomerRiderToggle }/>
                                <label className="form-checkbox-text" htmlFor="customer-as-rider-toggle">Add customer as a rider too (marked with *)</label>
                            </span>
                            <table className="rider-table">
                                <thead>
                                    <tr>
                                        <th scope="col" width="5%">#</th>
                                        <th scope="col" width="34%">Name</th>
                                        <th scope="col">Weight (lbs)</th>
                                        <th scope="col" width="35%">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    { showRiderRows() }
                                </tbody>
                            </table>
                            </div>
                            <button className="submit-button" onClick={ handleAddRider }>Add Rider</button>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="form-section">
                        <h2 className="form-title">Additional Details & Notes</h2>
                        <div className="form-body">
                            <div className="form-body-wrapper_flex-column">
                                <div className="form-body-additional-options">
                                    <div className="form-body-wrapper_flex-row">
                                        <div className="form-body-wrapper_flex-row form-dropdownMenu-wrapper">
                                        <span>
                                            <DropdownMenu itemList={["AM", "PM"]} htmlForRef="am-toggle" label="AM/PM"/>
                                        </span>
                                            <DropdownMenu itemList={["Public", "Private"]} htmlForRef="public-toggle" label="Public/Private"/>
                                        </div>
                                    </div>
                                    <div className="form-body-wrapper_flex-row form-body-external-ids">
                                        <div className="form-field">
                                            <label htmlFor="webOrderId">Web Order ID</label>
                                            <input id="webOrderId" type="text"/>
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="quickbooksId">QuickBooks ID</label>
                                            <input id="quickbooksId" type="text"/>
                                        </div> 
                                    </div>
                                    </div>
                                <div className="form-field">
                                    <textarea className="form-text-field" rows="8" value={text} onChange={event => setText(event.target.value)}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            
                <div className="form-buttons">
                    <button className="submit-button">Create Customer</button>
                </div>
            </form>

    )
}

export default Form;