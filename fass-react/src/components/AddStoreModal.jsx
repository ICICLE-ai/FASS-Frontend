import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { StoreContext } from '../App';
import { client } from "../shared/client.js";
import { getSimulationInstanceId, getSimulationStep } from '../App';

const AddStoreModal = ({ show, handleClose }) => {
    const { stores, setStores } = useContext(StoreContext)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        latitude: '',
        longitude: '',
    }); //ideally could have users add in an address but this is fine for MVP

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle form submission to the backend using fetch
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            client.post('/stores', {
                name: formData.name,
                category: formData.category,
                longitude: formData.longitude,
                latitude: formData.latitude,
                simulation_instance_id: getSimulationInstanceId(),
                simulation_step: getSimulationStep()
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

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add New Store</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>

                    {/* Name Field */}
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                        type="text"
                        placeholder="Enter name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        />
                    </Form.Group>

                    {/* Category Field */}
                    <Form.Group className="mb-3">
                        <Form.Label>Choose Type of Store:</Form.Label>
                        <Form.Select
                            name="category" // Added name attribute
                            value={formData.category}
                            onChange={handleSelectChange} >
                            <option value="">--Select Store Type--</option>
                            <option value="supermarket">Supermarket</option>
                            <option value="convenience">Convenience Store</option>
                        </Form.Select>
                    </Form.Group>

                    {/* Latitude */}
                    <Form.Group className="mb-3">
                        <Form.Label>Latitude</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter latitude"
                            name="latitude"
                            value={formData.latitude}
                            onChange={handleChange} 
                        />
                    </Form.Group>

                    {/* Longitude */}
                    <Form.Group className="mb-3">
                        <Form.Label>Longitude</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter longitude"
                            name="longitude"
                            value={formData.longitude}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddStoreModal;