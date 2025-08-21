import React, {useState, useEffect, useContext} from 'react';
import {Modal, Button, Form} from 'react-bootstrap';
import {StoreContext} from '../App';
import {client} from "../shared/client.js";
import { getSimulationInstanceId, getSimulationStep } from '../App';

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

        try {
            client.delete('/stores', {
                params: {
                    store_id: parseInt(selectedStore), 
                    simulation_instance_id: getSimulationInstanceId(),
                    simulation_step: getSimulationStep(),
                }
            }).then(response => {
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
        } catch (error) {
          console.error('Error adding store:', error);
        }
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
                            {stores ? (stores.sort((a, b) => {
                                    if (a.name && b.name) {
                                        return a.name.localeCompare(b.name);
                                    }
                                }).map((store, index) => (
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