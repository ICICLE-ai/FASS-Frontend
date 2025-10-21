import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import RemoveStoreModal from './RemoveStoreModal';

const RemoveStoreButton = () => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    //const handleShow = () => setShowModal(true);

    const handleClick = () => {
      // Remove highlighted stores directly
      const handled = window.handleRemoveStores?.();
      if (!handled) {
        // If no highlighted stores, show modal for manual selection
        setShowModal(true);
      }
    };

    return (
      <>
       <Button variant="primary" onClick={handleClick}>
        Remove Store
        </Button>
        <RemoveStoreModal show={showModal} handleClose={handleClose} />
      </>
    );
  };
  
  export default RemoveStoreButton;