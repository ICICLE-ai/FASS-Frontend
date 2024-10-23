import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import TopBar from './components/TopBar';
import AddStoreButton from './components/AddStoreButton';
import RemoveStoreButton from './components/RemoveStoreButton';
import 'leaflet/dist/leaflet.css';
import MyMapComponent from './components/MyMapComponent';
import GetHouseholdButton from './components/GetHouseholdButton';
import ResetButton from './components/ResetButton';

const App = () => {
  return (
    <div>
        {/* Main Content */}
        <TopBar />
        <Container>
        
        <Row>
          <Col style = {{background:"lightblue"}}>
            {/* Left Side (Other content can go here) */}
            <h3 class="col_header">Add or Remove Stores</h3>
            <div className="d-flex align-items-center flex-column">
            <br/>
            <AddStoreButton/>
            <br/>
            <RemoveStoreButton/>
            <br/>
            <Button variant="primary" className="mx-2">Step</Button>
            <br/>
            <GetHouseholdButton/>
            <br/>
            <ResetButton/>
            </div>
          </Col>
          
          <Col>
            {/* Right Side Image Placeholder */}
            <h3 class="col_header">Simulation</h3>
            <MyMapComponent/>
          </Col>

          <Col style = {{background:"lightblue"}}>
            <h3 class="col_header">Data</h3>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;