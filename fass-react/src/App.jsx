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

  //
  // getting functions
  //

  const getSimulationInstance = () => {
    const selectElement = document.getElementById('simulation-instances');
    return selectElement? selectElement.value : undefined;
  }

  function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }

  //
  // setting functions
  //

  const setSimulationInstances = (simulationInstances) => {
    const selectElement = document.getElementById('simulation-instances');
    for (let i = 0; i < simulationInstances.length; i++) {
        let instance = simulationInstances[i];
        let name = toTitleCase(instance.name.replace(/_/g, ' '));
        let value = instance.id;
        let newOption = new Option(name, value);
        selectElement.add(newOption, undefined);
    } 
  }

  //
  // loading functions
  //

  function loadSimulationInstances(options) {
    return client.get('/simulation-instances')
      .then(response => {
          if (options && options.success) {
            options.success(response.data['simulation_instances']);
          }
      })
      .catch(error => {
          console.error('Error fetching simulation instances', error);
      });
  }

  function loadStores(options) {
    if (window.stores_request) {
      return;
    }

    window.stores_request = client.get('/stores')
      .then(response => {
          window.stores_request = null;
          if (options && options.success) {
            options.success(response.data.stores_json);
          }
      })
      .catch(error => {
          console.error('Error fetching stores:', error);
      });
  }

  function loadHouseholds(simulationInstance, options) {
    if (!simulationInstance || simulationInstance == '' || window.households_request) {
      return;
    }

    showLoadingSpinner();
    window.households_request = client.get('/households?simulation_instance=' + simulationInstance + '&simulation_step=' + stepNumber)
      .then(response => {
          window.households_request = null;
          hideLoadingSpinner();
          if (options && options.success) {
            options.success(response.data.households_json);
          }
      })
      .catch(error => {
          console.error('Error fetching households:', error);
      });
  }

  function loadStepNumber(options) {
    client.get('/get-step-number')
        .then(response => {
            console.log(response.data);
            if (options && options.success) {
              options.success(response.data["step_number"]);
            }
        })
        .catch(error => {
            console.error('Error fetching step number:', error);
        });
  }

  //
  // rendering functions
  //

  function showLoadingSpinner() {
    document.getElementById('loading').style.visibility = 'visible';
  }

  function hideLoadingSpinner() {
    document.getElementById('loading').style.visibility = 'hidden';
  }

  const updateStepNumber = (newStepNumber) => {
      setStepNumber(newStepNumber);
  };

  //
  // react callbacks
  //

  useEffect(() => {
    loadStepNumber({
      success: (stepNumber) => {
        window.stepNumber = stepNumber;
        setStepNumber(stepNumber);
      }
    });
  }, [])

  const [stores, setStores] = useState([]);

  useEffect(() => {
    loadStores({
      success: (stores) => {
        setStores(stores)
      }
    });
  }, []);

  const [households, setHouseholds] = useState([]);

  useEffect(() => {

    if (!window.loadingSimulationInstances) {

      // load simulation instances before loading households
      //
      window.loadingSimulationInstances = loadSimulationInstances({
        success: (simulationInstances) => {
          setSimulationInstances(simulationInstances);
          loadHouseholds(getSimulationInstance(), {
            success: (households) => {
              setHouseholds(households);
            }
          });
        }
      });
    } else {

      // load households for given instance
      //
      loadHouseholds(getSimulationInstance(), {
        success: (households) => {
          setHouseholds(households);
        }
      });
    }
  }, [stepNumber]);

  useEffect(() => {
    if (!mapRef.current) {
      const { map, renderAll } = initializeMap('map', households, stores);
      mapRef.current = map;
      renderHouseholdsRef.current = renderAll;
    }
  }, []);

  useEffect(() => {
    if (renderHouseholdsRef.current && households.length > 0 && stores.length > 0) {
      renderHouseholdsRef.current(households, stores);
    }
  }, [households, stores]);

  //
  // render
  //

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
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Simulation</h3>
                    <div className="space-y-4 flex flex-col items-center">
                      <select id="simulation-instances" className="rounded-lg">
                      </select>
                      <br />
                    </div>

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
