import { useState, useEffect } from 'react';
import { supabase } from '../../supabase';
import SearchBar from '../SearchBar/SearchBar';
import Modal from '../Modal/Modal';

import './CustomerList.css';

// Enum for page navigation
const pageCategory = Object.freeze({ 

    prev: 0, next: 1
});

function CustomerList({ increment, optionCallBack, selectedCustomerCallBack }) {
    const [page, setPage] = useState(1);
    const [range, setRange] = useState({ from: 0, to: increment });
    const [customers, setCustomers] = useState([]);
    const [customerContact, setCustomerContacts] = useState([]);
    const [customerRiders, setCustomerRiders] = useState([]);
    const [ridersToView, setRidersToView] = useState([]);
    const [customerToDelete, setCustomerToDelete] = useState([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [toSearch, toggleSearch] = useState(false); // Toggling to active useEffect

    // Initialize page with first set of customers
    useEffect(() => {
        fetchCustomers();
    }, []);

    // Get other information related to the customer
    useEffect(() => {
        fetchContactInfo();
        fetchRiders();
    }, [customers]);

    // Fetch next set of customers
    useEffect(() => {
        fetchCustomers();
    }, [range]);

    // Fetch similar customers to query
    useEffect(() => {
        if (searchQuery === '') {return;}

        fetchSimilarCustomers();
    }, [toSearch]);

    // Restore when query is empty
    useEffect(() => {
        if (searchQuery !== '') {return;}

        fetchCustomers();
    }, [searchQuery]);

    const fetchCustomers = async () => {

        try {
            // Query customers in range
            const { data: customerData, error } = await supabase
                .from('Customer')
                .select('*')
                .range(range.from, range.to);

            if (error) {
                throw error;
            }

            // Store Person_id of each customer in the current page
            const arr = [];
            for (const customer of customerData) {
                arr.push(customer);
            }
            setCustomers(arr);
            
        } catch (error) {
            console.error('Error getting customer list:', error.message);
        }
    }

    const fetchContactInfo = async () => {

        try {
            // Query customer contact info in range
            const arr = [];
            for (const customer of customers) {
                const { data: contactData, error } = await supabase
                    .from('Person')
                    .select('*')
                    .eq('Person_id', customer['Person_id'])

                if (error) {
                    throw error;
                }

                // Store Person_id of each customer in the current page
                for (const contactInfo of contactData) {
                    arr.push(contactInfo);
                }
            }
            setCustomerContacts(arr);
            
        } catch (error) {
            console.error('Error getting contact info:', error.message);
        }
    }

    const fetchRiders = async () => {

        try {
            // Query customer contact info in range
            const arr = [];
            for (const customer of customers) {
                const { data: riderData, error } = await supabase
                    .from('Rider')
                    .select('*')
                    .eq('Parent_Display_Name', customer['Display_Name']);

                if (error) {
                    throw error;
                }

                // Store Person_id of each customer in the current page
                const customerRiders = [];
                for (const rider of riderData) {
                    customerRiders.push(rider);
                }
                arr.push(customerRiders);
            }
            setCustomerRiders(arr);
            
        } catch (error) {
            console.error('Error getting contact info:', error.message);
        }
    }

    // Search for similar customers to input
    const fetchSimilarCustomers = async () => {

        const arr = [];
        try {
            const { data: searchData, error } = await supabase
            .from("Customer")
            .select()
            .ilike('Display_Name', `%${searchQuery}%`);

            if (error) {
                throw error;
            }

            for (const data of searchData) {
                arr.push(data);
            }
            setCustomers(arr);

        } catch (error) {
            console.error('Error answering search query:', error.message);
        }
    }

    const renderCustomerContacts = () => {

        const arr = [];
        for (const contact of customerContact) {
            arr.push(
                <>
                    <td>{contact['Main_Phone'] ? contact['Main_Phone'] : '-'}</td>
                    <td>{contact['Email'] ? contact['Email'] : '-'}</td>
                </>
            );
        }
        return arr;
    }

    const renderRiders = () => {

        const arr = [];
        for (let i = 0; i < customerRiders.length; ++i) { // parent
            const innerArr = [];
            for (const rider of customerRiders[i]) { // children
                innerArr.push(
                        <tbody className='customer-table-content'>
                            <tr className='customer-table-item'>
                                <td>{rider['Name'] ? rider['Name'] : '-'}</td>
                                <td>{rider['Age'] ? rider['Age'] : '-'}</td>
                                <td>{rider['Weight'] ? rider['Weight'] : '-'}</td>
                            </tr>
                        </tbody>
                );
            }

            // Put each customer's riders inside a parent array
            arr.push(
                <table className='customer-search-table rider-table'>
                    <thead className='customer-table-header'>
                        <tr>
                            <th scope="col" width="35%">Name</th>
                            <th scope="col" width="10%">Age</th>
                            <th scope="col" width="10%">Weight</th>
                        </tr>
                    </thead>
                    {innerArr}
                </table>
            );
        }
        return arr;
    }

    const renderCustomers = () => {
        const contactArr = renderCustomerContacts();
        const riderArr = renderRiders();

        const arr = [];
        for (let i = 0; i < customers.length; ++i) {
            arr.push(
                <tr key={i} className='customer-table-item'>
                    <td>{customers[i]['Display_Name']}</td>
                    {contactArr[i] 
                    ? (contactArr[i]) 
                    : (
                        <>
                            <td>-</td>
                            <td>-</td>
                        </>
                    )}
                    <td className="form-body-wrapper_flex-row">
                        <button 
                            className='option-button' 
                            onClick={(event) => handleRiderViewButton(event, i)}>
                                View Riders
                        </button>
                        {(ridersToView === i) && (
                            <div className="customer-rider-table">
                                {riderArr[i]}
                            </div>
                        )}
                        <button 
                            className='submit-button'
                            onClick={() => handleSelectedCustomer(i)}>
                                Edit
                        </button>
                        <button 
                            className='delete-button'
                            onClick={(event) => handleDeleteCustomer(event, i)}>
                                Delete
                        </button>
                        <Modal 
                            isActive={ customerToDelete === i ? true : false }
                            onCloseCallBack={ () => setCustomerToDelete([]) }
                            direction={'4'}
                        >
                            <h2>Delete Customer?</h2>
                            <p>Are you sure you want to delete this customer? Saved information will be lost forever.</p>
                            <div className='modal-buttons'>
                                <button 
                                    className='dull-button' 
                                    onClick={ (event) => { event.preventDefault(); setCustomerToDelete([]); } }>
                                        Cancel
                                </button>
                                <button 
                                    className='delete-button' 
                                    onClick={ (event) => {event.preventDefault(); deleteCustomer(i)} }>
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

    const goToPage = (nextPage) => {
        if (nextPage === 0 && range.from === 0) {return;}
        const isNextPage = nextPage === 1 ? true : false;

        // Reset current information
        setCustomers([]);
        setCustomerContacts([]);
        setCustomerRiders([]);
        setRidersToView([]);
        setSearchQuery('');

        // Modify range to get the next set of customers to display
        const newPage = isNextPage ? (page + 1): (page - 1);
        setPage(newPage);

        const newFrom = isNextPage ? (range.to + 1) : (range.from - increment - 1) ;
        const newTo = newFrom + increment;
        setRange({from: newFrom, to: newTo});
    }

    const handleRiderViewButton = (event, idx) => {
        event.preventDefault();
        if (idx === ridersToView) 
            setRidersToView(-1);
        else
            setRidersToView(idx);
    }

    // Update query as the user types in the address
    const handleQueryChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleQuerySubmit = (event) => {
        event.preventDefault();
        toggleSearch(!toSearch);
    }

    // Index is relative to the position of the customer in the table
    const handleDeleteCustomer = (event, idx) => {
        event.preventDefault();
        setCustomerToDelete(idx);
    }

    // Bring up selected customer's form
    const handleSelectedCustomer = (idx) => {
        //selectedCustomerCallBack(customers[idx]['Person_id'])
        selectedCustomerCallBack(customers[idx])
        optionCallBack(1); // 0 For "Customer" list; 1 for "Form"
    }

    const deleteCustomer = async (idx) => {
        // Use Person_id and the deletion will cascade to the Customer record itself
        try {
            const { data, error } = await supabase
                .from('Person')
                .delete()
                .eq('Person_id', customers[idx]['Person_id']);

            if (error) {
                throw error;
            }

        } catch (error) {
            console.error('Error deleting account:', error.message);
        }

        // Restore default state
        setCustomerToDelete([]);
        if (searchQuery === '')
            fetchCustomers();
        else
            fetchSimilarCustomers();
    }
    
    return (

        <>
            <div className="customer-table-options">
                <div className='customer-table-searchbar'>
                    <SearchBar 
                        placeholder='Type Customer Display Name' 
                        value={searchQuery}
                        onChangeMethod={(event) => handleQueryChange(event)}
                        onSubmitMethod={(event) => handleQuerySubmit(event)}
                    />
                </div>
                <div className='customer-table-buttons'>
                    <button className='option-button' onClick={() => goToPage(pageCategory.prev)}>
                        ⟨Prev Page
                    </button>
                    <p>{page}</p>
                    <button className='option-button' onClick={() => goToPage(pageCategory.next)}>
                        Next Page⟩
                    </button>
                </div>
            </div>
            <table className='customer-search-table customer-table'>
                <thead className='customer-table-header'>
                    <tr>
                        <th scope="col" width="22%">Display Name</th>
                        <th scope="col" width="12%">Main Phone</th>
                        <th scope="col" width="20%">Email</th>
                        <th scope="col" width="21%">Actions</th> {/* Include "View Riders" button, "Edit"*/}
                    </tr>
                </thead>
                <tbody className='customer-table-content'>
                    {renderCustomers()}
                </tbody>
            </table>
        </>
    );
}

export default CustomerList;