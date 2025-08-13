import React, {useState, useEffect, useContext} from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import {simulations, updateSimulations} from '../App';
import {client} from "../shared/client.js";

const headers = {
    'Content-Type': 'application/json',
};

// maybe display list of all shared instead?
const RemoveSimulationModal = ({show, handleClose}) => {
    const [selectedSimulation, setSelectedSimulation] = useState('');

    // Handle form submission to the backend using fetch
    const handleSubmit = async (e) => {
        e.preventDefault();

        // make request
        //
        client.delete('/simulation-instances/' + selectedSimulation, { headers: headers })
            .then(response => {
                console.log('Success:', response.data);

                // close dialog
                //
                handleClose();

                // udpate view
                //
                updateSimulations();
            }).catch(error => {
            console.error('Error with remove-store function:', error);
        });
    };

    const handleSelectChange = (event) => {
        setSelectedSimulation(event.target.value);
    };

    function toTitleCase(str) {
        return str.replace(
          /\w\S*/g,
          text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
        );
    }

    return (
        <Modal show={show} onHide={handleClose} unmountOnExit>
            <Modal.Header closeButton>
                <Modal.Title>Remove Simulation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="store-select">
                        <Form.Label>Choose a simulation:</Form.Label>
                        <Form.Select value={selectedSimulation} onChange={handleSelectChange}>
                            <option value="">--Select a simulation--</option>
                            {simulations ? (simulations.map((simulation, index) => (
                                <option key={index} value={simulation.id}>
                                    { toTitleCase(simulation.name.replace(/_/g, ' ')) }
                                </option>
                            ))) : (<></>)}
                        </Form.Select>
                    </Form.Group>

                    <br />

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default RemoveSimulationModal;