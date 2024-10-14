import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';

const TopBar = () => {
  return (
    <Navbar bg="dark" expand="lg" fixed='top'>
      <Navbar.Brand style={{marginLeft:"10px",color:"white"}} href="/">Food Access Strategy Simulator</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          <Button variant="primary" className="mx-2">Start</Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default TopBar;
