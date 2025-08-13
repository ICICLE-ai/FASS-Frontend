import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import AddSimulationModal from './AddSimulationModal';

const AddSimulationButton = () => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
      <>
       <Button variant="primary" onClick={handleShow}>
        Add Simulation
        </Button>
        <AddSimulationModal show={showModal} handleClose={handleClose} />
      </>
    );
  };
  
  export default AddSimulationButton;