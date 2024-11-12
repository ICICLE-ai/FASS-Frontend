import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../App';

const DataComponent = () => {
    const {stepNumber, stores} = useContext(StoreContext)
    const [numHouseholds, setNumHouseholds] = useState([0]) 
    const [numStores, setNumStores] = useState([0])
    useEffect(() => {
        // Triggered whenever `step` changes
        const getNumHouseholds = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/get-num-households'); // Your API endpoint
                const data = await response.json();
                setNumHouseholds(data.num_households); // Assuming your API returns a field `households_count`
            } catch (error) {
                console.error("Error fetching households:", error);
            }
        };

        const getNumStores = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/get-num-stores'); // Your API endpoint
                const data = await response.json();
                setNumStores(data.num_stores); // Assuming your API returns a field `households_count`
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        };

        
            getNumStores()
            getNumHouseholds(); // Only fetch if step is defined or has a valid value
        
    }, [stepNumber, stores]); // Dependency on `step` means this effect runs when `step` changes

    return (
    <div>
        <p>Number of Households: {numHouseholds}</p>
        <p>Number of Stores: {numStores}</p>
    </div>
    );

};

export default DataComponent