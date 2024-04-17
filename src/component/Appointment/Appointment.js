import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabase';
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment';
import Email from '../Email/Email';

import 'react-toastify/dist/ReactToastify.css';
import './Appointment.css';

function YourComponent({ selectedDate2, sunrise, sunset, selectedLocation, onTimeChange, parentTime }) {

    const [visibility, setVisibility] = useState('Shared');
    const [time, setTime] = useState(parentTime);
    const [customerNames, setCustomerNames] = useState([]);
    const [visibilityOpen, setVisibilityOpen] = useState(false);
    const [timeOpen, setTimeOpen] = useState(false);
    const [allCustomerNames, setAllCustomerNames] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [perPage] = useState(5);
    const [pressedButtonIndices, setPressedButtonIndices] = useState([]);
    const [selectedCustomerNames, setSelectedCustomerNames] = useState([]);
    const [allEmployeeNames, setAllEmployeeNames] = useState([]);
    const [selectedEmployeeNames, setSelectedEmployeeNames] = useState([]);
    const [totalWeight, setTotalWeight] = useState(0);
    const [riderWeights, setRiderWeights] = useState({});
    const [employeeWeights, setEmployeeWeights] = useState({});
    const [riderNames, setRiderNames] = useState({});
    const [emailBody, setEmailBody] = useState('');
    const sunriseMoment = moment(sunrise, 'HH:mm:ss');
    const sunsetMoment = moment(sunset, 'HH:mm:ss');
    const [Subject, setSubject] = useState('');
    const [Recipients, setRecipients] = useState([]);

    useEffect(() => {

        const fetchRecipients = async () => {
            try {
                // 获取所有骑手的邮箱地址
                const riderRecipientPromises = Object.values(riderNames).map(async (riderArray) => {
                    const personIdPromises = riderArray.map(async (riderName) => {
                        const { data: riderData, error: riderError } = await supabase
                            .from('Rider')
                            .select('Person_id')
                            .eq('Name', riderName);

                        if (riderError) {
                            console.error('Error fetching rider data:', riderError.message);
                        } else {
                            // 如果找到了骑手数据，则返回骑手的 Person_id
                            return riderData[0]?.Person_id;
                        }
                    });

                    // 等待所有骑手 Person_id 的 Promise 完成
                    const personIds = await Promise.all(personIdPromises);

                    // 获取所有骑手的邮箱地址
                    const riderEmailPromises = personIds.map(async (personId) => {
                        const { data: personData, error: personError } = await supabase
                            .from('Person')
                            .select('Email')
                            .eq('Person_id', personId);

                        if (personError) {
                            console.error('Error fetching person data:', personError.message);
                        } else {
                            // 如果找到了骑手的邮箱地址，则返回邮箱地址
                            return personData[0]?.Email;
                        }
                    });

                    // 等待所有骑手邮箱地址的 Promise 完成
                    return Promise.all(riderEmailPromises);
                });

                // 获取所有员工的邮箱地址
                const employeeRecipientPromises = selectedEmployeeNames.map(async (employeeName) => {
                    const { data: employeeData, error: employeeError } = await supabase
                        .from('Employee')
                        .select('Email')
                        .eq('Name', employeeName);
                    if (employeeError) {
                        console.error('Error fetching employee data:', employeeError.message);
                    } else {
                        return employeeData[0]?.Email;
                    }
                });

                // 等待所有骑手和员工邮箱地址的 Promise 完成
                const riderRecipients = await Promise.all(riderRecipientPromises);
                const employeeRecipients = await Promise.all(employeeRecipientPromises);

                // 将骑手和员工邮箱地址合并成一个数组
                const allRecipients = riderRecipients.flat().concat(employeeRecipients);
                setRecipients(allRecipients);
            } catch (error) {
                console.error('Error fetching recipients:', error.message);
            }
        };

        fetchRecipients();
    }, [riderNames, selectedEmployeeNames, supabase]);

    console.log(Recipients);

    // Function to handle visibility change
    const handleVisibilityChange = (option) => {
        setVisibility(option);
        setVisibilityOpen(false);
    };

    // Function to handle time change
    const handleTimeChange = (option) => {
        setTime(option);
        setTimeOpen(false);
        onTimeChange(option);
    };

    useEffect(() => {

        const fetchData = async () => {
            try {
                const { data: customeData, error: customeError } = await supabase
                    .from('Customer')
                    .select('Display_Name')
                    .eq('PrefersPublic', visibility === 'Shared')
                    .eq('PrefersAM', time === 'AM');

                if (customeError) {
                    throw customeError;
                }

                const customerNames = customeData.map(item => item.Display_Name);
                setAllCustomerNames(customerNames);
            } catch (error) {
                console.error('Error fetching data:', error.message);
            }
        };
        setSelectedCustomerNames([]);
        setPressedButtonIndices([]);

        fetchData();
    }, [visibility, time, supabase]);

    useEffect(() => {

        const fetchEmployeeData = async () => {
            try {
                const { data: employeeData, error: employeeError } = await supabase
                    .from('Employee')
                    .select('Name');

                if (employeeError) {
                    throw employeeError;
                }

                const employeeNames = employeeData.map(item => item.Name);
                setAllEmployeeNames(employeeNames);
            } catch (error) {
                console.error('Error fetching employee data:', error.message);
            }
        };

        fetchEmployeeData();
    }, []);

    useEffect(() => {
        const startIndex = currentPage * perPage;
        const endIndex = Math.min(startIndex + perPage, allCustomerNames.length);
        const visibleCustomerNames = allCustomerNames.slice(startIndex, endIndex);
        setCustomerNames(visibleCustomerNames);
    }, [currentPage, allCustomerNames, perPage]);

    const handleEmployeeButtonPress = (name) => {
        if (selectedEmployeeNames.includes(name)) {
            setSelectedEmployeeNames(selectedEmployeeNames.filter(employeeName => employeeName !== name));
        } else {
            setSelectedEmployeeNames([...selectedEmployeeNames, name]);
        }
    };

    const totalPages = Math.ceil(allCustomerNames.length / perPage);

    const nextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
    };

    const prevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    };

    const handleButtonPress = (index) => {
        const selectedCustomer = customerNames[index];
        if (pressedButtonIndices.includes(index)) {
            setSelectedCustomerNames(selectedCustomerNames.filter(name => name !== selectedCustomer));
            setPressedButtonIndices(pressedButtonIndices.filter(i => i !== index));
        } else {
            setSelectedCustomerNames([...selectedCustomerNames, selectedCustomer]);
            setPressedButtonIndices([...pressedButtonIndices, index]);
        }
    };

    const fetchRiderNames = useCallback(async () => {

        try {
            const riderNamesData = {};

            for (const customerName of selectedCustomerNames) {
                const { data: riderData, error: riderError } = await supabase
                    .from('Rider')
                    .select('Name')
                    .eq('Parent_Display_Name', customerName);

                if (riderError) {
                    console.error('Error fetching rider names:', riderError.message);
                } else {
                    const names = riderData.map(rider => rider.Name);
                    riderNamesData[customerName] = names;
                }
            }

            setRiderNames(riderNamesData);
        } catch (error) {
            console.error('Error fetching rider names:', error.message);
        }
    }, [selectedCustomerNames, supabase]);

    const calculateTotalWeight = useCallback(async () => {

        let total = 0;
        const riderWeightsData = {};
        const employeeWeightsData = {};

        for (const customerName of selectedCustomerNames) {
            const { data: riderData, error: riderError } = await supabase
                .from('Rider')
                .select('Weight')
                .eq('Parent_Display_Name', customerName);
            if (riderError) {
                console.error('Error fetching rider data:', riderError.message);
            } else {
                const weights = riderData.map(rider => rider.Weight);
                const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
                riderWeightsData[customerName] = weights;
                total += totalWeight;
            }
        }

        for (const employeeName of selectedEmployeeNames) {
            const { data: employeeData, error: employeeError } = await supabase
                .from('Employee')
                .select('Weight')
                .eq('Name', employeeName);
            if (employeeError) {
                console.error('Error fetching employee weights:', employeeError.message);
            } else {
                if (employeeData.length > 0) {
                    total += employeeData[0].Weight;
                    employeeWeightsData[employeeName] = employeeData[0].Weight;
                }
            }
        }

        setTotalWeight(total);
        setRiderWeights(riderWeightsData);
        setEmployeeWeights(employeeWeightsData);
    }, [selectedCustomerNames, selectedEmployeeNames, supabase]);

    useEffect(() => {
        fetchRiderNames();
        calculateTotalWeight();
    }, [fetchRiderNames, calculateTotalWeight]);

    const handleSubmit = async () => {

        try {
            const meetingTime = time === 'AM' ? sunriseMoment : sunsetMoment;
            const isAM = time === 'AM';
            const isPublic = visibility === 'Public';
            const date = selectedDate2.format('YYYY-MM-DD');
            const formattedMeetingTime = meetingTime.format('HH:mm:ss'); // 格式化会议时间为小时分钟秒钟格式

            // 在数据库中创建新的一行
            const { data: appointmentData, error: appointmentError } = await supabase
                .from('Appointment')
                .insert([{ Date: date, Time: formattedMeetingTime, isAM: isAM, isPublic: isPublic }])
                .select();

            // 添加错误检查并打印错误消息到控制台
            if (appointmentError) {
                console.error('Error inserting appointment:', appointmentError.message);
                console.log(appointmentError)
                throw appointmentError;
            }
            if (!appointmentData || appointmentData.length === 0) {
                throw new Error('No data returned after inserting appointment');
            }
            const { data: appointmentID, error: appointmentidError } = await supabase
                .from('Appointment')
                .select('Appointment_id')
                .eq('Date', date)
                .eq('Time', formattedMeetingTime)
                .eq('isAM', isAM)
                .eq('isPublic', isPublic);

            const appointmentId = appointmentID[0].Appointment_id;
            console.log('Newly created Appointment ID:', appointmentId);

            // 将 Appointment_id 添加到 Customer 数据库中的相应行
            for (const customerName of selectedCustomerNames) {
                const { error: updateCustomerError } = await supabase
                    .from('Customer')
                    .update({ Appointment_id: appointmentId })
                    .eq('Display_Name', customerName);
                if (updateCustomerError) {
                    throw updateCustomerError;
                }
            }

            // 获取名为 Employee 的数据库中 Name 等于 selectedEmployeeNames 所有符合项的 Employee_id
            const employeeIds = [];
            for (const employeeName of selectedEmployeeNames) {
                const { data: employeeData, error: employeeError } = await supabase
                    .from('Employee')
                    .select('Employee_id')
                    .eq('Name', employeeName);
                if (employeeError) {
                    throw employeeError;
                } else {
                    if (employeeData.length > 0) {
                        employeeIds.push(employeeData[0].Employee_id);
                    }
                }
            }

            // 在数据库 EmployeeAppointment 中创建新的行，创建的每一行的 Appointment_id 都是上文创建的 Appointment_id
            for (const employeeId of employeeIds) {
                const { error: insertEmployeeAppointmentError } = await supabase
                    .from('EmployeeAppointment')
                    .insert([{ Appointment_id: appointmentId, Employee_id: employeeId }]);
                if (insertEmployeeAppointmentError) {
                    throw insertEmployeeAppointmentError;
                }
            }

            // 提示提交成功或执行其他操作
            console.log('Submission successful!');
            toast.success('Submission successful!');
        } catch (error) {
            if (error.message == 'duplicate key value violates unique constraint "EmployeeAppointment_pkey"') {
            console.error('Error submitting data: There are duplicate employee appointments');
            toast.error(`Error submitting data: There are duplicate employee appointments`);
            } else {
                console.error('Error submitting data:',error.message);
                toast.error(`Error submitting data: ${error.message}`);
            }
        }
    };

    useEffect(() => {
        const Time = time === 'AM' ? 'morning' : 'evening';
        const meetingTime = time === 'AM' ? sunriseMoment.clone().subtract(15, 'minutes') : sunsetMoment.clone().subtract(2, 'hours').subtract(15, 'minutes');
        setEmailBody(`Your balloon flight is now scheduled the ${Time} of ${selectedDate2.format('MMMM DD YYYY')} with a meeting time of ${meetingTime.format('HH:mm')} ${time}. I will text you between 9 and 10 p.m. the evening before your flight with the meeting location details. The meeting sites are all within a 10-mile radius of ${selectedLocation}. If you don't hear from me by 10 p.m., please call me at (330) 633-3288. I am attaching a list of potential meeting sites. Please let me know that you received this email.\n\nThanks,\nDenny`);
        setSubject(`Flight Appointment for ${selectedDate2.format('MMMM DD YYYY')}`);
    }, [selectedDate2, time, sunriseMoment, sunsetMoment]);

    console.log(emailBody);

    return (

        <div className="your-component-container">
            <div className="menu-bar">
                <div className="menu-item">
                    <div className="menu-toggle" onClick={() => setVisibilityOpen(!visibilityOpen)}>
                        Visibility: {visibility} ▼
                    </div>
                    {visibilityOpen && (
                        <div className="menu-options" onClick={(e) => e.stopPropagation()}>
                            <div onClick={() => handleVisibilityChange('Shared')}>Shared</div>
                            <div onClick={() => handleVisibilityChange('Private')}>Private</div>
                        </div>
                    )}
                </div>

                <div className="menu-item">
                    <div className="menu-toggle" onClick={() => setTimeOpen(!timeOpen)}>
                        Time: {time} ▼
                    </div>
                    {timeOpen && (
                        <div className="menu-options" onClick={(e) => e.stopPropagation()}>
                            <div onClick={() => handleTimeChange('AM')}>AM</div>
                            <div onClick={() => handleTimeChange('PM')}>PM</div>
                        </div>
                    )}
                </div>

                <div className="menu-item">
                    <div className="current-date">{selectedDate2.format('MMMM DD YYYY')}</div>
                </div>
            </div>

            <div className="content-container">
                <div className="customer-container">
                    <h4>Customer Names</h4>
                    <div className="customer-buttons">
                        {customerNames.map((customer, index) => (
                            <button
                                key={index}
                                onClick={() => handleButtonPress(index)}
                                style={{ backgroundColor: pressedButtonIndices.includes(index) ? '#007bff' : '#fff' }}
                            >
                                {customer}
                            </button>
                        ))}
                    </div>

                    <div className="pagination-container">
                        <button onClick={prevPage} disabled={currentPage === 0}>Previous</button>
                        <span>Page {currentPage + 1} of {totalPages}</span>
                        <button onClick={nextPage} disabled={currentPage === totalPages - 1}>Next</button>
                    </div>
                </div>
                <hr/>
                <div className="customer-container">
                    <h4>Employee Names</h4>
                    <div className="customer-buttons">
                        {allEmployeeNames.map((employeeName, index) => (
                            <button
                                key={index}
                                onClick={() => handleEmployeeButtonPress(employeeName)}
                                style={{ backgroundColor: selectedEmployeeNames.includes(employeeName) ? '#007bff' : '#fff' }}
                            >
                                {employeeName}
                            </button>
                        ))}
                    </div>
                </div>
                <hr/>
                <div className="summary-container">
                    <h4>Summary</h4>
                    <table>
                        <thead>
                            <tr>
                                <th>Count</th>
                                <th>Name</th>
                                <th>Weight</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedCustomerNames.map((customerName, customerIndex) => (
                                <React.Fragment key={customerIndex}>
                                    {riderNames[customerName] && Array.isArray(riderNames[customerName]) && (
                                        riderNames[customerName].map((riderName, riderIndex) => {
                                            const riderWeight = riderWeights[customerName] && riderWeights[customerName][riderIndex];
                                            return (
                                                <tr key={`${customerName}-${riderIndex}`}>
                                                    <td>{riderIndex + 1}</td>
                                                    <td>{riderName}</td>
                                                    <td>{riderWeight !== undefined ? riderWeight : '-'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </React.Fragment>
                            ))}

                            {selectedEmployeeNames.map((employeeName, index) => (
                                <tr key={index + selectedCustomerNames.length}>
                                    <td>{index + 1}</td>
                                    <td>{employeeName}</td>
                                    <td>{employeeWeights[employeeName]}</td>
                                </tr>
                            ))}

                            <tr>
                                <td colSpan="3" style={{ color: totalWeight >= 1100 ? 'red' : 'green', textAlign: 'center' }}>
                                    {totalWeight >= 1100 ? 'OVERLOADED!' : 'SAFE'}
                                </td>
                            </tr>
                            <tr>
                                <td colSpan="2" style={{ color: totalWeight >= 1100 ? 'red' : 'inherit' }}>Total Weight:</td>
                                <td style={{ color: totalWeight >= 1100 ? 'red' : 'inherit' }}>{totalWeight}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <hr/>
                <div className="email-container">
                    <h4>Email</h4>
                    <Email Recipients={Recipients} Subject={Subject} Body={emailBody} />
                </div>
            </div>
            <div className="submit-button-container">
                <button onClick={handleSubmit}>Create Appointment</button>
                <ToastContainer position="top-right" autoClose={3000} />
            </div>
        </div>
    );
}

export default YourComponent;
