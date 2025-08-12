import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../App';
import { client } from "../shared/client.js";

const DataComponent = () => {
    const {stepNumber, stores} = useContext(StoreContext)
    const [numHouseholds, setNumHouseholds] = useState(0) 
    const [numSPM, setNumSPM] = useState(0)
    const [numNonSPM, setNumNonSPM] = useState(0)
    const [avgIncome, setAvgIncome] = useState(0)
    const [avgVehicles, setAvgVehicles] = useState(0)

    useEffect(() => {
        const getNumStores = async () => {
            if (!window.simulationInstance) {
              return;
            }

            try {

                // add search params
                //
                const params = new URLSearchParams();
                params.append('simulation_instance', window.simulationInstance);
                params.append('simulation_step', window.stepNumber);

                const response = await client.get('/get-num-stores?' + params.toString());
                setNumSPM(response.data.numSPM);
                setNumNonSPM(response.data.numNonSPM);
            } catch (error) {
                console.error('Error fetching shared:', error);
            }
            // try {
            //     const response = await fetch(`${API_URL}/get-num-stores`); // Your API endpoint
            //     const data = await response.json();
            //     setNumSPM(data.numSPM);
            //     setNumNonSPM(data.numNonSPM);
            // } catch (error) {
            //     console.error("Error fetching shared:", error);
            // }

        };

        getNumStores();
    }, [stepNumber, stores]); // Dependency on `step` means this effect runs when `step` changes
    useEffect(()=>{

        // Triggered whenever `step` changes
        const getNumHouseholds = async () => {
            if (!window.simulationInstance) {
              return;
            }

            try {
                const response = await client.get('/get-num-households');
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
            if (!window.simulationInstance) {
              return;
            }

            try {

                // add search params
                //
                const params = new URLSearchParams();
                params.append('simulation_instance_id', window.simulationInstance);
                params.append('simulation_step', window.stepNumber);

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
    },[])
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
        <p>State: Ohio</p>
        <p>County: Franklin</p>
        <p>Household Count: {numHouseholds}</p>
        <p>Number of Supermarkets: {numSPM}</p>
        <p>Number of Convenience: {numNonSPM}</p>
        <p>Avg Household Income: {formatCurrency(avgIncome)}</p>
        <p>Avg Household Vehicles: {avgVehicles.toFixed(2)}</p>
    </div>
    );

};

export default DataComponent