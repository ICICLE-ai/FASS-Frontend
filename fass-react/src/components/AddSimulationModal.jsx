import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { client } from "../shared/client.js";
import { simulations, getSimulationInstanceId, updateSimulations } from '../App';

const AddSimulationModal = ({ show, handleClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, household_limit: 100000, [name]: value });
  };

  // Handle form submission to the backend using fetch
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      // make request
      //
      const response = await client.post('/simulation-instances', formData)
      .then(response => {
        console.log('Success:', response.data);

        // close dialog
        //
        handleClose();

        // upate main view
        //
        updateSimulations();
      });
    } catch (error) {
      console.error('Error adding simulation:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Simulation</Modal.Title>
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

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
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

export default AddSimulationModal;