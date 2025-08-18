import React, {useState, useEffect, useContext} from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import {StoreContext} from '../App';
import {client} from "../shared/client.js";
import { getSimulationInstanceId, getStepNumber } from '../App';

const headers = {
    'Content-Type': 'application/json',
};

// maybe display list of all shared instead?
const RemoveStoreModal = ({show, handleClose}) => {
    const {stores, setStores} = useContext(StoreContext)
    const [selectedStore, setSelectedStore] = useState('');

    // Handle form submission to the backend using fetch
    const handleSubmit = async (e) => {
        e.preventDefault();
        let data = {
            store_id: parseInt(selectedStore), 
            simulation_instance_id: getSimulationInstanceId(),
            simulation_step: getStepNumber(),
        }
        client.delete('/stores', {
            params: data
        })
            .then(response => {
                if (response.status !== 200) {
                    throw new Error('Network response was not ok');
                }
                // Successful response
                console.log('Success:', response.data);
                setStores(response.data.store_json);
                handleClose();
            }).catch(error => {
            console.error('Error with remove-store function:', error);
        });
        //   try {
        //     const response = await fetch(`${API_URL}remove-store`, {
        //       method: 'DELETE', //delete store
        //       headers: {
        //         'Content-Type': 'application/json',
        //       },
        //       body: JSON.stringify(selectedStore),
        //     });
        //
        //     if (response.ok) {
        //       const responseData = await response.json();
        //       console.log('Success:', responseData);
        //       setStores(responseData.store_json)
        //       handleClose();  // Close modal on successful submission
        //     } else {
        //       console.error('Error:', response.statusText);
        //     }
        //   } catch (error) {
        //     console.error('Error removing object:', error);
        //   }
    };

    const handleSelectChange = (event) => {
        setSelectedStore(event.target.value);  // Set selected store
    };

    return (
        <Modal show={show} onHide={handleClose} unmountOnExit>
            <Modal.Header closeButton>
                <Modal.Title>Remove Store</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="store-select">
                        <Form.Label>Choose a store:</Form.Label>
                        <Form.Select value={selectedStore} onChange={handleSelectChange}>
                            <option value="">--Select a store--</option>
                            {stores ? (stores.map((store, index) => (
                                <option key={index} value={store.store_id}>
                                    {store.name}
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

export default RemoveStoreModal;