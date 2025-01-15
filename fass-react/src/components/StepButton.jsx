import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { client} from "../shared/client.js";

// const API_URL = import.meta.env.VITE_API_URL || "__API__URL__";
const headers = {
    'Content-Type': 'application/json',
  };

const StepButton = ({updateStepNumber}) => {

    const step = () => {
        client.put("/step", {}, {
            headers: headers
        })
        .then(response => {
            if (response.status !== 200) {
                throw new Error('Network response was not ok');
            }
            console.log(response.data);
            updateStepNumber(response.data["step_number"]);
        })
        .catch(error => {
            console.error('Error with step function:', error);
        });
        // fetch(`${API_URL}/step`, {
        //     method: 'PUT',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     }})
        //     .then(response => {
        //         if (!response.ok) {
        //             throw new Error('Network response was not ok');
        //         }
        //         return response.json(); // Parse the JSON response
        //     })
        //     .then(data => {
        //         console.log(data); // Log the data to the console
        //         updateStepNumber(data["step_number"])
        //     })
        //     .catch(error => console.error('Error with step function:', error));
        //
    }

    return (
      <>
       <Button variant="primary" onClick={step}>
        Step
        </Button>
      </>
    );
  };
  
  export default StepButton;
  