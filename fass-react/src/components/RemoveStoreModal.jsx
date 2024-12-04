import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { StoreContext } from '../App';
//maybe display list of all stores instead?
const RemoveStoreModal = ({ show, handleClose }) => {
  const {stores, setStores} = useContext(StoreContext)  
  const [selectedStore, setSelectedStore] = useState('');  
  const apiUrl = process.env.REACT_APP_API_URL;

  // Handle form submission to the backend using fetch
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}remove-store`, {
        method: 'DELETE', //delete store
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedStore),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log('Success:', responseData);
        setStores(responseData.store_json)
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
                {stores ? (stores.map((store, index) => (
                  <option key={index} value={store[2]}>
                    {store[2]}
                </option>
          ))) : (<></>)}
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
