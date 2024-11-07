import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import TopBar from './components/TopBar';
import AddStoreButton from './components/AddStoreButton';
import RemoveStoreButton from './components/RemoveStoreButton';
import 'leaflet/dist/leaflet.css';
import MyMapComponent from './components/MyMapComponent';
import ResetButton from './components/ResetButton';
import StepButton from './components/StepButton';
import { initializeMap } from './MapComponent';

const App = () => {
  const [stepNumber, setStepNumber] = useState(0);
  const [reloadPopups, setReloadPopups] = useState(0);

   
  const updateStepNumber = (newStepNumber) => {
      setStepNumber(newStepNumber);
      setReloadPopups(prev => prev + 1);
  };


  useEffect(() => {
    initializeMap('map');
    fetch('http://localhost:8000/api/get-step-number')
    .then(response => response.json()) // Get the JSON response
    .then(data => {
        console.log(data); // Log the data to the console
        setStepNumber(data["step_number"])
    })
    .catch(error => console.error('Error fetching stores:', error));
  }, [])


  return (
    <div>
        {/* Main Content */}
        <TopBar />
        <Container>
        
        <Row>
          <Col style = {{background:"lightblue"}}>
            {/* Left Side (Other content can go here) */}
            <h3 className="col_header">Add or Remove Stores</h3>
            <div className="d-flex align-items-center flex-column">
            <br/>
            <AddStoreButton/>
            <br/>
            <RemoveStoreButton/>
            <br/>
            <StepButton updateStepNumber={updateStepNumber}/>
            <br/>
            <br/>
            <ResetButton/>
            </div>
          </Col>
          
          <Col>
            {/* Right Side Image Placeholder */}
            <h3 className="col_header">Simulation</h3>
            <MyMapComponent reloadPopups = {reloadPopups}/>
          </Col>

          <Col style = {{background:"lightblue"}}>
            <h3 className="col_header">Data</h3>
            <p>Step: {stepNumber}</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default App;