import React, { useEffect, useState, useContext } from 'react';
import {Button} from 'react-bootstrap';
import { StoreContext } from '../App';
import { client } from "../shared/client.js";
import { getSimulationInstanceId, getSimulationStep, updateSimulations } from '../App';

const headers = {
    'Content-Type': 'application/json',
  };
const ResetButton = () => {
    const {stores,setStores} = useContext(StoreContext);

    const reset = () => {
        client.post('/simulation-instances/' + getSimulationInstanceId() + '/reset', {}, {
            headers: headers
        })
        .then(response => {
            console.log(response.data);
            updateSimulations();
        })
        .catch(error => {
            console.error('Error with reset function:', error);
        });
    }

    return (
        <>
        <Button onClick={reset}>Reset Simulation</Button>
        </>
    )
}

export default ResetButton;