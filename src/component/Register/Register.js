import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase';

import './Register.css';

function Register() {

    const [Name, setUsername] = useState(''); // Set the registered username as an independent state
    const [Pin, setPassword] = useState('');
    const [Email, setEmail] = useState('');
    const [Weight, setWeight] = useState('');
    const [Scope, setPermission] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [owner, setOwner] = useState(false); // Add owner state
    const [loginData, setLoginData] = useState([]);
    const [showRegisterPopup, setShowRegisterPopup] = useState(false);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [deletingUser, setDeletingUser] = useState('');
    const [editingUser, setEditingUser] = useState('');
    const [showEditPopup, setShowEditPopup] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editWeight, setEditWeight] = useState('');

    // Promote the definition of the checkPermission function
    const checkPermission = async (name) => { // Accept username as a parameter

        try {
            // Query all user login data
            const { data: allLoginData, error } = await supabase
                .from('Employee')
                .select('*');

            if (error) {
                throw error;
            }

            // Store user permission information
            const login = allLoginData.find(user => user.Name === name); // Find information of the currently logged-in user
            if (login && login.Scope) {
                setPermission(login.Scope);

                if (login.Scope !== 'owner') {
                    // If the user's permission is not owner, redirect to another page or display the appropriate message
                    console.log('Permission denied. Redirecting...');
                    setOwner(false);
                } else {
                    setOwner(true);
                    console.log('You are owner!');
                }
            } else {
                console.log('User not found or scope not defined.');
                setOwner(false);
            }

            // Set all login data to the state
            setLoginData(allLoginData);
        } catch (error) {
            console.error('Error checking permission:', error.message);
        }
    };

    useEffect(() => {

        let mounted = true; // Set a flag to track whether the component is unmounted

        const usernameFromLocal = localStorage.getItem('username');
        if (usernameFromLocal) {
            checkPermission(usernameFromLocal); // Check permissions using the current logged-in username
        }

        // Clean-up logic when the component unmounts
        return () => {
            mounted = false;
        };
    }, [Name]); // Use name as a dependency

    const handleRegister = async (event) => {
        event.preventDefault();

        try {
            // Check if username and password are empty
            if (!Name || !Pin) {
                throw new Error('Username and password are required.');
            }
            if (!Email) {
                throw new Error('Email address cannot be empty.');
            }
            if (!Weight) {
                throw new Error('Missing weight information.');
            }

            // Insert registration information into the login table in Supabase
            const { data, error } = await supabase
                .from('Employee')
                .insert([
                    { Name, Pin, Email, Weight }
                ])
                .select();

            if (error) {
                throw error;
            }

            console.log('Account registered successfully:', data);

            // Clear the form
            setUsername('');
            setPassword('');
            setEmail('');
            setWeight('');
            setPermission('');
            setErrorMessage('');
            // Close the registration popup
            setShowRegisterPopup(false);

            window.location.reload();
        } catch (error) {
            // Handle errors
            console.error('Error registering account:', error.message);
            setErrorMessage(error.message);
        }
    };

    const handleDelete = async () => {

        try {
            // Delete data for the specified username in Supabase
            const { data, error } = await supabase
                .from('Employee')
                .delete()
                .eq('Name', deletingUser);

            if (error) {
                throw error;
            }

            console.log('Account deleted successfully:', data);

            // Close the confirmation popup
            setShowConfirmationPopup(false);

            // Refresh data
            const { data: refreshedData, error: refreshError } = await supabase
                .from('Employee')
                .select('*');

            if (refreshError) {
                throw refreshError;
            }

            setLoginData(refreshedData);
        } catch (error) {
            console.error('Error deleting account:', error.message);
            setErrorMessage(error.message);
        }
    };

    const handleEdit = async (event) => {
        event.preventDefault();

        try {
            // Update data for the specified username in Supabase
            const { data, error } = await supabase
                .from('Employee')
                .update({ Name: editName, Email: editEmail, Weight: editWeight })
                .eq('Name', editingUser);

            if (error) {
                throw error;
            }

            console.log('Account updated successfully:', data);

            // Close the edit popup
            setShowEditPopup(false);

            // Refresh data
            const { data: refreshedData, error: refreshError } = await supabase
                .from('Employee')
                .select('*');

            if (refreshError) {
                throw refreshError;
            }

            setLoginData(refreshedData);
        } catch (error) {
            console.error('Error editing account:', error.message);
            setErrorMessage(error.message);
        }
    };

    return (

        <div className="register-container">
            <h2>User Management</h2>
            {owner && ( // Display user management table only when owner is true
                <table className="login-table">
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Scope</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loginData.map((Employee, index) => (
                            <tr key={index}>
                                <td>{Employee.Name}</td>
                                <td>{Employee.Email}</td>
                                <td>{Employee.Scope}</td>
                                <td>
                                    <button className="edit-button" onClick={() => {
                                        setEditingUser(Employee.Name);
                                        setEditName(Employee.Name);
                                        setEditEmail(Employee.Email);
                                        setEditWeight(Employee.Weight);
                                        setShowEditPopup(true);
                                    }}>Edit</button>
                                </td>
                                <td>
                                    <button className="delete-button" onClick={() => {
                                        setDeletingUser(Employee.Name);
                                        setShowConfirmationPopup(true);
                                    }}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {owner && ( // Display register button only when owner is true
                <button className="register-button" onClick={() => setShowRegisterPopup(true)}>Register</button>
            )}
            {showRegisterPopup && (
                <div className="register-popup">
                    <div className="register-form">
                        <span className="close-button" onClick={() => setShowRegisterPopup(false)}>X</span>
                        <h2>Register</h2>
                        <form onSubmit={handleRegister}>
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                value={Name}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                value={Pin}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <label htmlFor="Weight">Weight:</label>
                            <input
                                type="Weight"
                                id="Weight"
                                value={Weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                value={Email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                            <button type="submit">Register</button>
                        </form>
                    </div>
                </div>
            )}
            {showEditPopup && (
                <div className="register-popup">
                    <div className="register-form">
                        <span className="close-button" onClick={() => setShowEditPopup(false)}>X</span>
                        <h2>Edit</h2>
                        <form onSubmit={handleEdit}>
                            <label htmlFor="edit-username">Username:</label>
                            <input
                                type="text"
                                id="edit-username"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                            <label htmlFor="edit-email">Email:</label>
                            <input
                                type="email"
                                id="edit-email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                            />
                            <label htmlFor="edit-Weight">Weight:</label>
                            <input
                                type="text"
                                id="edit-Weight"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                            />
                            {errorMessage && <div className="error-message">{errorMessage}</div>}
                            <div className="button-group">
                                <button type="submit">Save</button>
                                <button onClick={() => setShowEditPopup(false)}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {showConfirmationPopup && (
                <div className="confirmation-popup">
                    <div className="confirmation-content">
                        <h2>Confirm Deletion</h2>
                        <p>Are you sure you want to delete the user "{deletingUser}"?</p>
                        <div className="button-group">
                            <button className="confirm-button" onClick={handleDelete}>Confirm</button>
                            <button className="cancel-button" onClick={() => setShowConfirmationPopup(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Register;
