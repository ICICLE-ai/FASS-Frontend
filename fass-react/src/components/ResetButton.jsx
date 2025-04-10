import React, { useEffect, useState, useContext } from 'react';
import {Button} from 'react-bootstrap';
import { StoreContext } from '../App';
import { client } from "../shared/client.js";

const headers = {
    'Content-Type': 'application/json',
  };
const ResetButton = () => {
    const {stores,setStores} = useContext(StoreContext);

    const reset = () => {
        client.put('/reset', {}, {
            headers: headers
        })
        .then(response => {
            console.log(response.data);
            setStores(response.data.store_json)
        })
        .catch(error => {
            console.error('Error with reset function:', error);
        });
       // fetch(`${API_URL}/reset`, {
       //  method: 'PUT',  // Specify the HTTP method as POST
       //  headers: {
       //      'Content-Type': 'application/json',  // Specify that we're sending JSON
       //  }
       //  }).then(response => response.json())
       //  .then(data => {
       //      console.log(data)
       //      setStores(data.store_json);  // Set the list of shared from the API response
       //  })
       //  .catch(error => console.error('Error fetching shared:', error));
    }

    return (
        <>
        <Button onClick={reset}>Reset Stores</Button>
        </>
    )
}

export default ResetButton;