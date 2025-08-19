import React, { useEffect, useState, useRef, createContext } from 'react';
import TopBar from './components/TopBar';
import AddSimulationButton from './components/AddSimulationButton';
import RemoveSimulationButton from './components/RemoveSimulationButton';
import ResetButton from './components/ResetButton';
import AddStoreButton from './components/AddStoreButton';
import RemoveStoreButton from './components/RemoveStoreButton';
import ReportButton from './components/ReportButton';
import StepButton from './components/StepButton';
import { initializeMap } from './components/MapComponent';
import Legend from './components/LegendComponent';
import DataComponent from './components/DataComponent';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import { client } from "./shared/client.js";

export const StoreContext = createContext();
export const HouseholdContext = createContext();
export var simulations = [];

//
// querying functions
//

export function hasSimulations() {
  return document.getElementById('simulation-instances').options.length > 0;
}

export function hasSimulationInstance() {
  return getSimulationInstanceId() != undefined;
}

//
// getting functions
//

export function getSimulationInstanceId() {
  const selectElement = document.getElementById('simulation-instances');
  const value = selectElement? selectElement.value : undefined;
  return value && value != ''? value : undefined;
}

export function getSimulationStep() {
  return window.stepNumber || 0;
}

//
// setting methods
//

export function updateSimulations() {
  window.updateSimulations();
}

//
// main app
//

