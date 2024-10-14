import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import AddStoreModal from './AddStoreModal';


const AddStoreButton = () => {

    const [showModal, setShowModal] = useState(false);

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
      <>
       <Button variant="primary" onClick={handleShow}>
        Add Store
        </Button>
        <AddStoreModal show={showModal} handleClose={handleClose} />
      </>
    );
  };
  
  export default AddStoreButton;
  