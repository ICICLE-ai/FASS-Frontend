import React, { useState } from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { client} from "../shared/client.js";
import { getSimulationInstanceId, getSimulationStep } from '../App';

// const API_URL = import.meta.env.VITE_API_URL || "__API__URL__";
const headers = {
    'Content-Type': 'application/json',
  };

const StepButton = ({updateStepNumber}) => {
    const [loading, setLoading] = useState(false);
    const step = () => {
        setLoading(true)
        client.post('/simulation-instances/' + getSimulationInstanceId() + '/advance', {}, {
            headers: headers
        })
        .then(response => {
            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }
            console.log(response.data);
            updateStepNumber(getSimulationStep() + 1);
            setLoading(false)
        })
        .catch(error => {
            console.error('Error with step function:', error);
            setLoading(false)
        });
    }

    return (
      <>
       <Button variant="primary" onClick={step} disabled={loading}>
       {loading ? (
        <>
          <Spinner animation="border" size="sm" /> Loading...
        </>
      ) : (
        "Run Step"
      )}
        </Button>
      </>
    );
  };
  
  export default StepButton;
  