import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import RemoveSimulationModal from './RemoveSimulationModal';

const RemoveSimulationButton = () => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
      <>
       <Button variant="primary" onClick={handleShow}>
        Remove Simulation
        </Button>
        <RemoveSimulationModal show={showModal} handleClose={handleClose} />
      </>
    );
  };
  
  export default RemoveSimulationButton;