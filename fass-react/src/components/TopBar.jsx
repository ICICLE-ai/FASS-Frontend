import React, { useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import HelpModal from './HelpModal';

const TopBar = () => {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <Navbar bg="dark" expand="lg" fixed='top'>
      <Navbar.Brand style={{marginLeft:"10px",color:"white"}} href="/">Food Access Strategy Simulator</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
      </Navbar.Collapse>
      <Button onClick={handleShow}>Help</Button>
      <HelpModal show={showModal} handleClose={handleClose} />
    </Navbar>
  );
};

export default TopBar;
