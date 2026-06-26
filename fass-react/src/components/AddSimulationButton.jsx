import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import AddSimulationModal from './AddSimulationModal';
import InfoTooltip from './InfoTooltip';

const AddSimulationButton = () => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
      <>
       <InfoTooltip text="Create a new simulation scenario with its own set of stores and households.">
        <Button variant="primary" onClick={handleShow}>
         Add Simulation
        </Button>
       </InfoTooltip>
        <AddSimulationModal show={showModal} handleClose={handleClose} />
      </>
    );
  };
  
  export default AddSimulationButton;