import React, { useEffect, useState, useRef, createContext } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import TopBar from './components/TopBar';
import AddStoreButton from './components/AddStoreButton';
import RemoveStoreButton from './components/RemoveStoreButton';
import ResetButton from './components/ResetButton';
import ReportButton from './components/ReportButton';
import StepButton from './components/StepButton';
import { initializeMap } from './components/MapComponent';
import Legend from './components/LegendComponent'
import DataComponent from './components/DataComponent';

export const StoreContext = createContext();
export const HouseholdContext = createContext();

const App = () => {
  const [stepNumber, setStepNumber] = useState(0);
  const mapRef = useRef(null); // Store the map instance
  const renderHouseholdsRef = useRef(null); // Reference for render_households function
   
  const updateStepNumber = (newStepNumber) => {
      setStepNumber(newStepNumber);
  };

  useEffect(() => {
    console.log("get step number call")
    fetch('http://localhost:8000/api/get-step-number')
    .then(response => response.json()) // Get the JSON response
    .then(data => {
        console.log(data); // Log the data to the console
        setStepNumber(data["step_number"])
    })
    .catch(error => console.error('Error fetching step number:', error));
  }, [])

  const [stores, setStores] = useState([]);
  useEffect(() => {
    console.log("stores call")
    fetch('http://localhost:8000/api/stores')
    .then(response => response.json())
    .then(data => {
        setStores(data.stores_json);  // Set the list of stores from the API response
    })
    .catch(error => console.error('Error fetching stores:', error));
  }, []);

  const [households, setHouseholds] = useState([]);
  useEffect(() => {
    console.log("households call")
    fetch('http://localhost:8000/api/households')
    .then(response => response.json())
    .then(data => {
        setHouseholds(data.households_json);  // Set the list of stores from the API response
    })
    .catch(error => console.error('Error fetching households:', error));
  }, [stepNumber]);

    useEffect(() => {
        console.log("create map call")
        if (!mapRef.current) {
            const { map, render_households } = initializeMap('map', households, stores); // Initialize map with empty stores initially
            mapRef.current = map;
            renderHouseholdsRef.current = render_households; // Store render_households function in a ref
        }
    }, []);

    useEffect(() => {
        console.log("rerender agents call")
        if (renderHouseholdsRef.current && households.length > 0 && stores.length > 0) {
            renderHouseholdsRef.current(households,stores);
        }
    }, [households,stores])

  return (
    <StoreContext.Provider value={{stores, setStores, stepNumber}}>
        <HouseholdContext.Provider value={{households, setHouseholds}}>
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
                            <br/>
                            <ReportButton/>
                            </div>
                        </Col>
                        
                        <Col>
                            <h3 className="col_header">Simulation</h3>
                            <div id="map" style={{height: '75vh',width: '75vh'}}><Legend/></div>
                        </Col>

                        <Col style = {{background:"lightblue"}}>
                            <h3 className="col_header">Data</h3>
                            <DataComponent/>
                        </Col>
                    </Row>
                </Container>
            </div>
        </HouseholdContext.Provider>
    </StoreContext.Provider>
  );
};

export default App;