const App = () => {
  const [stepNumber, setStepNumber] = useState(0);
  const mapRef = useRef(null); // Store the map instance
  const renderHouseholdsRef = useRef(null); // Reference for render_households function

  function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
  }

  //
  // simulation selector functions
  //

  function clearSimulationInstances() {
    const selectElement = document.getElementById('simulation-instances');
    selectElement.options.length = 0;
  }

  function addSimulationInstance(simulationInstance) {
    const selectElement = document.getElementById('simulation-instances');
    let name = toTitleCase(simulationInstance.name.replace(/_/g, ' '));
    let value = simulationInstance.id;
    let newOption = new Option(name, value);
    selectElement.add(newOption, undefined);
  }

  function addSimulationInstances(simulationInstances) {
    for (let i = 0; i < simulationInstances.length; i++) {
        addSimulationInstance(simulationInstances[i]);
    } 
  }

  function setSimulationInstances(simulationInstances) {
    clearSimulationInstances();
    addSimulationInstances(simulationInstances);
  }

  //
  // fetching functions
  //

  function fetchSimulationInstances(options) {
    return client.get('/simulation-instances')
      .then(response => {
          if (response.data['simulation_instances']) {
            window.simulationInstances = response.data['simulation_instances'];
          }

          if (options && options.success) {
            options.success(window.simulationInstances);
          }
      });
  }

  function fetchStores(simulationInstanceId, options) {
    if (window.stores_request || !simulationInstanceId) {
      return;
    }

    // add search params
    //
    const params = new URLSearchParams();
    params.append('simulation_instance', simulationInstanceId);
    params.append('simulation_step', getSimulationStep());

    window.stores_request = client.get('/stores?' + params.toString())
      .then(response => {
          window.stores_request = null;

          // perform callback
          //
          if (options && options.success) {
            options.success(response.data.store_json);
          }
      })
      .catch(error => {
          console.error('Error fetching stores:', error);
      });
  }

  function fetchHouseholds(simulationInstanceId, options) {
    if (!simulationInstanceId || simulationInstanceId == '') {
      return;
    }

    // add search params
    //
    const params = new URLSearchParams();
    params.append('simulation_instance', simulationInstanceId);
    params.append('simulation_step', getSimulationStep());

    showLoadingSpinner();
    return client.get('/households?' + params.toString())
      .then(response => {
          hideLoadingSpinner();

          // perform callback
          //
          if (options && options.success) {
            options.success(response.data.households_json);
          }
      })
      .catch(error => {
          console.error('Error fetching households:', error);
      });
  }

  function fetchStepNumber(simulationInstanceId, options) {
    if (!simulationInstanceId) {
      return;
    }

    // add search params
    //
    const params = new URLSearchParams();
    params.append('simulation_instance', simulationInstanceId);

    return client.get('/get-step-number?' + params.toString())
      .then(response => {
          console.log(response.data);

          // perform callback
          //
          if (options && options.success) {
            options.success(response.data["step_number"]);
          }
      })
      .catch(error => {
          console.error('Error fetching step number:', error);
      });
  }

  //
  // loading methods
  //

  function loadSimulationInstances(options) {
    if (window.simulation_request) {
      return;
    }

    window.simulation_request = fetchSimulationInstances({
      success: (simulationInstances) => {
        simulations = simulationInstances;
        window.simulation_request = null;

        // update simulation selector
        //
        setSimulationInstances(simulationInstances);

        // perform callback
        //
        if (options && options.success) {
          options.success(simulationInstances);
        }
      }
    })
  }
  
  function loadHouseholds(simulationInstanceId, options) {
    if (!hasSimulations()) {

      // load simulation instances before loading households
      //
      loadSimulationInstances({
        success: () => {
          let simulationInstanceId = getSimulationInstanceId();
          loadHouseholds(simulationInstanceId, options);
        }
      });
    } else if (!window.households_request) {

      // load households for given instance
      //
      window.households_request = fetchHouseholds(simulationInstanceId, {
        success: (households) => {
          window.households_request = null;
          setHouseholds(households);

          // perform callback
          //
          if (options && options.success) {
            options.success();
          }
        }
      });
    }
  }

  function loadStepNumber(simulationInstanceId, options) {
    fetchStepNumber(simulationInstanceId, {
      success: (stepNumber) => {
        window.stepNumber = stepNumber;
        setStepNumber(stepNumber);

        // perform callback
        //
        if (options && options.success) {
          options.success();
        }
      }
    });
  }

  function loadStores(simulationInstanceId, options) {
    if (!simulationInstanceId) {
      return;
    }

    if (!hasSimulations()) {

      // load simulation instances before loading households
      //
      loadSimulationInstances({
        success: () => {
          loadStores(simulationInstanceId, options);
        }
      });
    } else {

      // load households for given instance
      //
      fetchStores(simulationInstanceId, {
        success: (stores) => {
          setStores(stores);

          // perform callback
          //
          if (options && options.success) {
            options.success();
          }
        }
      });
    }
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
      window.stepNumber = newStepNumber;
      setStepNumber(newStepNumber);
  };

  const updateCurrentSimulation = () => {
    let currentSimulationId = getSimulationInstanceId();
    if (currentSimulationId) {
      updateSimulation(currentSimulationId);
    }
  };

  const updateSimulation = (simulationInstanceId) => {
    if (hasSimulations()) {

      // clear previous simulation
      //
      setStores([]);
      setHouseholds([]);
      mapRef.clearAll();
      window.stepNumber = undefined;

      // load new simulation data
      //
      loadStores(simulationInstanceId);
      loadHouseholds(simulationInstanceId);
    } else {
      loadSimulationInstances({
        success: () => {
          updateSimulation(simulationInstanceId);
        }
      })
    }
  };

  function updateSimulations() {
    loadSimulationInstances({
      success: () => {
         let simulationInstanceId = getSimulationInstanceId();
         if (simulationInstanceId) {
          updateSimulation(simulationInstanceId);
          loadStepNumber(simulationInstanceId);
        }
      }
    });
  }

  window.updateSimulations = updateSimulations;

  //
  // react callbacks
  //

  useEffect(() => {
    updateSimulations();
  }, [])

  const [stores, setStores] = useState([]);
  const [households, setHouseholds] = useState([]);

  useEffect(() => {
    let simulationInstanceId = getSimulationInstanceId();
    if (simulationInstanceId) {
      loadStores(simulationInstanceId);
    }
  }, []);

  useEffect(() => {
    let simulationInstanceId = getSimulationInstanceId();
    if (simulationInstanceId) {
      loadHouseholds(simulationInstanceId);
    }
  }, [stepNumber]);

  useEffect(() => {
    if (!mapRef.current) {
      const { map, clear, clearAll, renderAll } = initializeMap('map', households, stores);
      mapRef.current = map;
      mapRef.clear = clear;
      mapRef.clearAll = clearAll;
      renderHouseholdsRef.current = renderAll;
    }
  }, []);

  useEffect(() => {
    if (!households || !stores) {
      return;
    }
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
                      <div className="space-y-4 flex flex-col items-center">
                        <select id="simulation-instances" className="rounded-lg" onChange={updateCurrentSimulation}>
                        </select>
                      </div>
                      <AddSimulationButton />
                      <RemoveSimulationButton />
                      <ResetButton/>
                    </div>

                    <br />

                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
                    <div className="space-y-4 flex flex-col items-center">
                      <AddStoreButton />
                      <RemoveStoreButton />
                      <StepButton updateStepNumber={updateStepNumber} />
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