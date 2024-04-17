import { useState, useEffect, useRef } from 'react'
import CryptoJS from 'crypto-js';
import { supabase } from '../../supabase';
import ENC from '../Encryption/Encryption';

import DropdownMenu from '../DropdownMenu/DropdownMenu';
import ContactButton from '../AddContactsButton/AddContactsButton';
import Modal from '../Modal/Modal';

import './Form.css';

// Enum for the fields of the customer form
const customerCategory = Object.freeze({

    title: 0, firstName: 1, middleName: 2, lastName: 3, suffix: 4, displayName: 5,  // Full Name
    mainPhone: 6, workPhone: 7, mobilePhone: 8, email: 9, CCEmail: 10, fax: 11,     // Contact
    s_streetAddress: 12, s_city: 13, s_state: 14, s_zipCode: 15,                    // Shipping Address
    b_streetAddress: 16, b_city: 17, b_state: 18, b_zipCode: 19,                    // Billing Address
    prefersAM: 20, prefersShared: 21, webOrderId: 22, quickbooksId: 23, notes: 24,  // Additional Details & Notes
});

// Enum for the fields of the riders
const riderCategory = Object.freeze({

    name: 0, age: 1, weight: 2,
});

// Rider
const Rider = (instanceId=Date.now(), name='', age='0', weight='0', mainPhone='', 
               workPhone='', mobilePhone='', email='', CCEmail='', fax='') => {

    return {

        instanceId: instanceId,
        name: name,
        age: age,
        weight: weight,
        mainPhone: mainPhone,
        workPhone: workPhone,
        mobilePhone: mobilePhone,
        email: email,
        CCEmail: CCEmail,
        fax: fax
    }
}

