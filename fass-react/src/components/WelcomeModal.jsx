import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const WelcomeModal = ({ show, handleClose }) => {
  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Welcome to FEAST</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          <strong>FEAST</strong> stands for{' '}
          <strong>Food Equity Access Simulation Technology</strong>.
        </p>
        <p>
          FEAST helps you explore how changes in the local food landscape — adding
          or removing supermarkets and convenience stores — affect food access for
          households in a community. Use the map to see stores and households at
          a glance, run the simulation forward in time, and observe how access
          patterns shift in response to your changes.
        </p>
        <p>
          Open the <strong>Help</strong> button at any time for a full guide to
          the interface and a step-by-step example.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Get started
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WelcomeModal;
