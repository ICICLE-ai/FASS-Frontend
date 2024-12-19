import React, { useEffect, useState, useContext } from 'react';
import {Button} from 'react-bootstrap';
import { StoreContext } from '../App';
const API_URL = import.meta.env.VITE_API_URL || "__API__URL__";

const ResetButton = () => { 
    const {stores,setStores} = useContext(StoreContext);
    const reset = () => {
       fetch(`${API_URL}/reset`, {
        method: 'PUT',  // Specify the HTTP method as POST
        headers: {
            'Content-Type': 'application/json',  // Specify that we're sending JSON
        }
        }).then(response => response.json())
        .then(data => {
            console.log(data)
            setStores(data.store_json);  // Set the list of stores from the API response
        })
        .catch(error => console.error('Error fetching stores:', error));
    }

    return (
        <>
        <Button onClick={reset}>Reset All</Button>
        </>
    )
}

export default ResetButton;