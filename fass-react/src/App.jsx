import React, { useEffect, useState, useRef, createContext } from 'react';
import TopBar from './components/TopBar';
import AddStoreButton from './components/AddStoreButton';
import RemoveStoreButton from './components/RemoveStoreButton';
import ResetButton from './components/ResetButton';
import ReportButton from './components/ReportButton';
import StepButton from './components/StepButton';
import { initializeMap } from './components/MapComponent';
import Legend from './components/LegendComponent';
import DataComponent from './components/DataComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { client} from "./shared/client.js";

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
    console.log("get step number call");
    client.get('/get-step-number')
        .then(response => {
            console.log(response.data);
            setStepNumber(response.data["step_number"]);
        })
        .catch(error => {
            console.error('Error fetching step number:', error);
        });
    // fetch(`${API_URL}/get-step-number`)
    // .then(response => response.json()) // Get the JSON response
    // .then(data => {
    //     console.log(data); // Log the data to the console
    //     setStepNumber(data["step_number"])
    // })
    // .catch(error => console.error('Error fetching step number:', error));
  }, [])

  const [stores, setStores] = useState([]);
  useEffect(() => {
    console.log("shared call");
    client.get('/stores')
      .then(response => {
          setStores(response.data.stores_json)
      })
      .catch(error => {
          console.error('Error fetching shared:', error);
      });
    // fetch(`${API_URL}/shared`)
    // .then(response => response.json())
    // .then(data => {
    //     setStores(data.stores_json);  // Set the list of shared from the API response
    // })
    // .catch(error => console.error('Error fetching shared:', error));
  }, []);

  const [households, setHouseholds] = useState([]);
  useEffect(() => {
    console.log("households call");
    client.get('/households')
      .then(response => {
          setHouseholds(response.data.households_json);
      })
      .catch(error => {
          console.error('Error fetching households:', error);
      });
    // fetch(`${API_URL}/households`)
    // .then(response => response.json())
    // .then(data => {
    //     setHouseholds(data.households_json);  // Set the list of shared from the API response
    // })
    // .catch(error => console.error('Error fetching households:', error));
  }, [stepNumber]);

  useEffect(() => {
    if (!mapRef.current) {
      const { map, render_households } = initializeMap('map', households, stores);
      mapRef.current = map;
      renderHouseholdsRef.current = render_households;
    }
  }, []);

  useEffect(() => {
    if (renderHouseholdsRef.current && households.length > 0 && stores.length > 0) {
      renderHouseholdsRef.current(households, stores);
    }
  }, [households, stores]);

  return (
    <StoreContext.Provider value={{ stores, setStores, stepNumber }}>
      <HouseholdContext.Provider value={{ households, setHouseholds }}>
        {/* Top Bar */}
        <TopBar />
        <div className="min-h-screen flex items-center justify-center">
            <div className="container mx-auto py-8 px-4 bg-white shadow-md rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Left Column */}
                <div className="bg-blue-200 p-6 rounded-lg shadow-md h-[400px] md:min-h-[80vh]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
                    <div className="space-y-4 flex flex-col items-center">
                    <AddStoreButton />
                    <RemoveStoreButton />
                    <StepButton updateStepNumber={updateStepNumber} />
                    <ResetButton/>
                    </div>
                </div>

                {/* Map Column */}
                <div className="p-6 md:col-span-2 min-h-[75vh]">
                    <div id="map" className="w-full h-full rounded-lg shadow-md bg-gray-50">
                    <Legend />
                    </div>
                </div>

                {/* Data Column */}
                <div className="bg-blue-200 p-6 rounded-lg shadow-md h-[400px] md:min-h-[80vh]">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Data</h3>
                    <DataComponent />
                </div>
                </div>
            </div>
            </div>
            <h1>Copyright</h1>
      </HouseholdContext.Provider>
    </StoreContext.Provider>
  );
};

export default App;
