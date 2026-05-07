import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../App';
import { HouseholdContext } from '../App';
import { client } from "../shared/client.js";
import { hasSimulations, hasSimulationInstance, getSimulationInstanceId, getSimulationStep } from '../App';

function parsePlaceName(placeName) {
    if (!placeName) return { county: '—', state: '—' };
    const parts = placeName.split(',').map(s => s.trim());
    return {
        county: parts[0] ?? '—',
        state:  parts[1] ?? '—',
    };
}


const DataComponent = () => {
    const {stepNumber, stores} = useContext(StoreContext)
    const {households} = useContext(HouseholdContext)
    const [numHouseholds, setNumHouseholds] = useState(0)
    const [numSPM, setNumSPM] = useState(0)
    const [numNonSPM, setNumNonSPM] = useState(0)
    const [avgIncome, setAvgIncome] = useState(0)
    const [avgVehicles, setAvgVehicles] = useState(0)
    const [county, setCounty] = useState('—'); 
    const [state, setState] = useState('—'); 
    const [currentInstanceId, setCurrentInstanceId] = useState(null);

    useEffect(() => {
        const instanceId = getSimulationInstanceId();
 
        // Only re-fetch if the instance has actually changed
        if (!instanceId || instanceId === currentInstanceId) return;
        setCurrentInstanceId(instanceId);
 
        const fetchLocationInfo = async () => {
            try {
                const response = await client.get(`/simulation-instances/${instanceId}`);
                const description = response.data?.simulation_instance?.description;
                if (description) {
                    try {
                        const parsed = JSON.parse(description);
                        const { county: c, state: s } = parsePlaceName(parsed.place_name);
                        setCounty(c);
                        setState(s);
                    } catch {
                        setCounty('—');
                        setState('—');
                    }
                }
            } catch (error) {
                console.error('Error fetching simulation instance info:', error);
            }
        };
 
        fetchLocationInfo();
    }, [stepNumber, stores, currentInstanceId]);

    useEffect(() => {
        const getNumStores = async () => {
            if (!hasSimulationInstance()) {
              return;
            }

           //  try {

                // add search params
                //
                const params = new URLSearchParams();
                params.append('simulation_instance_id', getSimulationInstanceId());
                params.append('simulation_step', getSimulationStep());

                const response = await client.get('/get-num-stores?' + params.toString());
                setNumSPM(response.data.numSPM);
                setNumNonSPM(response.data.numNonSPM);

            /*
            } catch (error) {
                console.error('Error fetching shared:', error);
            }
            */
        };

        getNumStores();
    }, [stepNumber, stores]); // Dependency on `step` means this effect runs when `step` changes
    
    useEffect(() => {

        // Triggered whenever `step` changes
        const getNumHouseholds = async () => {
            if (!hasSimulationInstance()) {
              return;
            }

            // add search params
            //
            const params = new URLSearchParams();
            params.append('simulation_instance_id', getSimulationInstanceId());
            params.append('simulation_step', getSimulationStep());

            try {
                const response = await client.get('/get-num-households?' + params.toString());
                setNumHouseholds(response.data.num_households);
            } catch (error) {
                console.error('Error fetching shared:', error);
            }

            // try {
            //     const response = await fetch(`${API_URL}/get-num-households`); // Your API endpoint
            //     const data = await response.json();
            //     setNumHouseholds(data.num_households);
            // } catch (error) {
            //     console.error("Error fetching households:", error);
            // }
        };

        const getHouseholdStats = async () => {
            if (!hasSimulationInstance()) {
              return;
            }

            try {

                // add search params
                //
                const params = new URLSearchParams();
                params.append('simulation_instance_id', getSimulationInstanceId());
                params.append('simulation_step', getSimulationStep());

                const response = await client.get('/get-household-stats?' + params.toString());
                setAvgIncome(response.data.avg_income);
                setAvgVehicles(response.data.avg_vehicles);
            } catch (error) {
                console.error('Error fetching shared:', error);
            }
            // try {
            //     const response = await fetch(`${API_URL}/get-household-stats`); // Your API endpoint
            //     const data = await response.json();
            //     setAvgIncome(data.avg_income)
            //     setAvgVehicles(data.avg_vehicles)
            // } catch (error) {
            //     console.error("Error fetching households:", error);
            // }
        };

        getHouseholdStats(); //technically households and household stats can just be run once on initialization 
        getNumHouseholds();
    }, [numHouseholds, households])

    const formatCurrency = (value) => {
        const currency = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
          }).format(value)
        return currency
    }

    return (
    <div>
        <b>Step: {stepNumber}</b>
        <p></p>
        <p>State: {state}</p>
        <p>County: {county}</p>
        <p>Household Count: {numHouseholds}</p>
        <p>Number of Supermarkets: {numSPM}</p>
        <p>Number of Convenience: {numNonSPM}</p>
        <p>Avg Household Income: {formatCurrency(avgIncome)}</p>
        <p>Avg Household Vehicles: {avgVehicles.toFixed(2)}</p>
    </div>
    );
};

export default DataComponent