import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
//maybe display list of all stores instead?
const RemoveStoreModal = ({ show, handleClose }) => {
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

  // Handle form submission to the backend using fetch
  const handleSubmit = async (e) => {
    e.preventDefault();

    try { //placeholder
      const response = await fetch('https://your-backend-api.com/delete-store', {
        method: 'POST', //delete store
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success:', responseData);
        handleClose();  // Close modal on successful submission
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding object:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Remove Store</Modal.Title>
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

          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RemoveStoreModal;
