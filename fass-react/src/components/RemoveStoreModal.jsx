import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
//maybe display list of all stores instead?
const RemoveStoreModal = ({ show, handleClose }) => {
  const [stores, setStores] = useState([]);  
  const [selectedStore, setSelectedStore] = useState('');  

  useEffect(() => {
    if (show) {
        fetch('http://localhost:8000/api/stores')
        .then(response => response.json())
        .then(data => {
            setStores(data.stores);  // Set the list of stores from the API response
        })
        .catch(error => console.error('Error fetching stores:', error));
        }
    }, [show]);

  // Handle form submission to the backend using fetch
  const handleSubmit = async (e) => {
    e.preventDefault();

    try { //placeholder
      const response = await fetch('http://localhost:8000/api/remove-store', {
        method: 'DELETE', //delete store
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedStore),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success:', responseData);
        handleClose();  // Close modal on successful submission
      } else {
        console.error('Error:', response.statusText);
      }
    } catch (error) {
      console.error('Error removing object:', error);
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
                {stores.map((store, index) => (
                  <option key={index} value={store[2]}>
                    {store[2]}
                </option>
          ))}
        </Form.Select>
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
