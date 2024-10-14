import React from 'react';
import { Container, Row, Col, Placeholder, Button } from 'react-bootstrap';
import TopBar from './components/TopBar';
import AddStoreButton from './components/AddStoreButton';
import RemoveStoreButton from './components/RemoveStoreButton';

const App = () => {
  return (
    <div>
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <Container fluid className="mt-3">
        <Row>
          <Col md={8}>
            {/* Left Side (Other content can go here) */}
            <h3>Add or Remove Stores</h3>
            <div className="d-flex align-items-center flex-column">
            <br/>
            <AddStoreButton/>
            <br/>
            <RemoveStoreButton/>
            <br/>
            <Button variant="primary" className="mx-2">Step</Button>
            </div>
          </Col>
          
          <Col md={4}>
            {/* Right Side Image Placeholder */}
            <h3>Map Placeholder</h3>
            <Placeholder as="div" className="w-100 h-100">
              <Placeholder xs={12} className="h-100" />
            </Placeholder>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;