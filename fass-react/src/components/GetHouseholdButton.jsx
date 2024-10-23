import React, { useEffect, useState } from 'react';
import {Button} from 'react-bootstrap';

const GetHouseholdButton = () => { 
    const [households, setHouseholds] = useState([])
    const getList = () => {
        alert(households)
    }
    useEffect(()=>{
        fetch('http://localhost:8000/api/households')
        .then(response => response.json())
        .then(data => {
          setHouseholds(data.households_json);  // Set the list of stores from the API response
          console.log(households)
        })
        .catch(error => console.error('Error fetching households:', error));

    }, [])


    return (
        <>
        <Button onClick={getList}>Get Household List</Button>
        </>
    )
}

export default GetHouseholdButton;