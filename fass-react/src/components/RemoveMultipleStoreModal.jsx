import React from "react";
import { Modal, Button } from "react-bootstrap";

const RemoveMultipleStoreModal = ({ show, onConfirm, onCancel }) => {
  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Removal</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        Are you sure you want to remove the highlighted store(s)?
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RemoveMultipleStoreModal;
