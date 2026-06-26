import React, { useEffect, useState, useContext } from 'react';
import {Button} from 'react-bootstrap';
import { StoreContext } from '../App';
import { client } from "../shared/client.js";
import { getSimulationInstanceId, getSimulationStep, updateSimulations } from '../App';
import InfoTooltip from './InfoTooltip';

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
            updateStepNumber(0);
        })
        .catch(error => {
            console.error('Error with reset function:', error);
        });
    }

    return (
        <>
        <InfoTooltip text="Reset the simulation to month 0 and undo all store changes you've made.">
            <Button onClick={reset}>Reset Simulation</Button>
        </InfoTooltip>
        </>
    )
}

export default ResetButton;