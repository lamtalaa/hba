 
import React, { useState, useEffect } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { toast, ToastContainer } from 'react-toastify';

function EmailSender({ Recipients, Subject, Body }) {

    const session = useSession();
    const [recipients, setRecipients] = useState(Recipients || []);
    const [subject, setSubject] = useState(Subject);
    const [body, setBody] = useState(Body);
    const userId = session?.user?.email;

    useEffect(() => {
        // 每当 Body prop 发生变化时，更新 body 状态
        setBody(Body);
    }, [Body]);

    useEffect(() => {
        // 每当 Body prop 发生变化时，更新 body 状态
        setSubject(Subject);
    }, [Subject]);

    useEffect(() => {
        setRecipients(Recipients || []);
    }, [Recipients]);

    console.log(recipients);
    console.log(subject);
    console.log(body);

    const sendEmail = async () => {

        if (!session) {
            alert('Please login to send email.');
            return;
        }
        try {
            const emailData = {
                raw: window.btoa(
                    `To: ${recipients.join(',')}\r\n` +
                    `Subject: ${subject}\r\n` +
                    `\r\n` +
                    `${body}`
                )
            };
            const response = await fetch(`https://www.googleapis.com/gmail/v1/users/${userId}/messages/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(emailData)
            });
            if (!response.ok) {
                throw new Error('Failed to send email');
            }
            toast.success(`Email sent successfully!`);
        } catch (error) {
            console.error('Error sending email:', error.message);
            toast.error(`Error sending email. Please try again later.`);
        }
    };

    const handleRecipientChange = (e) => {
        const value = e.target.value;
        // 用逗号或分号分割收件人，移除多余空格
        const recipientsList = value.split(/[;,]+/).map(email => email.trim());
        setRecipients(recipientsList);
    };

    const handleSubjectChange = (e) => {
        setSubject(e.target.value);
    };

    const handleBodyChange = (e) => {
        setBody(e.target.value);
    };
    
    return (
        
        <div>
            <h2>Send Email</h2>
            <div>
                <label htmlFor="recipient">Recipient:</label>
                <input type="email" id="recipient" value={recipients} onChange={handleRecipientChange} />
            </div>
            <div>
                <label htmlFor="subject">Subject:</label>
                <input type="text" id="subject" value={subject} onChange={handleSubjectChange} />
            </div>
            <div>
            <label htmlFor="body">Body:</label>
                <textarea id="body" value={body} onChange={handleBodyChange} />
            </div>
            <button onClick={sendEmail}>Send Email</button>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
}
export default EmailSender;

 
 