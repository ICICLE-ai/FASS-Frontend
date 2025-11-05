import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import RemoveStoreModal from './RemoveStoreModal';

const RemoveStoreButton = () => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
      <>
       <Button variant="primary" onClick={handleShow}>
        Remove Store
        </Button>
        <RemoveStoreModal show={showModal} handleClose={handleClose} />
      </>
    );
  };
  
  export default RemoveStoreButton;