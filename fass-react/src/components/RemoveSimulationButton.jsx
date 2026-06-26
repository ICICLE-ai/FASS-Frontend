import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import RemoveSimulationModal from './RemoveSimulationModal';
import InfoTooltip from './InfoTooltip';

const RemoveSimulationButton = () => {
    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    return (
      <>
       <InfoTooltip text="Delete the currently selected simulation scenario. This cannot be undone.">
        <Button variant="primary" onClick={handleShow}>
         Remove Simulation
        </Button>
       </InfoTooltip>
        <RemoveSimulationModal show={showModal} handleClose={handleClose} />
      </>
    );
  };
  
  export default RemoveSimulationButton;