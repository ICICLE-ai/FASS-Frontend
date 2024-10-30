// Import necessary modules
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import proj4 from 'proj4';
import 'proj4leaflet';

const MyMapComponent = () => {
    const [households, setHouseholds] = useState([]);
    const [stores, setStores] = useState([]);

    useEffect(() => {
        // Function to fetch households data
        const fetchHouseholds = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/households');
                const data = await response.json();
                setHouseholds(data.households_json); // Assume data is an array of household objects
            } catch (error) {
                console.error("Error fetching households data:", error);
            }
        };
        const fetchStores = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/stores');
                const data = await response.json();
                setStores(data.stores_json); // Assume data is an array of store objects
            } catch (error) {
                console.error("Error fetching stores data:", error);
            }
        };

    fetchHouseholds();
    fetchStores();
    }, []); // Empty dependency array means this effect runs only once when the component mounts\

    // Define the source and destination projections
    const EPSG3857 = 'EPSG:3857';
    const EPSG4326 = 'EPSG:4326';

    // Configure proj4 with the EPSG:3857 and EPSG:4326 projections
    // I don't know why false northing is 27445. Just don't ask. It works.
    proj4.defs(EPSG3857, "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=27445 +datum=WGS84 +units=m +no_defs");
    proj4.defs(EPSG4326, "+proj=longlat +datum=WGS84 +no_defs");

    const projectToEPSG4326 = (coordinates) => {
    return coordinates.map(coord => {
        // Convert each coordinate from EPSG:3857 to EPSG:4326
        const [x, y] = coord;
        console.log(proj4(EPSG3857, EPSG4326, [x, y]).reverse())
        return proj4(EPSG3857, EPSG4326, [x, y]).reverse();
    });
    };

    // Helper function to parse WKT format
    const parsePolygon = (polygonString) => {
        // Expected format: "POLYGON ((lng lat, lng lat, ...))"
        return polygonString
        .replace("POLYGON ((", "")
        .replace("))", "")
        .split(", ")
        .map(coord => coord.split(" ").map(Number)); // Reverse to [lat, lng]
    };

    
    return (
        <div style={{ height: '75vh', width: '75vh' }}> {/* Set desired height and width */}
            <MapContainer center={[39.95073348838346, -82.99890139247076]} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {households.map((household) => (
                
                <Polygon key={household[0]} positions={projectToEPSG4326(parsePolygon(household[1]))}>
                    <Popup>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        Income: {household[2]}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Household Size: {household[3]}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Vehicles: {household[4]}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Number of Workers: {household[5]}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Popup>
                </Polygon>
            ))}
            {stores.map((store, index) => (
                
                <Polygon key={index} positions={projectToEPSG4326(parsePolygon(store[1]))}>
                    <Popup>
                        <table>
                            <tbody>
                                <tr>
                                    <td>
                                        Name: {store[2]}
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        Type: {store[0]}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </Popup>
                </Polygon>
            ))}

            </MapContainer>
        </div>
    );
};

export default MyMapComponent;
