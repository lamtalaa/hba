import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabase.js';
import './ChangePIN.css';

function ChangeEmailPassword() {
    const [newEmail, setNewEmail] = useState(''); // State for new email
    const [newPassword, setNewPassword] = useState(''); // State for new password
    const [error, setError] = useState(null); // State for error message
    const [success, setSuccess] = useState(false); // State for success message
    const [currentUser, setCurrentUser] = useState(null); // State for current user data

    useEffect(() => {
        async function fetchUserData() {
            try {
                const usernameFromLocal = localStorage.getItem('username'); // Get username from local storage
                if (usernameFromLocal) {
                    const { data, error } = await supabase
                        .from('login')
                        .select('email, pin')
                        .eq('name', usernameFromLocal)
                        .single();

                    if (error) {
                        throw error;
                    }

                    setCurrentUser(data); // Set current user data
                }
            } catch (error) {
                setError(error.message); // Set error message if any
            }
        }

        fetchUserData(); // Fetch user data on component mount
    }, []);

    // Function to handle changing email and password
    const handleChangeEmailPassword = async () => {
        try {
            const usernameFromLocal = localStorage.getItem('username'); // Get username from local storage
            if (usernameFromLocal) {
                // Update email and password in the database
                const { data, error: updateError } = await supabase
                    .from('login')
                    .update({ email: newEmail, pin: newPassword })
                    .eq('name', usernameFromLocal);

                if (updateError) {
                    throw updateError;
                }

                setSuccess(true); // Set success message
                setError(null); // Clear error message
            }
        } catch (error) {
            setError(error.message); // Set error message if any
            setSuccess(false); // Set success to false
        }
    };

    return (
        <div className="change-email-password-container">
            <h2>Change Email and Password</h2>
            {currentUser && (
                <>
                    <div>
                        <label htmlFor="newEmail">New Email:</label>
                        <input
                            type="email"
                            id="newEmail"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="pin" // Assuming "pin" is used for password
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                    {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error message if any */}
                    {success && <div style={{ color: 'green' }}>Email and password changed successfully!</div>} {/* Display success message */}
                    <button onClick={handleChangeEmailPassword}>Change Email and Password</button>
                </>
            )}
        </div>
    );
}

export default ChangeEmailPassword;