function Form({ targetCustomer=-1 }) {

    // Customer
    const [customer, updateCustomer] = useState({

        title: '', firstName: '', middleName: '', lastName: '', suffix: '', displayName: '',  // Full Name
        mainPhone: '', workPhone: '', mobilePhone: '', email: '', CCEmail: '', fax: '',       // Contact
        s_streetAddress: '', s_city: '', s_state: '', s_zipCode: '',                          // Shipping Address
        b_streetAddress: '', b_city: '', b_state: '', b_zipCode: '',                          // Billing Address
        prefersAM: true, prefersShared: true, webOrderId: '', quickbooksId: '', notes: ''     // Additional Details & Notes
    });
    const ref = useRef(null);

    // Customer field-related variables
    const [autoDisplayName, setAutoDisplayName] = useState(true);
    const [updateDisplayName, toggleUpdateDisplayName] = useState({ status: false, value: ""}); // Flips back and forth to access corresponding useEffect
    const [isSameAddress, setIsSameAddress] = useState(false);
    const [customerIsRider, setCustomerAsRider] = useState(false);
    const [prefersAM, setPrefersAM] = useState(true);
    const [prefersShared, setPrefersShared] = useState(true);
    const [disableDisplayName, setDisableDisplayName] = useState(false);
    const [shippingAddressId, setShippingAddressId] = useState([]);
    const [billingAddressId, setBillingAddressId] = useState([]);
    const [riderPID, setRiderPID] = useState([]);
    const [ridersUpdated, setRiderUpdated] = useState(false);
    const [addressId, setaddressId] = useState('');

    // Customer error pop ups
    const [showErrorPopUp, setShowErrorPopUp] = useState(false);
    const [showDeletePopUp, setShowDeletePopUp] = useState(false);

    // Rider field-related variables
    const [toUpdate, toggleUpdate] = useState(false);   // Flips back and forth to access corresponding useEffect
    const [numOfRiders, setNumOfRiders] = useState(0);
    const [listOfRiders, appendRider] = useState([]);
    const [riderToDelete, setRiderToDelete] = useState([]);

    // Populate fields if form is being used to update customer information
    useEffect(() => {
        if (targetCustomer !== -1) {populateFields();}
    }, [])

    // (1 of 2) DEBUGGING: Print customer's values
    useEffect(() => {

        console.log("______________CUSTOMER INFORMATION_____________");
        console.log("\t>: ", customer);
        console.log("_______________________________________________\n\n");
        console.log("DISPLAY NAME: ", ref.displayName);
    }, [customer]);

    // Add customer as a rider too, if applicable
    useEffect(() => {

        if (customerIsRider) {

            // Add customer as rider
            const rider = Rider(0, customer.displayName, '0', '0', 
                                customer.mainPhone, customer.workPhone, 
                                customer.mobilePhone, customer.email, 
                                customer.CCEmail, customer.fax);
            addRider(rider);
        } else {

            // Remove customer as rider
            if (numOfRiders > 0) {

                const idx = listOfRiders.findIndex((obj) => (obj.instanceId === 0))
                deleteRider(idx);
            }
        }
    }, [customerIsRider]);

    // Update customer display name
    useEffect(() => {

        ref.displayName = '';
        let addSpace = false;
        for (let i = 0; i < customerCategory.displayName; ++i) {
            const key = Object.keys(customerCategory).find(key => customerCategory[key] === i);
            if (customer[key]) {
                ref.displayName += (addSpace ? ' ' : '');
                ref.displayName += customer[key];
                addSpace = true;
            }
        }
        
        // If display name is set to auto, use all other fields in "Full Name"
        // Otherwise, use the manually inputted display name
        if (autoDisplayName) {
            updateCustomer(prevState => ({
                ...prevState,
                displayName: ref.displayName
            }));
        } else if (updateDisplayName.value !== '') {
            updateCustomer(prevState => ({
                ...prevState,
                displayName: updateDisplayName.value
            }));
        }

        // If customer is also a rider, update its name too
        if (customerIsRider) {
            for (let i = 0; i < numOfRiders; ++i) {
                if(listOfRiders[i].instanceId === 0) {
                    listOfRiders[i].name = autoDisplayName ? ref.displayName : updateDisplayName.value;
                    break;
                }
            }
        }
    }, [updateDisplayName]);

    // Toggle whether to combine individual name fields into one display name
    useEffect(() => {

        if (autoDisplayName) {
            toggleUpdateDisplayName(({updateDisplayName}) => ({
                status: !updateDisplayName,
                value: ""
            }));
        }
    }, [autoDisplayName]);

    // Update AM/PM Preference
    useEffect(() => {

        updateCustomer(prevState => ({
            ...prevState,
            prefersAM: prefersAM
        }));
    }, [prefersAM]);

    // Update Shared/Private Preference
    useEffect(() => {

        updateCustomer(prevState => ({
            ...prevState,
            prefersShared: prefersShared
        }));
    }, [prefersShared]);

    // Toggle whether to combine individual name fields into one for display name
    const handleDisplayNameToggle = () => {
        setAutoDisplayName(!autoDisplayName);
    }

    // Toggle whether to add customer as a rider too
    const handleCustomerRiderToggle = () => {
        setCustomerAsRider(!customerIsRider);
        toggleUpdate(!toUpdate);
    }

    // Prompt confirmation pop up for deletion
    const handleDeleteRider = (event, idx) => {
        event.preventDefault();
        setRiderToDelete(idx);
        setShowDeletePopUp(true);
    }

    // Remove rider from customer
    const deleteRider = (idx) => {

        if (idx > -1) {
            if (listOfRiders[idx].instanceId === 0)
                setCustomerAsRider(false);
            else
                setShowDeletePopUp(false);

            setNumOfRiders(numOfRiders - 1);
            listOfRiders.splice(idx, 1);
            setRiderToDelete([]);
        }
    }

    // Handle add rider through button event
    const handleAddRider = (event) => {
        event.preventDefault();
        addRider();
    }

    // Add rider to customer
    const addRider = (rider=null) => {
        toggleUpdate(!toUpdate);
        setNumOfRiders(numOfRiders + 1);
        appendRider([...listOfRiders, rider ? rider : Rider()]);
    }

    // Display all riders in a table
    const showRiderRows = () => {

        const arr = [];
        for (let i = 0; i < numOfRiders; ++i) {
            if (!listOfRiders[i]) {return;}

            const riderName = listOfRiders[i].name;
            const riderAge = listOfRiders[i].age === '0' ? '' : listOfRiders[i].age;
            const riderWeight = listOfRiders[i].weight === '0' ? '' : listOfRiders[i].weight;

            arr.push(

                <tr key={i}>
                    <th scope="row">{i + 1}</th>
                    <td><input 
                        type="text"
                        value={ riderName }
                        onChange={ event => handleRiderUpdate(i, event, riderCategory.name) }
                        disabled={ listOfRiders[i].instanceId === 0 ? true : false }>
                    </input></td>
                    <td><input 
                        type="text"
                        value={ riderAge } 
                        onChange={ event => handleRiderUpdate(i, event, riderCategory.age) }>
                    </input></td>
                    <td><input 
                        type="text"
                        value={ riderWeight } 
                        onBlur={ event => fixDecimal(i, event) } 
                        onChange={ event => handleRiderUpdate(i, event, riderCategory.weight) }>
                    </input></td>
                    <td className="form-body-wrapper_flex-row">
                        <ContactButton 
                            id={ i + 1 } 
                            person={ listOfRiders[i] }
                            toggleUpdate={ toggleUpdate }
                            toggleState={ toUpdate }
                            toDisable={ listOfRiders[i].instanceId === 0 ? true : false }
                        />
                        <button className="delete-button" onClick={ event => handleDeleteRider(event, i) }>Ｘ</button>
                        <Modal 
                            isActive={ riderToDelete === i ? showDeletePopUp : false }
                            onCloseCallBack={ () => setShowDeletePopUp(false) }
                            direction={'4'}
                        >
                            <h2>Delete Rider?</h2>
                            <p>Are you sure you want to delete this rider? Entered information cannot be recovered.</p>
                            <div className='modal-buttons'>
                                <button 
                                    className='dull-button' 
                                    onClick={ (event) => { event.preventDefault(); setShowDeletePopUp(false); } }>
                                        Cancel
                                </button>
                                <button 
                                    className='delete-button' 
                                    onClick={ (event) => {event.preventDefault(); deleteRider(riderToDelete)} }>
                                        Delete
                                </button>
                            </div>
                        </Modal>
                    </td>
                </tr>
            );
        }
        return arr;
    }

    // (2 of 2) DEBUGGING: Print each rider's values
    useEffect(() => {

        console.log("___________UPDATED TABLE OF RIDERS_____________");
        console.log("\tNUM OF RIDERS: ", numOfRiders);
        console.log("\tRIDERS.......: ", ...listOfRiders);
        console.log("_______________________________________________\n\n");
        if (targetCustomer !== -1) { setRiderUpdated(true); }
    }, [numOfRiders, listOfRiders, toUpdate]);

    // Update customer attributes
    const handleCustomerUpdate = (event, category) => {

        event.preventDefault();
        const key = Object.keys(customerCategory).find(key => customerCategory[key] === category);
        updateCustomer(prevState => ({
            ...prevState,
            [key]: event.target.value
        }));

        // If fields are for "FULL NAME", concatenate all fields to become the display name, if enabled
        if ((category >= customerCategory.title) && (category <= customerCategory.displayName)) {

            toggleUpdateDisplayName(({updateDisplayName}) => ({
                status: !updateDisplayName,
                value: (category === customerCategory.displayName) ? event.target.value : ''
            }));
        }
        
        // If customer is also a rider, reflect the same information too
        if (customerIsRider && category > customerCategory.suffix && category <= customerCategory.fax) {
            for (let i = 0; i < numOfRiders; ++i) {
                if(listOfRiders[i].instanceId === 0) {
                    listOfRiders[i][key] = event.target.value;
                    break;
                }
            }
        }
    }

    // Update rider attributes
    const handleRiderUpdate = (entryId, event, category) => {

        event.preventDefault();
        const key = Object.keys(riderCategory).find(key => riderCategory[key] === category);

        switch (category) {

            case 0: // (0) Name

                listOfRiders[entryId][key] = event.target.value;
                toggleUpdate(!toUpdate);
                break;
            case 1: case 2: // (1) Age and (2) Weight

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
        } else {

            // Keep new value; if it's empty, choose default value of '0'
            if (value === '') { value = '0'; }
            toggleUpdate(!toUpdate);
        }

        return value;
    }

    // If number ends with a decimal with no numbers in the decimal place, add a '0' after it
    const fixDecimal = (i, event) => {
        event.preventDefault();

        if (!isNaN(listOfRiders[i].weight) && (listOfRiders[i].weight).endsWith('.')) {

            listOfRiders[i].weight += '0';
            toggleUpdate(!toUpdate);
        }
    }

    // Copy Shipping Address to Billing Address and clear Billing Address data
    const handleSameAddress = () => {
        setIsSameAddress(!isSameAddress);

        if (isSameAddress) {
            for (let i = customerCategory.b_streetAddress; i <= customerCategory.b_zipCode; ++i) {

                const key = Object.keys(customerCategory).find(k => customerCategory[k] === i);
                customer[key] = '';
            }
        }
    }

    // Commit data to database
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Display Name must be provided in order to create a customer record
        if (customer.displayName === '') {

            ref.current.scrollTo(0, 0);
            setShowErrorPopUp(true);
            return;
        }
  
        // Function for Person table

        try {
            const { data: userData , error: userError } = await supabase.from('Person')
            .insert([
                {
                    Main_Phone: customer.mainPhone,
                    Work_Phone: customer.workPhone,
                    Mobile_Phone: customer.mobilePhone,
                    Email: customer.email,
                    CC_Email: customer.CCEmail,
                    Fax: customer.fax
                }
            ])
            .select();

            const personId = userData[0].Person_id;
            console.log("USER DATA: ", userData)
            //console.log('Newly created person ID:', personId);

            if(userError) {
                console.error('Error inserting data:', userError.message);
            } else{
                console.log('Person Data inserted successfully:', userData);
            }

            const { data: customerData, error:customerError } = await supabase.from('Customer').insert([
                {
                    Display_Name: customer.displayName,
                    Title: customer.title,
                    First_Name: customer.firstName,
                    Middle_Name: customer.middleName,
                    Last_Name: customer.lastName,
                    Suffix: customer.suffix,
                    PrefersAM: customer.prefersAM,
                    PrefersPublic: customer.prefersShared,
                    Notes: customer.notes,
                    QuickBooks_id: customer.quickbooksId,
                    WebOrder_id: customer.webOrderId,
                    Person_id: personId // Use the obtained Person_id as foreign key
                }
            ]);

            if (customerError) {
                console.error('Error inserting data into Customer table:', customerError.message);
            } else {
                console.log('Customer Data inserted successfully into Customer table:', customerData);
            }

            const { data: addressData, error: addressError } = await supabase.from('Address').insert([
                {
                    Street_Address: customer.s_streetAddress,
                    City: customer.s_city,
                    State: customer.s_state,
                    Zip_Code: customer.s_zipCode
                }
            ])
            .select();

            const addressId = addressData[0].Address_id; // address id
            setaddressId(addressId);
            console.log("ADDRESS: ", addressId)

            if(addressError) {
                console.error('Error inserting data:', addressError.message);
            } else{
                console.log('Address Data inserted successfully:', addressData);
            }

            const { data: personAddressData, error: personAddressError } = await supabase.from('PersonAddress').insert([
                {
                    Person_id: personId,
                    Address_id: addressId,
                    Type: 'Shipping'
                }
            ]);
            
            if(personAddressError) {
                console.error('Error inserting data:', personAddressError.message);
            } else{
                console.log('Address Data inserted successfully:', personAddressData);
            }

            if (isSameAddress) {
                const { data: personAddressData, error: personAddressError } = await supabase.from('PersonAddress').insert([
                    {
                        Person_id: personId,
                        Address_id: addressId, // Assuming you have already obtained the ID of the shipping address
                        Type: 'Billing'
                    }
                ]);

                if(personAddressError) {
                    console.error('Error inserting data:', personAddressError.message);
                } else{
                    console.log('AutoBilling Address Data inserted successfully:', personAddressData);
                }
            } else {
                const { data: billingAddressData, error: billingAddressError } = await supabase.from('Address').insert([
                    {
                        Street_Address: customer.b_streetAddress,
                        City: customer.b_city,
                        State: customer.b_state,
                        Zip_Code: customer.b_zipCode
                    }
                ]);

                if(billingAddressError) {
                    console.error('Error inserting data:', billingAddressError.message);
                } else{
                    console.log('Billing Data inserted successfully:', billingAddressData);
                }
            }
            

            
            for (let i = 0; i < numOfRiders; ++i) {
                const rider = listOfRiders[i];
            
                // Extract rider properties
                const instanceId = rider.instanceId;
                const name = rider.name;
                const age = rider.age;
                const weight = rider.weight;
                const mainPhone = rider.mainPhone;
                const workPhone = rider.workPhone;
                const mobilePhone = rider.mobilePhone;
                const email = rider.email;
                const CCEmail = rider.CCEmail;
                const fax = rider.fax;

                if (instanceId === 0) { // This is the customer as a rider
                    // Insert rider data into Rider table using the customer's Person_id
                    const { data: riderData, error: riderError } = await supabase.from('Rider').insert([
                        {
                            Person_id: personId,
                            Name: name,
                            Age: age,
                            Weight: weight,
                            Parent_Display_Name: customer.displayName
                        }
                    ]);
                    if (riderError) {
                        console.error('Error inserting data into Rider table:', riderError.message);
                    } else {
                        console.log('customer as rider data inserted successfully:', riderData);
                    }
                } else { // For all other riders
                    // Insert rider data into Person table
                    const { data: personData, error: personError } = await supabase.from('Person').insert([
                        {
                            Main_Phone: mainPhone,
                            Work_Phone: workPhone,
                            Mobile_Phone: mobilePhone,
                            Email: email,
                            CC_Email: CCEmail,
                            Fax: fax
                        }
                    ])
                    .select();

                    const riderPersonId = personData[0].Person_id;
                    console.log("USER DATA: ", addressData)

                    if (personError) {
                        console.error('Error inserting data into Rider table:', personError.message);
                    } else {
                        console.log('customer as rider data inserted successfully:', personData);
                    }

                    const { data: riderData, error: riderError } = await supabase.from('Rider').insert([
                        {
                            Person_id: riderPersonId,
                            Name: name,
                            Age: age,
                            Weight: weight,
                            Parent_Display_Name: customer.displayName
                        }
                    ]);

                    if (riderError) {
                        console.error('Error inserting data into Rider table:', riderError.message);
                    } else {
                        console.log('rider data inserted successfully:', riderData);
                    }
                }
            }
            
        window.location.reload();
        } catch (error) {
            console.error('Error submitting form', error.message);
        }
    }

    const populateCustomer = async () => {

        try {
            // Get customer record
            const { data, error } = await supabase
            .from("Customer")
            .select()
            .eq('Person_id', targetCustomer['Person_id'])
            .limit(1);

            if (error) {
                throw error;
            }

            const c = data[0];

            // Check if display name matches full name
            /*const fullName = ((c['Title'] ? c['Title'] + ' ' : '')
                              + (c['First_Name'] ? c['First_Name'] + ' ' : '')
                              + (c['Middle_Name'] ? c['Middle_Name'] + ' ' : '')
                              + (c['Last_Name'] ? c['Last_Name'] + ' ' : '')
                              + (c['Suffix'] ? c['Suffix'] : '')).trim();*/

            //setAutoDisplayName(c['Display_Name'] === fullName ? true : false);
            setAutoDisplayName(false);
            setDisableDisplayName(true);
            
            // Update customer
            updateCustomer(prevState => ({
                ...prevState,
                title: c['Title'], firstName: c['First_Name'], middleName: c['Middle_Name'], 
                lastName: c['Last_Name'], suffix: c['Suffix'], displayName: c['Display_Name'], 
                webOrderId: c['WebOrder_id'], quickbooksId: c['QuickBooks_id'], notes: c['Notes']
            }));
            setPrefersAM(c['PrefersAM']);
            setPrefersShared(c['PrefersPublic']);


        } catch (error) {
            console.error('Error Populating Customer Fields:', error.message);
        }
    }

    const populateContacts = async () => {

        try {
            // Get customer record
            const { data, error } = await supabase
            .from("Person")
            .select()
            .eq('Person_id', targetCustomer['Person_id'])
            .limit(1);

            if (error) {
                throw error;
            }

            const c = data[0];
            
            // Update customer's contacts
            updateCustomer(prevState => ({
                ...prevState,
                mainPhone: c['Main_Phone'], workPhone: c['Work_Phone'], 
                mobilePhone: c['Mobile_Phone'], email: c['Email'], 
                CCEmail: c['CC_Email'], fax: c['Fax'],
            }));

        } catch (error) {
            console.error('Error Populating Contact Fields:', error.message);
        }
    }

    // Get shipping and billing addresses
    const populateAddress = async () => {

        try {
            // Get customer record
            const { data: bothAddressData, error } = await supabase
            .from("PersonAddress")
            .select()
            .eq('Person_id', targetCustomer['Person_id']);

            if (error) {
                throw error;
            }

            const c = bothAddressData;
            const shippingExists = c[0] ? true : false;
            const billingExists = c[1] ? true : false;

            const isShipping = c[0]['Type'] === 'Shipping';
            let shippingAddress_id = -1;
            let billingAddress_id = -2;
            if (shippingExists && billingExists) {
                shippingAddress_id = isShipping ? c[0]['Address_id'] : c[1]['Address_id'];
                billingAddress_id = (!isShipping && c[1]) ? c[0]['Address_id'] : c[1]['Address_id'];
            } else {
                shippingAddress_id = c[0]['Address_id'];
            }

            setShippingAddressId(shippingAddress_id);
            setBillingAddressId(billingAddress_id);

            if (shippingAddress_id === billingAddress_id)
                setIsSameAddress(true);

            const { data: s_addressData, s_addressError } = await supabase
            .from("Address")
            .select()
            .eq('Address_id', shippingAddress_id);

            if (s_addressError) {
                throw s_addressError;
            }

            // Update customer's addresses
            updateCustomer(prevState => ({
                ...prevState,
                s_streetAddress: s_addressData[0]['Street_Address'], s_city: s_addressData[0]['City'], 
                s_state: s_addressData[0]['State'], s_zipCode: s_addressData[0]['Zip_Code'],               
            }));

            if (billingAddress_id !== -2) {
                const { data: b_addressData, b_addressError } = await supabase
                .from("Address")
                .select()
                .eq('Address_id', billingAddress_id);

                if (b_addressError) {
                    throw b_addressError;
                }

                updateCustomer(prevState => ({
                    ...prevState,            
                    b_streetAddress: b_addressData[0]['Street_Address'], b_city: b_addressData[0]['City'], 
                    b_state: b_addressData[0]['State'], b_zipCode: b_addressData[0]['Zip_Code'],  
                }));

                if (s_addressError || b_addressError) {
                    throw s_addressError ? s_addressError : b_addressError;
                }
            }
        } catch (error) {
            console.error('Error Populating Address Fields:', error.message);
        }
    }

    const populateRiders = async () => {

        try {
            const { data, error } = await supabase
            .from("Rider")
            .select()
            .eq('Parent_Display_Name', targetCustomer['Display_Name']);

            if (error) {
                throw error;
            }

            setNumOfRiders(data.length);
            for (let i = 0; i < data.length; ++i) {
                const r = data[i];
                setRiderPID(riderPID => [...riderPID, r['Person_id']]);

                // Also get riders' contacts
                const { data: contactData, contactError } = await supabase
                .from("Person")
                .select()
                .eq('Person_id', r['Person_id']);

                if (contactError) {
                    throw contactError;
                }

                const c = contactData[0];

                appendRider(listOfRiders => [...listOfRiders, Rider(Date.now(), r['Name'], r['Age'], r['Weight'], 
                        c['Main_Phone'], c['Work_Phone'], c['Mobile_Phone'], 
                        c['Email'], c['CC_Email'], c['Fax'])]);
            }
        } catch (error) {
            console.error('Error Populating Rider Entries:', error.message);
        }
    }

    // If given a customer from an external source, populate the fields and change to update buttons
    const populateFields = () => {

        populateCustomer();
        populateContacts();
        populateAddress();
        populateRiders();
    }

    // Update customer info
    const updateCustomerInfo = async () => {

        try {
            const { error } = await supabase
            .from("Customer")
            .update({
                Title: customer.title,
                First_Name: customer.firstName,
                Middle_Name: customer.middleName,
                Last_Name: customer.lastName,
                Suffix: customer.suffix,
                PrefersAM: customer.prefersAM,
                PrefersPublic: customer.prefersShared,
                Notes: customer.notes,
                QuickBooks_id: customer.quickbooksId,
                WebOrder_id: customer.webOrderId
            })
            .eq('Person_id', targetCustomer['Person_id']);

            if (error) {
                throw error;
            }

        } catch (error) {
            console.error('Error Updating Customer Info:', error.message);
        }
    }

    // Update customer's contact
    const updateContact = async () => {

        try {
            const { error } = await supabase
            .from("Person")
            .update({
                Main_Phone: customer.mainPhone,
                Work_Phone: customer.workPhone,
                Mobile_Phone: customer.mobilePhone,
                Email: customer.email,
                CC_Email: customer.CCEmail,
                Fax: customer.fax
            })
            .eq('Person_id', targetCustomer['Person_id']);

            if (error) {
                throw error;
            }

        } catch (error) {
            console.error("Error Updating Customer's Contacts:", error.message);
        }
    }

    // Update customer's address
    const updateAddress = async () => {

        try {
            const { s_error } = await supabase
            .from("Address")
            .update({
                Street_Address: customer.s_streetAddress,
                City: customer.s_city,
                State: customer.s_state,
                Zip_Code: customer.s_zipCode,
            })
            .eq('Address_id', shippingAddressId);

            if (s_error) {
                throw s_error;
            }

            if (!isSameAddress) {
                const { b_error } = await supabase
                .from("Address")
                .update({
                    Street_Address: customer.b_streetAddress,
                    City: customer.b_city,
                    State: customer.b_state,
                    Zip_Code: customer.b_zipCode,
                })
                .eq('Address_id', billingAddressId);

                if (b_error) {
                    throw b_error;
                }
            }

        } catch (error) {
            console.error("Error Updating Customer's Addresses:", error.message);
        }
    }

    // Update customer's riders; either update existing
    const updateCustomerRiders = async () => {

        if (!ridersUpdated) {return;}
        for (let i = 0; i < numOfRiders; ++i) {
            try {
                if (riderPID[i]) {
                    const { r_error } = await supabase
                    .from("Rider")
                    .update({
                        Name: listOfRiders[i].name,
                        Age: listOfRiders[i].age,
                        Weight: listOfRiders[i].weight,
                    })
                    .eq('Person_id', riderPID[i]);

                    if (r_error) {
                        throw r_error;
                    }

                    const { p_error } = await supabase
                    .from("Person")
                    .update({
                        Main_Phone: listOfRiders[i].mainPhone,
                        Work_Phone: listOfRiders[i].workPhone,
                        Mobile_Phone: listOfRiders[i].mobilePhone,
                        Email: listOfRiders[i].email,
                        CC_Email: listOfRiders[i].CCEmail,
                        Fax: listOfRiders[i].fax
                    })
                    .eq('Person_id', riderPID[i]);

                    if (p_error) {
                        throw p_error;
                    }
                } else { // Insert new rider
                    const riderIsCustomer = listOfRiders[i].instanceId === 0;

                    let data;
                    if (!riderIsCustomer) {
                        const { data: d, p_error } = await supabase
                        .from("Person")
                        .insert({
                            Main_Phone: listOfRiders[i].mainPhone,
                            Work_Phone: listOfRiders[i].workPhone,
                            Mobile_Phone: listOfRiders[i].mobilePhone,
                            Email: listOfRiders[i].email,
                            CC_Email: listOfRiders[i].CCEmail,
                            Fax: listOfRiders[i].fax
                        })
                        .select()

                        if (p_error) {
                            throw p_error;
                        }
                        data = d;
                    }

                    const { r_error } = await supabase
                    .from("Rider")
                    .insert({
                        Person_id: riderIsCustomer ? targetCustomer['Person_id'] : data[0]['Person_id'],
                        Name: listOfRiders[i].name,
                        Age: listOfRiders[i].age,
                        Weight: listOfRiders[i].weight,
                        Parent_Display_Name: customer.displayName
                    })

                    if (r_error) {
                        throw r_error;
                    }
                }

            } catch (error) {
                console.error("Error Updating Rider Info:", error.message);
            }
        }
    }

    // Handle update customer information upon user confirmation
    const handleUpdate = (event) => {
        event.preventDefault();

        updateContact();
        updateCustomerInfo();
        updateAddress();
        //updateCustomerRiders();
    }

    return (

            <form className="form-container" onSubmit={(targetCustomer !== -1) ? handleUpdate : handleSubmit}>
                <div ref={ref} className="form-main-content">
                    
                    {/* Add additional form sections */}
                    {/* Full Name */}
                    <div className="form-section">
                        <h2 className="form-title">Full Name</h2>
                        <div className="form-body">
                            <div className="form-body-wrapper_flex-column">
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex1">
                                        <label htmlFor="name-title">Title</label>
                                        <input 
                                            id="name-title"
                                            type="text"
                                            value={customer.title}
                                            onChange={event => handleCustomerUpdate(event, customerCategory.title)}
                                        />
                                    </div>
                                    <div className="form-field flex3">
                                        <label htmlFor="first-name">First Name</label>
                                        <input 
                                            id="first-name" 
                                            type="text" 
                                            value={customer.firstName} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.firstName)}
                                        />
                                    </div>
                                    <div className="form-field flex2">
                                        <label htmlFor="middle-name">Middle Name</label>
                                        <input 
                                            id="middle-name" 
                                            type="text" 
                                            value={customer.middleName} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.middleName)}
                                        />
                                    </div>
                                    <div className="form-field flex3">
                                        <label htmlFor="last-name">Last Name</label>
                                        <input 
                                            id="last-name" 
                                            type="text" 
                                            value={customer.lastName} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.lastName)}
                                        />
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="suffix">Suffix</label>
                                        <input 
                                            id="suffix" 
                                            type="text" 
                                            value={customer.suffix} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.suffix)}
                                        />
                                    </div>
                                </div>
                                <div className="display-name-container">
                                    <label htmlFor="display-name" className="form-text">Customer Display Name (required)</label>
                                    <span>
                                        <input 
                                            className="form-checkbox" 
                                            id="display-name-toggle" 
                                            type="checkbox" 
                                            checked={!autoDisplayName}
                                            onChange={handleDisplayNameToggle}
                                            disabled={disableDisplayName}
                                        />
                                        <label className="form-checkbox-text" htmlFor="display-name-toggle">Override Display Name</label>
                                        <Modal 
                                            isActive={ showErrorPopUp }
                                            onCloseCallBack={() => setShowErrorPopUp(false)}
                                            direction={'2'}
                                        >
                                            <h2>Customer Display Name</h2>
                                            <p>Display name is required and must not be used by another customer.</p>
                                            <div className='modal-buttons'>
                                                <button 
                                                    className='option-button' 
                                                    onClick={(event) => {event.preventDefault(); setShowErrorPopUp(false);}}>
                                                        Close
                                                </button>
                                            </div>
                                        </Modal>
                                    </span>
                                    <div className="form-field">
                                        <input 
                                            id="display-name"
                                            type="text"
                                            value={customer.displayName}
                                            onChange={event => handleCustomerUpdate(event, customerCategory.displayName)}
                                            disabled={autoDisplayName || disableDisplayName}
                                        />
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
                                        <input 
                                            id="name-phone" 
                                            type="tel" 
                                            value={customer.mainPhone} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.mainPhone)}
                                        />
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="email">Email</label>
                                        <input 
                                            id="email" 
                                            type="email" 
                                            value={customer.email} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.email)}
                                        />
                                    </div>
                                </div>
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex1">
                                        <label htmlFor="work-phone">Work Phone Number</label>
                                        <input 
                                            id="work-phone" 
                                            type="tel" 
                                            value={customer.workPhone} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.workPhone)}
                                        />
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="cc-email">CC Email</label>
                                        <input 
                                            id="cc-email" 
                                            type="email" 
                                            value={customer.CCEmail} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.CCEmail)}
                                        />
                                    </div>
                                </div>
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex1">
                                        <label htmlFor="mobile-phone">Mobile Phone Number</label>
                                        <input 
                                            id="mobile-phone" 
                                            type="tel" 
                                            value={customer.mobilePhone} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.mobilePhone)}
                                        />
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="fax">Fax</label>
                                        <input 
                                            id="fax" 
                                            type="text" 
                                            value={customer.fax} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.fax)}
                                        />
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
                                    <input 
                                        id="street-address" 
                                        type="text" 
                                        value={customer.s_streetAddress} 
                                        onChange={event => handleCustomerUpdate(event, customerCategory.s_streetAddress)}
                                    />
                                </div>
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex5">
                                        <label htmlFor="street-address">City</label>
                                        <input 
                                            id="street-address" 
                                            type="text" 
                                            value={customer.s_city} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.s_city)}
                                        />
                                    </div>
                                    <div className="form-field flex0-1">
                                        <label htmlFor="street-address">State</label>
                                        <input 
                                            id="street-address" 
                                            type="text" 
                                            value={customer.s_state} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.s_state)}
                                        />
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="street-address">Zip Code</label>
                                        <input 
                                            id="street-address" 
                                            type="text" 
                                            value={customer.s_zipCode} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.s_zipCode)}
                                        />
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
                                    <input 
                                        className="form-checkbox" 
                                        id="same-as-toggle" 
                                        type="checkbox" 
                                        checked={isSameAddress} 
                                        onChange={handleSameAddress}
                                    />
                                    <label className="form-checkbox-text" htmlFor="same-as-toggle">
                                        Use same shipping address
                                    </label>
                                </span>
                                <div className="form-field">
                                    <label htmlFor="street-address">Street Address</label>
                                    <input 
                                        id="street-address" 
                                        type="text" 
                                        value={isSameAddress ? customer.s_streetAddress : customer.b_streetAddress} 
                                        onChange={event => handleCustomerUpdate(event, customerCategory.b_streetAddress)}
                                        disabled={isSameAddress ? true : undefined}
                                    />
                                </div>
                                <div className="form-body-wrapper_flex-row">
                                    <div className="form-field flex5">
                                        <label htmlFor="street-address">City</label>
                                        <input 
                                            id="street-address" 
                                            type="text" 
                                            value={isSameAddress ? customer.s_city : customer.b_city} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.b_city)}
                                            disabled={isSameAddress ? true : undefined}
                                        />
                                    </div>
                                    <div className="form-field flex0-1">
                                        <label htmlFor="street-address">State</label>
                                        <input 
                                            id="street-address" 
                                            type="text" 
                                            value={isSameAddress ? customer.s_state : customer.b_state} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.b_state)}
                                            disabled={isSameAddress ? true : undefined}
                                        />
                                    </div>
                                    <div className="form-field flex1">
                                        <label htmlFor="street-address">Zip Code</label>
                                        <input 
                                            id="street-address" 
                                            type="text" 
                                            value={isSameAddress ? customer.s_zipCode : customer.b_zipCode} 
                                            onChange={event => handleCustomerUpdate(event, customerCategory.b_zipCode)}
                                            disabled={isSameAddress ? true : undefined}
                                        />
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
                                <input 
                                    className="form-checkbox" 
                                    id="customer-as-rider-toggle" 
                                    type="checkbox" 
                                    checked={customerIsRider} 
                                    onChange={handleCustomerRiderToggle}
                                />
                                <label 
                                    className="form-checkbox-text" 
                                    htmlFor="customer-as-rider-toggle">
                                        Add customer as a rider too
                                </label>
                            </span>
                            <table className="form-rider-table">
                                <thead>
                                    <tr>
                                        <th scope="col" width="6%">#</th>
                                        <th scope="col" width="26%">Name</th>
                                        <th scope="col" width="8%">Age</th>
                                        <th scope="col">Weight (lbs)</th>
                                        <th scope="col" width="34%">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {showRiderRows()}
                                </tbody>
                            </table>
                            </div>
                            <button className="submit-button" onClick={handleAddRider}>Add Rider</button>
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
                                            <DropdownMenu 
                                                itemList={["AM", "PM"]} 
                                                htmlForRef="am-toggle" 
                                                label="AM/PM" 
                                                value={prefersAM ? "AM" : "PM"}
                                                callback={(value) => setPrefersAM(value === "AM")} 
                                            />
                                        </span>
                                            <DropdownMenu 
                                                itemList={["Shared", "Private"]} 
                                                htmlForRef="public-toggle" 
                                                label="Shared/Private" 
                                                value={prefersShared ? "Shared" : "Private"}
                                                callback={(v) => setPrefersShared(v === "Shared")}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-body-wrapper_flex-row form-body-external-ids">
                                        <div className="form-field">
                                            <label htmlFor="webOrderId">Web Order ID</label>
                                            <input 
                                                id="webOrderId" 
                                                type="text"
                                                value={customer.webOrderId} 
                                                onChange={event => handleCustomerUpdate(event, customerCategory.webOrderId)}
                                            />
                                        </div>
                                        <div className="form-field">
                                            <label htmlFor="quickbooksId">QuickBooks ID</label>
                                            <input 
                                                id="quickbooksId"
                                                type="text"
                                                value={customer.quickbooksId} 
                                                onChange={event => handleCustomerUpdate(event, customerCategory.quickbooksId)}
                                            />
                                        </div> 
                                    </div>
                                    </div>
                                <div className="form-field">
                                    <textarea 
                                        className="form-text-field" 
                                        rows="8" 
                                        value={customer.notes} 
                                        onChange={event => handleCustomerUpdate(event, customerCategory.notes)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="form-buttons">
                    <button 
                        type="submit" 
                        className="submit-button">
                            {(targetCustomer !== -1) ? "Update Customer" : "Create Customer"}
                    </button>
                </div>
                <ENC addressId = {addressId}/>
            </form>
    )
}

export default Form;