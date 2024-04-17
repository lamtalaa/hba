/*
import { supabase } from '../../supabase';
import CryptoJS from 'crypto-js';
import { useEffect } from 'react';

function Encryption({ billaddressId, addressId }) {
    console.log(addressId);
    console.log(billaddressId);
    const addressEncrypt = async () => {
        try {
            const { data, error } = await supabase.from('Address')
                .select('Street_Address, City')
                .eq('Address_id', addressId)
                .single();

            if (error) {
                console.error('Error retrieving data:', error.message);
                return;
            }

            const encryptStreetAddress = (data) => {
                const encryptedAddress = CryptoJS.AES.encrypt(data.Street_Address, 'secret-key').toString();
                return encryptedAddress;
            }

            const encryptCity = (data) => {
                const encryptedCity = CryptoJS.AES.encrypt(data.City, 'secret-key').toString();
                return encryptedCity;
            }

            const encryptedAddress = encryptStreetAddress(data.Street_Address);
            const encryptedCity = encryptCity(data.City);
        
            const { data: addressData, error: addressError } = await supabase.from('Address').update({
                Street_Address: encryptedAddress,
                City: encryptedCity
            }).eq('Address_id', addressId);

            if (addressError) {
                console.error('Error updating address:', addressError.message);
            } else {
                console.log('Address updated successfully:', addressData);
            }
        } catch (error) {
            console.error('Error encrypting address:', error.message);
        }
    }

    const billaddressEncrypt = async () => {
        try {
            const { data, error } = await supabase.from('Address')
                .select('Street_Address, City')
                .eq('Address_id', billaddressId)
                .single();
        
            if (error) {
                console.error('Error retrieving data:', error.message);
                return;
            }

            const encryptStreetAddress = (data) => {
                const encryptedAddress = CryptoJS.AES.encrypt(data.Street_Address, 'secret-key').toString();
                return encryptedAddress;
            }

            const encryptCity = (data) => {
                const encryptedCity = CryptoJS.AES.encrypt(data.City, 'secret-key').toString();
                return encryptedCity;
            }

            const encryptedAddress = encryptStreetAddress(data.Street_Address);
            const encryptedCity = encryptCity(data.City);
        
            const { data: addressData, error: addressError } = await supabase.from('Address').update({
                Street_Address: encryptedAddress,
                City: encryptedCity
            }).eq('Address_id', billaddressId);

            if (addressError) {
                console.error('Error updating address:', addressError.message);
            } else {
                console.log('Address updated successfully:', addressData);
            }
        } catch (error) {
            console.error('Error encrypting address:', error.message);
        }
    }

    useEffect(() => {
        addressEncrypt();
        billaddressEncrypt();
    }, [addressId, billaddressId]);
}

export default Encryption;
*/







import { supabase } from '../../supabase';
import CryptoJS from 'crypto-js';
import { useState, useEffect, useRef } from 'react'


function Encryption({addressId}) {
    
    console.log("ENC: ", addressId)

    const adrressEncrypt = async () => {

        const { data, error } = await supabase.from('Address')
            .select('Street_Address, City')
            .eq('Address_id', addressId)
            .single();
        if (error) {
            console.error('Error retrieving data:', error.message);
        } else {
            console.log('Street_Address:', data.Street_Address);
            console.log('City:', data.City);

            const encryptStreetAddress = (data) => {
                const encryptedAddress = CryptoJS.AES.encrypt(data.Street_Address, 'secret-key').toString();
                return encryptedAddress;
            }
            const encryptCity = (data) => {
                const encryptedCity = CryptoJS.AES.encrypt(data.City, 'secret-key').toString();
                return encryptedCity;
            }

            const encryptedAddress = encryptStreetAddress(data.Street_Address);
            const encryptedCity = encryptCity(data.City);
        
            const { data: addressData, error: addressError } = await supabase.from('Address').update({
                Street_Address: encryptedAddress,
                City: encryptedCity
                }).eq('Address_id', addressId);
        }
    }
        //----------------------------------------------------


    useEffect(() => {
        adrressEncrypt();
    }, [addressId]);
}


export default Encryption;


