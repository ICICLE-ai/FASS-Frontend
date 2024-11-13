import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../App';

const DataComponent = () => {
    const {stepNumber, stores} = useContext(StoreContext)
    const [numHouseholds, setNumHouseholds] = useState(0) 
    const [numSPM, setNumSPM] = useState(0)
    const [numNonSPM, setNumNonSPM] = useState(0)
    const [avgIncome, setAvgIncome] = useState(0)
    const [avgVehicles, setAvgVehicles] = useState(0)
    useEffect(() => {
        const getNumStores = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/get-num-stores'); // Your API endpoint
                const data = await response.json();
                setNumSPM(data.numSPM);
                setNumNonSPM(data.numNonSPM); 
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        };

            getNumStores();
    }, [stepNumber, stores]); // Dependency on `step` means this effect runs when `step` changes
    useEffect(()=>{
        // Triggered whenever `step` changes
        const getNumHouseholds = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/get-num-households'); // Your API endpoint
                const data = await response.json();
                setNumHouseholds(data.num_households); 
            } catch (error) {
                console.error("Error fetching households:", error);
            }
        };
        const getHouseholdStats = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/get-household-stats'); // Your API endpoint
                const data = await response.json();
                setAvgIncome(data.avg_income)
                setAvgVehicles(data.avg_vehicles)
            } catch (error) {
                console.error("Error fetching households:", error);
            }
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
        <p>SPM Count: {numSPM}</p>
        <p>CSPM Count: {numNonSPM}</p>
        <p>Avg Household Income: {formatCurrency(avgIncome)}
  </p>
        <p>Avg Household Vehicles: {avgVehicles.toFixed(2)}</p>
    </div>
    );

};

export default DataComponent