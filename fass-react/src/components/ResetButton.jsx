import React, { useEffect, useState } from 'react';
import {Button} from 'react-bootstrap';

const ResetButton = () => { 
    const reset = () => {
       fetch('http://localhost:8000/api/reset', {
        method: 'PUT',  // Specify the HTTP method as POST
        headers: {
            'Content-Type': 'application/json',  // Specify that we're sending JSON
        }
        }) 
    }

    return (
        <>
        <Button onClick={reset}>Reset All</Button>
        </>
    )
}

export default ResetButton;